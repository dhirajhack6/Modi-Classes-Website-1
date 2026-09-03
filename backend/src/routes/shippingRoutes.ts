import express, { Request, Response } from 'express';
import { Pool } from 'pg';
import { 
  checkPincodeServiceability, 
  trackShipment 
} from '../services/shiprocketService';
import {
  createShipmentForOrder,
  assignAwbForOrder,
  requestPickupForOrder,
  getOrderFulfillmentStatus
} from '../services/fulfillmentService';

export function createShippingRouter(pool: Pool, isDbConfigured: boolean, requireAdmin: express.RequestHandler) {
  const router = express.Router();

  /**
   * GET /api/shipping/serviceability
   * Public endpoint to validate delivery pincode before order checkout
   */
  router.get('/serviceability', async (req: Request, res: Response) => {
    try {
      const pincode = String(req.query.pincode || '').trim();
      if (!pincode) {
        return res.status(400).json({ serviceable: false, message: 'Pincode is required.' });
      }

      const result = await checkPincodeServiceability(pincode);
      return res.json(result);
    } catch (err: any) {
      console.error('Pincode serviceability check error:', err);
      return res.status(500).json({ serviceable: false, message: 'Error checking pincode serviceability.' });
    }
  });

  /**
   * GET /api/shipping/track/:orderId
   * Retrieve live tracking information for an order
   */
  router.get('/track/:orderId', async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;

      if (!isDbConfigured) {
        return res.json({
          success: true,
          courier: 'Delhivery Express',
          awb: 'DEL-1029384756-IN',
          status: 'IN_TRANSIT',
          activities: [
            {
              date: new Date().toLocaleDateString('en-IN'),
              status: 'In Transit',
              activity: 'Consignment in transit to destination hub',
              location: 'Regional Hub'
            }
          ]
        });
      }

      const orderRes = await pool.query(
        'SELECT * FROM orders WHERE id = $1 OR "orderNumber" = $1',
        [orderId]
      );

      if (orderRes.rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const order = orderRes.rows[0];
      const awb = order.awbCode || order.trackingNumber;

      let liveData = null;
      if (awb) {
        liveData = await trackShipment(awb);
      }

      res.json({
        success: true,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        shippingStatus: order.fulfillmentStatus || order.shippingStatus || 'SHIPMENT_CREATED',
        fulfillmentStatus: order.fulfillmentStatus || order.shippingStatus || 'SHIPMENT_CREATED',
        courierPartner: order.shiprocketCourierName || order.courierPartner || 'Delhivery Express Direct',
        awbCode: awb,
        trackingUrl: order.shipmentTrackingUrl || (awb ? `https://shiprocket.co/tracking/${awb}` : null),
        liveData
      });
    } catch (err: any) {
      console.error('Tracking fetch error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/shipping/webhook
   * Shiprocket tracking updates webhook
   */
  router.post('/webhook', async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const awb = payload.awb || payload.awb_code;
      const currentStatus = (payload.current_status || payload.status || '').toUpperCase();

      console.log(`📦 Shiprocket Tracking Webhook received for AWB ${awb}: Status = ${currentStatus}`);

      if (isDbConfigured && awb && currentStatus) {
        let mappedStatus = 'SHIPPED';
        if (currentStatus.includes('DELIVERED')) mappedStatus = 'DELIVERED';
        else if (currentStatus.includes('OUT FOR DELIVERY')) mappedStatus = 'OUT_FOR_DELIVERY';
        else if (currentStatus.includes('PICKED UP')) mappedStatus = 'PICKED_UP';
        else if (currentStatus.includes('RTO')) mappedStatus = 'RTO';

        await pool.query(
          `UPDATE orders 
           SET "fulfillmentStatus" = $1,
               "shippingStatus" = $1,
               "orderStatus" = CASE WHEN $1 = 'DELIVERED' THEN 'delivered' ELSE "orderStatus" END,
               "lastShiprocketSyncAt" = $3
           WHERE "awbCode" = $2 OR "trackingNumber" = $2`,
          [mappedStatus, awb, new Date().toISOString()]
        );
      }

      res.json({ success: true, message: 'Tracking webhook received' });
    } catch (err: any) {
      console.error('Shiprocket webhook processing error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * =========================================================================
   * ADMIN CONTROLLED FULFILLMENT ENDPOINTS
   * =========================================================================
   */

  /**
   * GET /api/shipping/admin/:orderId/fulfillment-status
   * Inspect current fulfillment state, errors, and Shiprocket IDs.
   */
  router.get('/admin/:orderId/fulfillment-status', requireAdmin, async (req: Request, res: Response) => {
    try {
      const status = await getOrderFulfillmentStatus(pool, req.params.orderId);
      if (!status) {
        return res.status(404).json({ success: false, error: 'Order not found.' });
      }
      return res.json(status);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /**
   * POST /api/shipping/admin/:orderId/create-shipment
   * Creates adhoc order in Shiprocket for a PAID order.
   */
  router.post('/admin/:orderId/create-shipment', requireAdmin, async (req: Request, res: Response) => {
    try {
      const result = await createShipmentForOrder(pool, req.params.orderId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /**
   * POST /api/shipping/admin/:orderId/assign-awb
   * Runs courier selection strategy and assigns AWB code.
   */
  router.post('/admin/:orderId/assign-awb', requireAdmin, async (req: Request, res: Response) => {
    try {
      const courierId = req.body.courier_company_id ? Number(req.body.courier_company_id) : undefined;
      const result = await assignAwbForOrder(pool, req.params.orderId, courierId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /**
   * POST /api/shipping/admin/:orderId/request-pickup
   * Schedules courier pickup after AWB is assigned.
   */
  router.post('/admin/:orderId/request-pickup', requireAdmin, async (req: Request, res: Response) => {
    try {
      const pickupDate = req.body.pickup_date ? String(req.body.pickup_date) : undefined;
      const result = await requestPickupForOrder(pool, req.params.orderId, pickupDate);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /**
   * POST /api/shipping/admin/:orderId/retry
   * Admin endpoint to retry shipment creation & AWB assignment for verified paid orders
   */
  router.post('/admin/:orderId/retry', requireAdmin, async (req: Request, res: Response) => {
    const { orderId } = req.params;

    try {
      if (!isDbConfigured) {
        return res.json({ success: true, message: 'Simulated shipment created in development.' });
      }

      // Step 1: Create shipment
      const shipRes = await createShipmentForOrder(pool, orderId);
      if (!shipRes.success && !shipRes.alreadyCreated) {
        return res.status(502).json({
          success: false,
          error: `Shiprocket shipment creation failed: ${shipRes.error}`
        });
      }

      // Step 2: Assign AWB
      const awbRes = await assignAwbForOrder(pool, orderId);

      return res.json({
        success: true,
        message: 'Fulfillment retry processed successfully.',
        shipment: shipRes,
        awb: awbRes
      });
    } catch (err: any) {
      console.error('Admin retry shipment error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
}
