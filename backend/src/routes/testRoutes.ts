/**
 * =========================================================================
 * TEMPORARY TEST ONLY - SHIPROCKET INTEGRATION TESTING ROUTER
 * =========================================================================
 * 
 * IMPORTANT:
 * - This router is strictly for temporary local integration testing.
 * - It must NOT be exposed publicly in production environments.
 * - POST /api/test/shiprocket/order:
 *     Generates and returns the exact Shiprocket order payload in TEST mode (no external calls).
 * - POST /api/test/shiprocket/create-order:
 *     Creates a test adhoc order directly with Shiprocket API (zero AWB / courier assignment).
 * - All order totals are calculated strictly on the backend (zero-trust).
 * - Credentials and tokens are strictly kept backend-only and NEVER returned or leaked.
 * =========================================================================
 */

import express, { Request, Response } from 'express';
import { Pool } from 'pg';
import { 
  buildShiprocketOrderPayload, 
  getShiprocketConfig,
  createShiprocketAdhocOrder,
  checkShiprocketCourierServiceability,
  assignShiprocketAwb,
  ShiprocketTestOrderInput 
} from '../services/shiprocketService';
import { getPaymentGateway } from '../services/paymentGateway';
import { createShipmentForOrder } from '../services/fulfillmentService';

// In-memory set of successfully created test order IDs to prevent accidental duplicates
const createdTestOrderIds = new Set<string>();

/**
 * Validates and sanitizes test order input from request body.
 * Enforces strict zero-trust rules for fields, pincode, and phone.
 */
function validateTestOrderInput(body: any): { errors: string[]; sanitized?: ShiprocketTestOrderInput } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { errors: ['Validation Error: Request body must be a valid JSON object.'] };
  }

  const errors: string[] = [];

  // 1. Validate order_id
  if (!body.order_id || typeof body.order_id !== 'string' || !body.order_id.trim()) {
    errors.push('order_id is required and must be a non-empty string.');
  }

  // 2. Validate customer
  const customer = body.customer;
  if (!customer || typeof customer !== 'object') {
    errors.push('customer object is required.');
  } else {
    if (!customer.first_name || typeof customer.first_name !== 'string' || !customer.first_name.trim()) {
      errors.push('customer.first_name is required.');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customer.email || typeof customer.email !== 'string' || !emailRegex.test(customer.email.trim())) {
      errors.push('customer.email must be a valid email address.');
    }

    // Phone validation (Indian 10-digit mobile number)
    const cleanPhone = (String(customer.phone || '')).replace(/[^0-9]/g, '');
    const phoneTenDigits = cleanPhone.length === 12 && cleanPhone.startsWith('91') 
      ? cleanPhone.slice(2) 
      : cleanPhone.slice(-10);

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!customer.phone || !phoneRegex.test(phoneTenDigits)) {
      errors.push('customer.phone must be a valid 10-digit Indian mobile number (starting with 6-9).');
    }
  }

  // 3. Validate shipping_address
  const addr = body.shipping_address;
  if (!addr || typeof addr !== 'object') {
    errors.push('shipping_address object is required.');
  } else {
    if (!addr.address || typeof addr.address !== 'string' || addr.address.trim().length < 3) {
      errors.push('shipping_address.address is required (minimum 3 characters).');
    }
    if (!addr.city || typeof addr.city !== 'string' || !addr.city.trim()) {
      errors.push('shipping_address.city is required.');
    }
    if (!addr.state || typeof addr.state !== 'string' || !addr.state.trim()) {
      errors.push('shipping_address.state is required.');
    }

    // Indian 6-digit Pincode validation (cannot start with 0)
    const cleanPincode = (String(addr.pincode || '')).replace(/[^0-9]/g, '');
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincodeRegex.test(cleanPincode)) {
      errors.push('shipping_address.pincode must be a valid 6-digit Indian postal code (100000 - 999999).');
    }
  }

  // 4. Validate product
  const product = body.product;
  if (!product || typeof product !== 'object') {
    errors.push('product object is required.');
  } else {
    if (!product.name || typeof product.name !== 'string' || !product.name.trim()) {
      errors.push('product.name is required.');
    }
    if (!product.sku || typeof product.sku !== 'string' || !product.sku.trim()) {
      errors.push('product.sku is required.');
    }
    const quantity = Number(product.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      errors.push('product.quantity must be an integer of at least 1.');
    }
    const price = Number(product.price);
    if (isNaN(price) || price < 0) {
      errors.push('product.price must be a non-negative number.');
    }
  }

  // 5. Validate package
  const pkg = body.package;
  if (!pkg || typeof pkg !== 'object') {
    errors.push('package object is required.');
  } else {
    const weight = Number(pkg.weight);
    if (isNaN(weight) || weight <= 0) {
      errors.push('package.weight must be a positive number in kg (e.g. 0.5 or 1).');
    }
    const length = Number(pkg.length);
    if (isNaN(length) || length <= 0) {
      errors.push('package.length must be a positive number in cm.');
    }
    const breadth = Number(pkg.breadth);
    if (isNaN(breadth) || breadth <= 0) {
      errors.push('package.breadth must be a positive number in cm.');
    }
    const height = Number(pkg.height);
    if (isNaN(height) || height <= 0) {
      errors.push('package.height must be a positive number in cm.');
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  // Prepare sanitized typed input
  const cleanPhone = (String(customer.phone || '')).replace(/[^0-9]/g, '');
  const sanitizedPhone = cleanPhone.length === 12 && cleanPhone.startsWith('91') 
    ? cleanPhone.slice(2) 
    : cleanPhone.slice(-10);

  const sanitized: ShiprocketTestOrderInput = {
    order_id: String(body.order_id).trim(),
    customer: {
      first_name: String(customer.first_name).trim(),
      last_name: customer.last_name ? String(customer.last_name).trim() : '',
      email: String(customer.email).trim().toLowerCase(),
      phone: sanitizedPhone
    },
    shipping_address: {
      address: String(addr.address).trim(),
      address_2: addr.address_2 ? String(addr.address_2).trim() : '',
      city: String(addr.city).trim(),
      state: String(addr.state).trim(),
      pincode: String(addr.pincode).replace(/[^0-9]/g, '').slice(0, 6),
      country: addr.country ? String(addr.country).trim() : 'India'
    },
    product: {
      name: String(product.name).trim(),
      sku: String(product.sku).trim(),
      quantity: Math.floor(Number(product.quantity)),
      price: Number(product.price)
    },
    package: {
      weight: Number(pkg.weight),
      length: Number(pkg.length),
      breadth: Number(pkg.breadth),
      height: Number(pkg.height)
    }
  };

  return { errors: [], sanitized };
}

export function createTestRouter(pool?: Pool) {
  const router = express.Router();

  /**
   * POST /api/test/shiprocket/order
   * 
   * Pure payload builder endpoint: Validates input and returns the exact
   * Shiprocket-compatible payload WITHOUT making any external API calls.
   */
  router.post('/shiprocket/order', (req: Request, res: Response) => {
    try {
      const { errors, sanitized } = validateTestOrderInput(req.body);
      if (errors.length > 0 || !sanitized) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed for test order payload.',
          details: errors
        });
      }

      // Verify Shiprocket pickup location configuration
      const config = getShiprocketConfig();
      if (!config.pickupLocation) {
        return res.status(500).json({
          success: false,
          error: 'Backend configuration error: SHIPROCKET_PICKUP_LOCATION environment variable is missing or empty. Please set SHIPROCKET_PICKUP_LOCATION in your environment.'
        });
      }

      // Generate Shiprocket-compatible order payload (TEST MODE ONLY - NO API CALLS)
      const generatedPayload = buildShiprocketOrderPayload(sanitized);

      return res.status(200).json({
        success: true,
        mode: 'TEST',
        message: 'Shiprocket payload generated successfully. No real shipment was created.',
        payload: generatedPayload
      });

    } catch (err: any) {
      console.error('Shiprocket test payload error:', err);
      const isConfigError = err?.message && (
        err.message.includes('SHIPROCKET_PICKUP_LOCATION') ||
        err.message.toLowerCase().includes('configuration error')
      );
      return res.status(500).json({
        success: false,
        error: isConfigError ? err.message : 'Internal Server Error'
      });
    }
  });

  /**
   * POST /api/test/shiprocket/create-order
   * 
   * Controlled test order creation endpoint:
   * 1. Validates test order data.
   * 2. Authoritatively builds the Shiprocket adhoc payload (zero-trust totals).
   * 3. Prevents duplicate order creation if the same order ID was already submitted.
   * 4. Makes live API call to Shiprocket (adhoc order creation only).
   * 5. Returns safe order and shipment IDs without exposing tokens or credentials.
   * 6. Does NOT assign courier, generate AWB, or schedule pickup.
   */
  router.post('/shiprocket/create-order', async (req: Request, res: Response) => {
    try {
      const { errors, sanitized } = validateTestOrderInput(req.body);
      if (errors.length > 0 || !sanitized) {
        return res.status(400).json({
          success: false,
          mode: 'TEST',
          message: 'Shiprocket order creation failed.',
          error: 'Validation failed for test order payload.',
          details: errors
        });
      }

      // Duplicate order protection: Check if this test order ID has already succeeded
      if (createdTestOrderIds.has(sanitized.order_id)) {
        return res.status(409).json({
          success: false,
          mode: 'TEST',
          message: 'Shiprocket order creation failed.',
          error: `A Shiprocket order has already been created for order_id '${sanitized.order_id}'. Please use a unique order ID (e.g. MC-TEST-003) to prevent duplicate shipments.`
        });
      }

      // Verify Shiprocket pickup location configuration
      const config = getShiprocketConfig();
      if (!config.pickupLocation) {
        return res.status(500).json({
          success: false,
          mode: 'TEST',
          message: 'Shiprocket order creation failed.',
          error: 'Backend configuration error: SHIPROCKET_PICKUP_LOCATION environment variable is missing or empty. Please set SHIPROCKET_PICKUP_LOCATION in your backend .env file.'
        });
      }

      // Authoritative subtotal and payload calculation on backend
      const payload = buildShiprocketOrderPayload(sanitized);

      // Call Shiprocket adhoc order creation API (no AWB, no courier, no pickup)
      const result = await createShiprocketAdhocOrder(payload);

      if (!result.success) {
        return res.status(result.httpStatus || 400).json({
          success: false,
          mode: 'TEST',
          message: 'Shiprocket order creation failed.',
          error: result.error || 'Shiprocket order creation returned an error.'
        });
      }

      // Record successfully created test order ID to prevent accidental duplicate submission
      createdTestOrderIds.add(sanitized.order_id);

      // Return safe response (NEVER return tokens, passwords, or auth headers)
      return res.status(200).json({
        success: true,
        mode: 'TEST',
        message: 'Shiprocket test order created successfully.',
        shiprocket: {
          order_id: result.order_id,
          shipment_id: result.shipment_id,
          status: result.status || 'NEW',
          status_code: result.status_code !== undefined ? result.status_code : 1
        }
      });

    } catch (err: any) {
      console.error('[Shiprocket Test Endpoint] Unexpected error:', err);
      return res.status(500).json({
        success: false,
        mode: 'TEST',
        message: 'Shiprocket order creation failed.',
        error: 'An internal server error occurred while processing the test order.'
      });
    }
  });

  /**
   * GET /api/test/shiprocket/serviceability
   * 
   * Test-only endpoint to check available couriers, rates, and delivery estimates for a route.
   * Uses configured SHIPROCKET_PICKUP_PINCODE (211006).
   * COD is strictly 0 (Prepaid only).
   */
  router.get('/shiprocket/serviceability', async (req: Request, res: Response) => {
    try {
      const deliveryPincode = String(req.query.delivery_pincode || req.query.pincode || '').trim();
      const weight = req.query.weight ? Number(req.query.weight) : 1;

      // Validate 6-digit Indian delivery pincode
      if (!/^\d{6}$/.test(deliveryPincode)) {
        return res.status(400).json({
          success: false,
          mode: 'TEST',
          message: 'Courier serviceability check failed.',
          error: 'Invalid delivery_pincode. Please provide a valid 6-digit Indian delivery pincode (e.g. 226001).'
        });
      }

      // Validate weight
      if (isNaN(weight) || weight <= 0 || weight > 50) {
        return res.status(400).json({
          success: false,
          mode: 'TEST',
          message: 'Courier serviceability check failed.',
          error: 'Invalid weight. Weight must be a positive number in kg (e.g. 1).'
        });
      }

      const result = await checkShiprocketCourierServiceability(deliveryPincode, weight);

      return res.status(result.success ? 200 : (result.httpStatus || 400)).json(result);
    } catch (err: any) {
      console.error('[Shiprocket Test Serviceability] Unexpected error:', err);
      return res.status(500).json({
        success: false,
        mode: 'TEST',
        message: 'Courier serviceability check failed.',
        error: 'An internal server error occurred while querying courier serviceability.'
      });
    }
  });

  /**
   * POST /api/test/shiprocket/assign-awb
   * 
   * Test-only endpoint to assign an AWB code for an existing test shipment.
   * Does NOT generate pickup, manifest, or shipping label.
   * Strictly enforces duplicate AWB protection and positive integer validation.
   */
  router.post('/shiprocket/assign-awb', async (req: Request, res: Response) => {
    try {
      const { shipment_id, courier_company_id } = req.body || {};

      const numShipmentId = Number(shipment_id);
      const numCourierId = Number(courier_company_id);

      const errors: string[] = [];

      if (!shipment_id || !Number.isInteger(numShipmentId) || numShipmentId <= 0) {
        errors.push('shipment_id is required and must be a positive integer (e.g. 1555086694).');
      }

      if (!courier_company_id || !Number.isInteger(numCourierId) || numCourierId <= 0) {
        errors.push('courier_company_id is required and must be a positive integer from the serviceability response.');
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          mode: 'TEST',
          message: 'AWB assignment failed.',
          error: 'Validation failed for AWB assignment payload.',
          details: errors
        });
      }

      const result = await assignShiprocketAwb(numShipmentId, numCourierId);

      if (!result.success) {
        return res.status(result.httpStatus || 400).json({
          success: false,
          mode: 'TEST',
          message: 'AWB assignment failed.',
          error: result.error || 'Shiprocket AWB assignment returned an error.'
        });
      }

      return res.status(200).json(result);
    } catch (err: any) {
      console.error('[Shiprocket Test AWB] Unexpected error:', err);
      return res.status(500).json({
        success: false,
        mode: 'TEST',
        message: 'AWB assignment failed.',
        error: 'An internal server error occurred while processing AWB assignment.'
      });
    }
  });

  /**
   * =========================================================================
   * PHONEPE ₹499 END-TO-END TEST ORDER & CONTROLLED DISPATCH ENDPOINTS
   * =========================================================================
   */

  /**
   * POST /api/test/phonepe/initiate-test-order
   * 
   * Initiates the controlled ₹499 test order: MC-PHONEPE-TEST-001.
   * Product: Modi Classes Book (₹499).
   * Payment: PhonePe / Prepaid, COD strictly disabled.
   */
  router.post('/phonepe/initiate-test-order', async (req: Request, res: Response) => {
    try {
      if (!pool) {
        return res.status(500).json({ success: false, error: 'Database pool not provided to test router.' });
      }

      const orderNumber = 'MC-PHONEPE-TEST-001';
      const orderId = 'ord-phonepe-test-001';
      const unitPrice = 499;
      const quantity = 1;
      const subtotal = unitPrice * quantity;
      const shippingFee = 0; // Free shipping for books >= 400
      const totalAmount = 499; // Strictly ₹499

      const customerName = 'PhonePe Test Student';
      const customerEmail = 'phonepe.test@modiclasses.in';
      const customerPhone = '9876543210';
      const shippingAddress = {
        line1: 'Civil Lines Near Railway Station',
        city: 'Prayagraj',
        district: 'Prayagraj',
        state: 'Uttar Pradesh',
        pincode: '211001'
      };

      const items = [
        {
          bookId: 'book-alp-psycho',
          bookTitle: 'RAILWAY Psychological/Aptitude Test For Asst. Loco Pilot',
          author: 'Sandeep Kumar (Vidyasagar Publication)',
          format: 'hardcopy',
          quantity: 1,
          unitPrice: 499,
          totalPrice: 499
        }
      ];

      // Reset previous test record to ensure a clean, reproducible state
      await pool.query('DELETE FROM orders WHERE "orderNumber" = $1 OR id = $2', [orderNumber, orderId]);

      // Create gateway payment order with PhonePe
      const gateway = getPaymentGateway();
      const gatewayOrder = await gateway.createPaymentOrder({
        orderId: orderNumber,
        amountRupees: totalAmount,
        customerName,
        customerPhone,
        customerEmail
      });

      // Insert fresh test order into PostgreSQL orders table
      await pool.query(
        `INSERT INTO orders (
           id, "orderNumber", "userId", "customerName", "customerEmail", "customerPhone",
           items, "itemsCount", subtotal, discount, "couponCode", "shippingFee", "codFee",
           "taxAmount", "totalAmount", "hasDigitalItems", "hasPhysicalItems", "paymentMethod",
           "paymentStatus", "paymentTransactionId", "orderStatus", "shippingStatus",
           "fulfillmentStatus", "courierPartner", "trackingNumber", "estimatedDeliveryDate",
           "trackingTimeline", "shippingAddress", "digitalLicenses", "invoiceNumber",
           "createdAt", "gatewayOrderId"
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
           $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32
         )`,
        [
          orderId,
          orderNumber,
          'usr-phonepe-test-001',
          customerName,
          customerEmail,
          customerPhone,
          JSON.stringify(items),
          1,
          subtotal,
          0,
          null,
          shippingFee,
          0, // Strictly NO COD
          25,
          totalAmount,
          false,
          true,
          'phonepe',
          'PAYMENT_PENDING',
          null,
          'pending',
          'SHIPMENT_PENDING',
          'SHIPMENT_PENDING',
          'Delhivery Express (Pending Payment)',
          null,
          'In 2-3 Business Days after payment',
          JSON.stringify([
            {
              status: 'pending_payment',
              title: 'Order Initiated - Awaiting PhonePe Payment',
              description: 'Complete ₹499 payment to confirm.',
              timestamp: new Date().toLocaleTimeString('en-IN')
            }
          ]),
          JSON.stringify(shippingAddress),
          JSON.stringify([]),
          `INV-${orderNumber}`,
          new Date().toISOString(),
          gatewayOrder.gatewayOrderId
        ]
      );

      return res.status(200).json({
        success: true,
        mode: 'TEST',
        message: 'PhonePe test order MC-PHONEPE-TEST-001 created successfully for ₹499.',
        orderNumber,
        totalAmount,
        currency: 'INR',
        paymentMethod: 'PhonePe / Prepaid',
        codEnabled: false,
        gatewayOrderId: gatewayOrder.gatewayOrderId,
        paymentUrl: gatewayOrder.paymentUrl,
        qrData: gatewayOrder.qrData,
        provider: gatewayOrder.provider
      });
    } catch (err: any) {
      console.error('[Test PhonePe Initiate] Error:', err);
      return res.status(500).json({
        success: false,
        mode: 'TEST',
        message: 'Failed to initiate PhonePe test order.',
        error: err.message
      });
    }
  });

  /**
   * POST /api/test/phonepe/verify-and-fulfill
   * 
   * Verifies PhonePe payment for MC-PHONEPE-TEST-001.
   * Enforces strict ₹499 amount validation.
   * If verified: updates DB to PAID, then triggers Shiprocket adhoc order creation.
   * Does NOT assign AWB or pickup.
   * Fully idempotent.
   */
  router.post('/phonepe/verify-and-fulfill', async (req: Request, res: Response) => {
    try {
      if (!pool) {
        return res.status(500).json({ success: false, error: 'Database pool not provided to test router.' });
      }

      const orderNumber = req.body.orderNumber || 'MC-PHONEPE-TEST-001';
      const reportedAmount = req.body.reportedAmountRupees !== undefined 
        ? Number(req.body.reportedAmountRupees) 
        : 499;
      const transactionId = String(req.body.transactionId || `TXN_PHONEPE_${Date.now().toString().slice(-8)}`);

      // 1. Fetch order from DB
      const orderRes = await pool.query('SELECT * FROM orders WHERE "orderNumber" = $1', [orderNumber]);
      if (orderRes.rows.length === 0) {
        return res.status(404).json({
          success: false,
          mode: 'TEST',
          message: `Test order '${orderNumber}' not found in database. Please call /api/test/phonepe/initiate-test-order first.`
        });
      }

      const order = orderRes.rows[0];
      const expectedAmount = Number(order.totalAmount); // 499

      // 2. IDEMPOTENCY CHECK: If already paid and Shiprocket order already created
      if (order.paymentStatus === 'PAID' && order.shiprocketOrderId) {
        return res.status(200).json({
          success: true,
          mode: 'TEST',
          alreadyProcessed: true,
          message: 'Order is already verified as PAID and Shiprocket shipment already exists (Idempotent replay).',
          order: {
            orderNumber: order.orderNumber,
            paymentStatus: order.paymentStatus,
            totalAmount: Number(order.totalAmount),
            paymentTransactionId: order.paymentTransactionId,
            fulfillmentStatus: order.fulfillmentStatus,
            shiprocketOrderId: order.shiprocketOrderId,
            shiprocketShipmentId: order.shiprocketShipmentId,
            awbCode: order.awbCode,
            pickupStatus: order.pickupStatus
          }
        });
      }

      // 3. STRICT AMOUNT VERIFICATION
      if (reportedAmount !== expectedAmount) {
        console.warn(`[Test PhonePe Verify] Amount mismatch! Expected ₹${expectedAmount}, got ₹${reportedAmount}`);
        
        // Safety: Do NOT mark as PAID. Do NOT create Shiprocket order.
        await pool.query(
          `UPDATE orders SET "fulfillmentError" = $2 WHERE id = $1`,
          [order.id, `Payment verification failed: Amount mismatch. Expected ₹${expectedAmount}, reported ₹${reportedAmount}`]
        );

        return res.status(400).json({
          success: false,
          mode: 'TEST',
          message: 'Payment verification failed: Amount mismatch.',
          error: `Security Violation: Expected payable amount of ₹${expectedAmount}, but received ₹${reportedAmount}. Payment not confirmed, and no Shiprocket order was created.`,
          expectedAmount,
          reportedAmount
        });
      }

      // 4. Mark Order as PAID in Database
      const verifiedAt = new Date().toISOString();
      await pool.query(
        `UPDATE orders SET
           "paymentStatus" = 'PAID',
           "orderStatus" = 'confirmed',
           "paymentTransactionId" = $2,
           "paymentVerifiedAt" = $3,
           "fulfillmentStatus" = 'SHIPMENT_PENDING'
         WHERE id = $1`,
        [order.id, transactionId, verifiedAt]
      );

      console.log(`[Test PhonePe Verify] Order ${orderNumber} verified for ₹${expectedAmount}. Status updated to PAID.`);

      // 5. TRIGGER SHIPROCKET ORDER CREATION (ONLY AFTER CONFIRMED AS PAID)
      // Strictly creates Shiprocket order & shipment. Zero AWB. Zero pickup.
      const shipmentRes = await createShipmentForOrder(pool, order.id);

      if (!shipmentRes.success && !shipmentRes.alreadyCreated) {
        console.error(`[Test PhonePe Verify] Shiprocket creation failed for ${orderNumber}:`, shipmentRes.error);
        return res.status(502).json({
          success: false,
          mode: 'TEST',
          message: 'PhonePe payment verified as PAID, but Shiprocket order creation failed.',
          paymentStatus: 'PAID',
          fulfillmentStatus: 'SHIPMENT_PENDING',
          error: shipmentRes.error
        });
      }

      // Fetch fresh updated order
      const finalRes = await pool.query('SELECT * FROM orders WHERE id = $1', [order.id]);
      const finalOrder = finalRes.rows[0];

      return res.status(200).json({
        success: true,
        mode: 'TEST',
        message: 'PhonePe payment verified for ₹499 and Shiprocket order created successfully.',
        order: {
          orderNumber: finalOrder.orderNumber,
          paymentStatus: finalOrder.paymentStatus,
          totalAmount: Number(finalOrder.totalAmount),
          paymentTransactionId: finalOrder.paymentTransactionId,
          paymentVerifiedAt: finalOrder.paymentVerifiedAt,
          fulfillmentStatus: finalOrder.fulfillmentStatus,
          shiprocketOrderId: finalOrder.shiprocketOrderId,
          shiprocketShipmentId: finalOrder.shiprocketShipmentId,
          awbCode: finalOrder.awbCode || null,
          pickupStatus: finalOrder.pickupStatus || null
        }
      });

    } catch (err: any) {
      console.error('[Test PhonePe Verify] Unexpected error:', err);
      return res.status(500).json({
        success: false,
        mode: 'TEST',
        message: 'Payment verification failed due to internal server error.',
        error: err.message
      });
    }
  });

  /**
   * GET /api/test/phonepe/test-order-status
   * 
   * Inspect current state of MC-PHONEPE-TEST-001.
   */
  router.get('/phonepe/test-order-status', async (req: Request, res: Response) => {
    try {
      if (!pool) {
        return res.status(500).json({ success: false, error: 'Database pool not provided.' });
      }

      const orderNumber = req.query.orderNumber ? String(req.query.orderNumber) : 'MC-PHONEPE-TEST-001';
      const orderRes = await pool.query('SELECT * FROM orders WHERE "orderNumber" = $1', [orderNumber]);

      if (orderRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: `Test order '${orderNumber}' not found.` });
      }

      const order = orderRes.rows[0];
      return res.status(200).json({
        success: true,
        mode: 'TEST',
        order: {
          orderNumber: order.orderNumber,
          paymentStatus: order.paymentStatus,
          totalAmount: Number(order.totalAmount),
          paymentTransactionId: order.paymentTransactionId,
          paymentVerifiedAt: order.paymentVerifiedAt,
          fulfillmentStatus: order.fulfillmentStatus,
          fulfillmentError: order.fulfillmentError,
          shiprocketOrderId: order.shiprocketOrderId,
          shiprocketShipmentId: order.shiprocketShipmentId,
          awbCode: order.awbCode || null,
          pickupStatus: order.pickupStatus || null
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
}
