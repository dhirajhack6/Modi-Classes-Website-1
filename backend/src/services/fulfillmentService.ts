/**
 * Production-Safe Fulfillment Service for Modi Classes
 * 
 * Manages the decoupled fulfillment lifecycle:
 * PAYMENT_PENDING -> PAID -> SHIPMENT_PENDING -> SHIPMENT_CREATED -> AWB_ASSIGNED -> PICKUP_REQUESTED -> SHIPPED -> DELIVERED
 * 
 * Strict Business Rules:
 * 1. Prepaid only. Never creates shipments for unpaid/failed/pending payments.
 * 2. Idempotent: duplicate calls return existing Shiprocket IDs without duplicate creation.
 * 3. Failure isolation: Shiprocket/AWB failures never revert or corrupt the PAID payment status.
 * 4. Controlled activation: ENABLE_SHIPROCKET_AUTO_FULFILLMENT controls automated dispatch (default: false).
 * 5. Courier strategy: Configurable, non-hardcoded courier selection.
 * 6. Separate pickup: Pickup scheduling is a controlled subsequent step.
 */

import { Pool } from 'pg';
import { 
  createProductionShiprocketOrder, 
  checkShiprocketCourierServiceability, 
  assignShiprocketAwb, 
  requestShiprocketPickup,
  defaultCourierStrategy,
  ShiprocketCourierPartner 
} from './shiprocketService';

export type FulfillmentState = 
  | 'SHIPMENT_PENDING'
  | 'SHIPMENT_CREATED'
  | 'AWB_ASSIGNED'
  | 'PICKUP_REQUESTED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface FulfillmentStatusResponse {
  success: boolean;
  orderNumber: string;
  paymentStatus: string;
  fulfillmentStatus: FulfillmentState;
  fulfillmentError?: string | null;
  shiprocketOrderId?: string | null;
  shiprocketShipmentId?: string | null;
  shiprocketCourierId?: number | null;
  shiprocketCourierName?: string | null;
  awbCode?: string | null;
  trackingUrl?: string | null;
  pickupRequestId?: string | null;
  pickupStatus?: string | null;
  pickupScheduledDate?: string | null;
  lastShiprocketSyncAt?: string | null;
}

/**
 * Checks if automatic Shiprocket fulfillment is enabled.
 * Defaults to false for safe staged rollout and testing.
 */
export function isAutoFulfillmentEnabled(): boolean {
  return process.env.ENABLE_SHIPROCKET_AUTO_FULFILLMENT === 'true';
}

/**
 * Helper to fetch order from Database by ID or orderNumber
 */
async function fetchOrder(pool: Pool, orderIdentifier: string): Promise<any> {
  const res = await pool.query(
    'SELECT * FROM orders WHERE id = $1 OR "orderNumber" = $1',
    [orderIdentifier]
  );
  return res.rows[0] || null;
}

/**
 * Step 1: Hand-off when an order is genuinely verified as PAID.
 * Strictly checks that paymentStatus === 'PAID'.
 * Sets fulfillmentStatus = 'SHIPMENT_PENDING'.
 * If auto-fulfillment is enabled, triggers shipment creation; otherwise safely pauses for admin trigger.
 */
export async function handleOrderPaid(pool: Pool, orderIdentifier: string): Promise<{
  success: boolean;
  orderNumber: string;
  fulfillmentStatus: string;
  autoFulfillmentTriggered: boolean;
  message: string;
}> {
  const order = await fetchOrder(pool, orderIdentifier);
  if (!order) {
    throw new Error(`Order '${orderIdentifier}' not found.`);
  }

  const paymentStatus = (order.paymentStatus || '').toUpperCase();
  if (paymentStatus !== 'PAID') {
    throw new Error(`Security Violation: Cannot initiate fulfillment for order '${order.orderNumber}' because paymentStatus is '${paymentStatus}', expected 'PAID'.`);
  }

  // Ensure initial fulfillment status is set
  await pool.query(
    `UPDATE orders SET 
       "fulfillmentStatus" = COALESCE("fulfillmentStatus", 'SHIPMENT_PENDING'),
       "shippingStatus" = COALESCE("shippingStatus", 'SHIPMENT_PENDING')
     WHERE id = $1`,
    [order.id]
  );

  const autoEnabled = isAutoFulfillmentEnabled();

  if (autoEnabled) {
    console.log(`[Fulfillment] Auto-fulfillment is enabled. Creating Shiprocket shipment for order ${order.orderNumber}...`);
    try {
      await createShipmentForOrder(pool, order.id);
      await assignAwbForOrder(pool, order.id);
    } catch (err: any) {
      console.warn(`[Fulfillment] Auto-fulfillment step error for ${order.orderNumber}: ${err.message}. Order remains PAID.`);
    }
  } else {
    console.log(`[Fulfillment] Order ${order.orderNumber} is marked PAID. Automated Shiprocket dispatch is paused (ENABLE_SHIPROCKET_AUTO_FULFILLMENT=false). Ready for controlled admin fulfillment.`);
  }

  return {
    success: true,
    orderNumber: order.orderNumber,
    fulfillmentStatus: order.fulfillmentStatus || 'SHIPMENT_PENDING',
    autoFulfillmentTriggered: autoEnabled,
    message: autoEnabled 
      ? 'Order paid and auto-fulfillment triggered.' 
      : 'Order paid. Ready for admin fulfillment dispatch.'
  };
}

/**
 * Step 2: Idempotent Shiprocket Order & Shipment Creation.
 * Never creates duplicate Shiprocket shipments for the same website order.
 * If Shiprocket fails, order remains PAID and fulfillmentStatus remains SHIPMENT_PENDING.
 */
export async function createShipmentForOrder(pool: Pool, orderIdentifier: string): Promise<{
  success: boolean;
  orderNumber: string;
  shiprocketOrderId?: string;
  shiprocketShipmentId?: string;
  fulfillmentStatus: string;
  alreadyCreated?: boolean;
  error?: string;
}> {
  const order = await fetchOrder(pool, orderIdentifier);
  if (!order) {
    throw new Error(`Order '${orderIdentifier}' not found.`);
  }

  // CRITICAL RULE: Payment must be PAID
  if ((order.paymentStatus || '').toUpperCase() !== 'PAID') {
    return {
      success: false,
      orderNumber: order.orderNumber,
      fulfillmentStatus: order.fulfillmentStatus || 'SHIPMENT_PENDING',
      error: `Cannot create shipment: Order payment status is '${order.paymentStatus}', expected 'PAID'.`
    };
  }

  // IDEMPOTENCY: Check if Shiprocket order already exists in database
  if (order.shiprocketOrderId && order.shiprocketShipmentId) {
    console.log(`[Fulfillment] Order ${order.orderNumber} already has Shiprocket shipment (ID: ${order.shiprocketShipmentId}). Skipping duplicate creation.`);
    return {
      success: true,
      orderNumber: order.orderNumber,
      shiprocketOrderId: order.shiprocketOrderId,
      shiprocketShipmentId: order.shiprocketShipmentId,
      fulfillmentStatus: order.fulfillmentStatus || 'SHIPMENT_CREATED',
      alreadyCreated: true
    };
  }

  // Call Shiprocket adhoc creation
  const createRes = await createProductionShiprocketOrder(order);

  if (!createRes.success) {
    console.error(`[Fulfillment] Shiprocket order creation failed for ${order.orderNumber}:`, createRes.error);
    
    // Safety guarantee: order remains PAID, error recorded
    await pool.query(
      `UPDATE orders SET
         "fulfillmentStatus" = 'SHIPMENT_PENDING',
         "fulfillmentError" = $2,
         "lastShiprocketSyncAt" = $3
       WHERE id = $1`,
      [order.id, createRes.error || 'Shiprocket order creation failed', new Date().toISOString()]
    );

    return {
      success: false,
      orderNumber: order.orderNumber,
      fulfillmentStatus: 'SHIPMENT_PENDING',
      error: createRes.error
    };
  }

  // Update DB with created shipment IDs
  await pool.query(
    `UPDATE orders SET
       "fulfillmentStatus" = 'SHIPMENT_CREATED',
       "shippingStatus" = 'SHIPMENT_CREATED',
       "orderStatus" = 'processing',
       "shiprocketOrderId" = $2,
       "shiprocketShipmentId" = $3,
       "fulfillmentError" = NULL,
       "lastShiprocketSyncAt" = $4
     WHERE id = $1`,
    [
      order.id,
      createRes.shiprocketOrderId,
      createRes.shiprocketShipmentId,
      new Date().toISOString()
    ]
  );

  console.log(`[Fulfillment] Order ${order.orderNumber} created in Shiprocket. Order ID: ${createRes.shiprocketOrderId}, Shipment ID: ${createRes.shiprocketShipmentId}`);

  return {
    success: true,
    orderNumber: order.orderNumber,
    shiprocketOrderId: createRes.shiprocketOrderId,
    shiprocketShipmentId: createRes.shiprocketShipmentId,
    fulfillmentStatus: 'SHIPMENT_CREATED'
  };
}

/**
 * Step 3: Courier Selection Strategy and AWB Assignment.
 * Runs after shipment is created.
 * Uses configurable courier strategy (prefer recommended -> high rated -> lowest cost).
 * Idempotent: returns existing AWB without duplicate assignment.
 */
export async function assignAwbForOrder(
  pool: Pool, 
  orderIdentifier: string, 
  preferredCourierId?: number
): Promise<{
  success: boolean;
  orderNumber: string;
  shiprocketShipmentId?: string;
  awbCode?: string;
  courierName?: string;
  courierCompanyId?: number;
  fulfillmentStatus: string;
  alreadyAssigned?: boolean;
  error?: string;
}> {
  const order = await fetchOrder(pool, orderIdentifier);
  if (!order) {
    throw new Error(`Order '${orderIdentifier}' not found.`);
  }

  if ((order.paymentStatus || '').toUpperCase() !== 'PAID') {
    return {
      success: false,
      orderNumber: order.orderNumber,
      fulfillmentStatus: order.fulfillmentStatus || 'SHIPMENT_PENDING',
      error: 'Cannot assign AWB: Order payment is not confirmed as PAID.'
    };
  }

  if (!order.shiprocketShipmentId) {
    return {
      success: false,
      orderNumber: order.orderNumber,
      fulfillmentStatus: order.fulfillmentStatus || 'SHIPMENT_PENDING',
      error: 'Cannot assign AWB: Shiprocket shipment has not been created yet. Run createShipmentForOrder first.'
    };
  }

  // IDEMPOTENCY: Check if AWB is already assigned
  if (order.awbCode) {
    console.log(`[Fulfillment] Order ${order.orderNumber} already has AWB (${order.awbCode}). Skipping duplicate assignment.`);
    return {
      success: true,
      orderNumber: order.orderNumber,
      shiprocketShipmentId: order.shiprocketShipmentId,
      awbCode: order.awbCode,
      courierName: order.shiprocketCourierName || order.courierPartner,
      courierCompanyId: order.shiprocketCourierId,
      fulfillmentStatus: order.fulfillmentStatus || 'AWB_ASSIGNED',
      alreadyAssigned: true
    };
  }

  const shipmentId = Number(order.shiprocketShipmentId);
  const addr = typeof order.shippingAddress === 'string' 
    ? JSON.parse(order.shippingAddress) 
    : (order.shippingAddress || {});
  const deliveryPincode = String(addr.pincode || '').replace(/[^0-9]/g, '').slice(0, 6);

  let selectedCourierId = preferredCourierId;
  let selectedCourier: ShiprocketCourierPartner | null = null;

  // If no specific courier ID was forced, run the Courier Selection Strategy
  if (!selectedCourierId) {
    const servRes = await checkShiprocketCourierServiceability(deliveryPincode, 0.6);
    if (!servRes.success || servRes.couriers.length === 0) {
      const err = servRes.error || 'No serviceable courier partner found for this destination pincode.';
      await pool.query(
        `UPDATE orders SET "fulfillmentError" = $2, "lastShiprocketSyncAt" = $3 WHERE id = $1`,
        [order.id, `Courier selection failed: ${err}`, new Date().toISOString()]
      );
      return {
        success: false,
        orderNumber: order.orderNumber,
        fulfillmentStatus: order.fulfillmentStatus || 'SHIPMENT_CREATED',
        error: err
      };
    }

    selectedCourier = defaultCourierStrategy(servRes.couriers, servRes.recommended_courier_company_id);
    if (!selectedCourier) {
      return {
        success: false,
        orderNumber: order.orderNumber,
        fulfillmentStatus: order.fulfillmentStatus || 'SHIPMENT_CREATED',
        error: 'No serviceable courier partner passed selection criteria.'
      };
    }

    selectedCourierId = selectedCourier.courier_company_id;
  }

  // Assign AWB via Shiprocket
  const awbRes = await assignShiprocketAwb(shipmentId, selectedCourierId);

  if (!awbRes.success) {
    console.error(`[Fulfillment] AWB assignment failed for ${order.orderNumber}:`, awbRes.error);
    await pool.query(
      `UPDATE orders SET
         "fulfillmentError" = $2,
         "lastShiprocketSyncAt" = $3
       WHERE id = $1`,
      [order.id, awbRes.error || 'AWB assignment failed', new Date().toISOString()]
    );
    return {
      success: false,
      orderNumber: order.orderNumber,
      fulfillmentStatus: order.fulfillmentStatus || 'SHIPMENT_CREATED',
      error: awbRes.error
    };
  }

  const assignedAwb = awbRes.shiprocket?.awb_code;
  const courierName = awbRes.shiprocket?.courier_name || selectedCourier?.courier_name || 'Delhivery Express';
  const trackingUrl = `https://shiprocket.co/tracking/${assignedAwb}`;

  await pool.query(
    `UPDATE orders SET
       "fulfillmentStatus" = 'AWB_ASSIGNED',
       "shippingStatus" = 'AWB_ASSIGNED',
       "awbCode" = $2,
       "trackingNumber" = $2,
       "shiprocketCourierId" = $3,
       "shiprocketCourierName" = $4,
       "courierPartner" = $4,
       "shipmentTrackingUrl" = $5,
       "fulfillmentError" = NULL,
       "lastShiprocketSyncAt" = $6
     WHERE id = $1`,
    [
      order.id,
      assignedAwb,
      selectedCourierId,
      courierName,
      trackingUrl,
      new Date().toISOString()
    ]
  );

  console.log(`[Fulfillment] Order ${order.orderNumber} assigned AWB ${assignedAwb} via ${courierName}`);

  return {
    success: true,
    orderNumber: order.orderNumber,
    shiprocketShipmentId: order.shiprocketShipmentId,
    awbCode: assignedAwb,
    courierName,
    courierCompanyId: selectedCourierId,
    fulfillmentStatus: 'AWB_ASSIGNED'
  };
}

/**
 * Step 4: Controlled Separate Pickup Request.
 * Only callable after AWB has been assigned.
 * Idempotent: returns existing pickup ID if already requested.
 */
export async function requestPickupForOrder(
  pool: Pool, 
  orderIdentifier: string, 
  pickupDate?: string
): Promise<{
  success: boolean;
  orderNumber: string;
  pickupRequestId?: string;
  pickupStatus?: string;
  pickupScheduledDate?: string;
  fulfillmentStatus: string;
  alreadyRequested?: boolean;
  error?: string;
}> {
  const order = await fetchOrder(pool, orderIdentifier);
  if (!order) {
    throw new Error(`Order '${orderIdentifier}' not found.`);
  }

  if (!order.awbCode || !order.shiprocketShipmentId) {
    return {
      success: false,
      orderNumber: order.orderNumber,
      fulfillmentStatus: order.fulfillmentStatus || 'SHIPMENT_PENDING',
      error: 'Cannot schedule pickup: Order must have an assigned AWB code before requesting courier pickup.'
    };
  }

  // IDEMPOTENCY: Check if pickup already requested
  if (order.pickupRequestId) {
    console.log(`[Fulfillment] Order ${order.orderNumber} already has pickup requested (ID: ${order.pickupRequestId}).`);
    return {
      success: true,
      orderNumber: order.orderNumber,
      pickupRequestId: order.pickupRequestId,
      pickupStatus: order.pickupStatus || 'PICKUP_SCHEDULED',
      pickupScheduledDate: order.pickupScheduledDate,
      fulfillmentStatus: order.fulfillmentStatus || 'PICKUP_REQUESTED',
      alreadyRequested: true
    };
  }

  const shipmentId = Number(order.shiprocketShipmentId);
  const pickupRes = await requestShiprocketPickup(shipmentId, pickupDate);

  if (!pickupRes.success) {
    console.error(`[Fulfillment] Pickup request failed for ${order.orderNumber}:`, pickupRes.error);
    await pool.query(
      `UPDATE orders SET "fulfillmentError" = $2, "lastShiprocketSyncAt" = $3 WHERE id = $1`,
      [order.id, pickupRes.error || 'Pickup request failed', new Date().toISOString()]
    );
    return {
      success: false,
      orderNumber: order.orderNumber,
      fulfillmentStatus: order.fulfillmentStatus || 'AWB_ASSIGNED',
      error: pickupRes.error
    };
  }

  await pool.query(
    `UPDATE orders SET
       "fulfillmentStatus" = 'PICKUP_REQUESTED',
       "shippingStatus" = 'PICKUP_REQUESTED',
       "pickupRequestId" = $2,
       "pickupStatus" = $3,
       "pickupScheduledDate" = $4,
       "fulfillmentError" = NULL,
       "lastShiprocketSyncAt" = $5
     WHERE id = $1`,
    [
      order.id,
      pickupRes.pickupRequestId,
      pickupRes.pickupStatus || 'PICKUP_SCHEDULED',
      pickupRes.pickupScheduledDate,
      new Date().toISOString()
    ]
  );

  console.log(`[Fulfillment] Order ${order.orderNumber} pickup scheduled. Request ID: ${pickupRes.pickupRequestId}`);

  return {
    success: true,
    orderNumber: order.orderNumber,
    pickupRequestId: pickupRes.pickupRequestId,
    pickupStatus: pickupRes.pickupStatus,
    pickupScheduledDate: pickupRes.pickupScheduledDate,
    fulfillmentStatus: 'PICKUP_REQUESTED'
  };
}

/**
 * Get comprehensive fulfillment status for an order
 */
export async function getOrderFulfillmentStatus(pool: Pool, orderIdentifier: string): Promise<FulfillmentStatusResponse | null> {
  const order = await fetchOrder(pool, orderIdentifier);
  if (!order) return null;

  return {
    success: true,
    orderNumber: order.orderNumber,
    paymentStatus: order.paymentStatus || 'PAYMENT_PENDING',
    fulfillmentStatus: order.fulfillmentStatus || order.shippingStatus || 'SHIPMENT_PENDING',
    fulfillmentError: order.fulfillmentError || null,
    shiprocketOrderId: order.shiprocketOrderId || null,
    shiprocketShipmentId: order.shiprocketShipmentId || null,
    shiprocketCourierId: order.shiprocketCourierId || null,
    shiprocketCourierName: order.shiprocketCourierName || order.courierPartner || null,
    awbCode: order.awbCode || null,
    trackingUrl: order.shipmentTrackingUrl || (order.awbCode ? `https://shiprocket.co/tracking/${order.awbCode}` : null),
    pickupRequestId: order.pickupRequestId || null,
    pickupStatus: order.pickupStatus || null,
    pickupScheduledDate: order.pickupScheduledDate || null,
    lastShiprocketSyncAt: order.lastShiprocketSyncAt || null
  };
}
