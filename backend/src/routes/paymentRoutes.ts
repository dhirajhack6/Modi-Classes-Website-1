import express, { Request, Response } from 'express';
import { Pool } from 'pg';
import { getPaymentGateway } from '../services/paymentGateway';
import { handleOrderPaid } from '../services/fulfillmentService';

export function createPaymentRouter(pool: Pool, isDbConfigured: boolean) {
  const router = express.Router();
  const gateway = getPaymentGateway();

  /**
   * GET /api/payment/config
   * Public gateway details
   */
  router.get('/config', (req: Request, res: Response) => {
    res.json({
      success: true,
      provider: gateway.providerName,
      supportedMethods: ['UPI_INTENT', 'UPI_QR', 'UPI_COLLECT', 'PHONEPE_GATEWAY'],
      codEnabled: false // Strictly no COD
    });
  });

  /**
   * POST /api/payment/create-order OR POST /api/orders/initiate-checkout
   * ZERO-TRUST ORDER INITIATION
   * The client NEVER sends price or totalAmount.
   * The backend looks up authoritative book price in the database.
   */
  router.post('/create-order', async (req: Request, res: Response) => {
    try {
      const {
        items,
        shippingAddress,
        customerName,
        customerEmail,
        customerPhone,
        couponCode
      } = req.body;

      if (!customerName || !customerPhone || !shippingAddress?.pincode) {
        return res.status(400).json({ error: 'Customer name, phone, and complete shipping address with pincode are required.' });
      }

      // 1. Fetch authoritative active book price from Database
      let unitPrice = 499;
      let bookTitle = 'RAILWAY Psychological/Aptitude Test For Asst. Loco Pilot';
      let bookAuthor = 'Sandeep Kumar (Vidyasagar Publication)';

      if (isDbConfigured) {
        const bookRes = await pool.query('SELECT * FROM books WHERE id = $1', ['book-alp-psycho']);
        if (bookRes.rows.length > 0) {
          const b = bookRes.rows[0];
          unitPrice = Number(b.discountPriceHardcopy) || Number(b.priceHardcopy) || 499;
          bookTitle = b.title || bookTitle;
          bookAuthor = b.author || bookAuthor;
        }
      }

      // 2. Validate quantity (default 1)
      const requestedQty = Math.max(1, Math.min(10, Number(items?.[0]?.quantity) || 1));

      // 3. Authoritative calculation on Backend
      const subtotal = unitPrice * requestedQty;
      
      // Coupon validation
      let discount = 0;
      if (couponCode && isDbConfigured) {
        const couponRes = await pool.query('SELECT * FROM coupons WHERE UPPER(code) = UPPER($1) AND "isActive" = TRUE', [couponCode]);
        if (couponRes.rows.length > 0) {
          const c = couponRes.rows[0];
          if (c.discountType === 'percent') {
            discount = Math.round((subtotal * Number(c.discountValue)) / 100);
            if (c.maxDiscount) discount = Math.min(discount, Number(c.maxDiscount));
          } else {
            discount = Number(c.discountValue) || 0;
          }
        }
      }

      // Shipping Fee Calculation (Free delivery for books over ₹400)
      const shippingFee = subtotal >= 400 ? 0 : 49;
      const codFee = 0; // Strictly NO COD
      const taxAmount = Math.round(subtotal * 0.05);
      const totalAmount = Math.max(0, subtotal - discount + shippingFee);

      // Unique Internal Order ID
      const orderNumber = `MC-2026-${Date.now().toString().slice(-6)}`;
      const orderId = `ord-${Date.now()}`;

      // 4. Create Gateway Payment Session
      const gatewayOrder = await gateway.createPaymentOrder({
        orderId: orderNumber,
        amountRupees: totalAmount,
        customerName,
        customerPhone,
        customerEmail
      });

      const validatedItems = [
        {
          bookId: 'book-alp-psycho',
          bookTitle,
          author: bookAuthor,
          format: 'hardcopy',
          quantity: requestedQty,
          unitPrice,
          totalPrice: unitPrice * requestedQty
        }
      ];

      // 5. Store pending order in Database with snapshot
      if (isDbConfigured) {
        await pool.query(
          `INSERT INTO orders (
             id, "orderNumber", "userId", "customerName", "customerEmail", "customerPhone",
             items, "itemsCount", subtotal, discount, "couponCode", "shippingFee", "codFee",
             "taxAmount", "totalAmount", "hasDigitalItems", "hasPhysicalItems", "paymentMethod",
             "paymentStatus", "paymentTransactionId", "orderStatus", "shippingStatus",
             "courierPartner", "trackingNumber", "estimatedDeliveryDate", "trackingTimeline",
             "shippingAddress", "digitalLicenses", "invoiceNumber", "createdAt", "gatewayOrderId"
           ) VALUES (
             $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
             $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31
           )`,
          [
            orderId,
            orderNumber,
            req.body.userId || `usr-guest-${Date.now()}`,
            customerName,
            customerEmail || 'student@modiclasses.in',
            customerPhone,
            JSON.stringify(validatedItems),
            requestedQty,
            subtotal,
            discount,
            couponCode || null,
            shippingFee,
            codFee,
            taxAmount,
            totalAmount,
            false,
            true,
            'upi',
            'PAYMENT_PENDING',
            null,
            'pending',
            'SHIPMENT_PENDING',
            'Delhivery Express (Pending Payment)',
            null,
            'In 2-3 Business Days after payment',
            JSON.stringify([
              {
                status: 'pending_payment',
                title: 'Order Initiated - Awaiting UPI Payment',
                description: 'Order created. Complete payment to dispatch package.',
                location: 'Checkout',
                timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                done: false
              }
            ]),
            JSON.stringify(shippingAddress),
            JSON.stringify([]),
            `INV-${orderNumber}`,
            new Date().toISOString(),
            gatewayOrder.gatewayOrderId
          ]
        );
      }

      res.json({
        success: true,
        orderId,
        orderNumber,
        unitPrice,
        subtotal,
        discount,
        shippingFee,
        totalAmount,
        gatewayOrderId: gatewayOrder.gatewayOrderId,
        paymentUrl: gatewayOrder.paymentUrl,
        qrData: gatewayOrder.qrData,
        provider: gatewayOrder.provider,
        message: 'Order created with authoritative database pricing. Ready for UPI payment.'
      });
    } catch (err: any) {
      console.error('Error creating order & payment:', err);
      res.status(500).json({ error: err.message || 'Could not initiate checkout.' });
    }
  });

  /**
   * POST /api/payment/verify
   * ZERO-TRUST SERVER-SIDE PAYMENT VERIFICATION
   * Compares cryptographic signature, matches Order ID, verifies Amount against DB,
   * updates order to PAID, and triggers automated Shiprocket shipment.
   */
  router.post('/verify', async (req: Request, res: Response) => {
    try {
      const { orderId, orderNumber, gatewayOrderId, paymentId, signature } = req.body;

      if (!orderId && !orderNumber) {
        return res.status(400).json({ error: 'Order identifier is required.' });
      }

      if (!isDbConfigured) {
        return res.json({
          verified: true,
          status: 'PAID',
          message: 'Simulated verification in development mode without active database.'
        });
      }

      // 1. Fetch order authoritatively from DB
      const orderRes = await pool.query(
        'SELECT * FROM orders WHERE id = $1 OR "orderNumber" = $1 OR "orderNumber" = $2',
        [orderId || orderNumber, orderNumber || orderId]
      );

      if (orderRes.rows.length === 0) {
        return res.status(404).json({ error: 'Order not found in database.' });
      }

      const order = orderRes.rows[0];

      // 2. IDEMPOTENCY CHECK: If already paid, return success immediately without duplicating shipment
      if ((order.paymentStatus || '').toUpperCase() === 'PAID') {
        return res.json({
          verified: true,
          status: 'PAID',
          alreadyPaid: true,
          orderNumber: order.orderNumber,
          paymentTransactionId: order.paymentTransactionId,
          shippingStatus: order.shippingStatus,
          message: 'Order is already paid and confirmed.'
        });
      }

      // 3. ORDER ID VERIFICATION: Ensure gatewayOrderId matches recorded order
      if (order.gatewayOrderId && gatewayOrderId && order.gatewayOrderId !== gatewayOrderId) {
        console.error(`🚨 Security Alert: Gateway Order ID mismatch! Expected ${order.gatewayOrderId}, got ${gatewayOrderId}`);
        return res.status(400).json({ error: 'Security Violation: Gateway Order ID mismatch.' });
      }

      // 4. Verify Payment with Payment Gateway
      const verifyRes = await gateway.verifyPayment({
        orderId: order.orderNumber,
        gatewayOrderId: gatewayOrderId || order.gatewayOrderId || order.orderNumber,
        paymentId: paymentId || `UPI/${Date.now().toString().slice(-8)}`,
        signature,
        expectedAmountRupees: Number(order.totalAmount)
      });

      if (!verifyRes.verified || verifyRes.status !== 'PAID') {
        // Mark payment failed in DB
        await pool.query(
          `UPDATE orders SET "paymentStatus" = 'PAYMENT_FAILED' WHERE id = $1`,
          [order.id]
        );
        return res.status(400).json({
          verified: false,
          status: 'FAILED',
          message: verifyRes.message || 'Payment verification failed.'
        });
      }

      // 5. Payment is strictly VERIFIED -> Mark as PAID in Database
      const paymentTxnId = verifyRes.transactionId || paymentId || `UPI/${Date.now().toString().slice(-8)}`;
      const verifiedTime = new Date().toISOString();

      await pool.query(
        `UPDATE orders SET
           "paymentStatus" = 'PAID',
           "paymentTransactionId" = $2,
           "orderStatus" = 'confirmed',
           "paymentVerifiedAt" = $3,
           "fulfillmentStatus" = COALESCE("fulfillmentStatus", 'SHIPMENT_PENDING'),
           "shippingStatus" = COALESCE("shippingStatus", 'SHIPMENT_PENDING')
         WHERE id = $1`,
        [order.id, paymentTxnId, verifiedTime]
      );

      // 6. PRODUCTION-SAFE FULFILLMENT HANDOFF
      // Only triggered when payment is 100% verified as PAID.
      // Auto-dispatch is gated by ENABLE_SHIPROCKET_AUTO_FULFILLMENT (default: false).
      try {
        await handleOrderPaid(pool, order.id);
      } catch (shipErr: any) {
        console.warn('[Payment Routes] Fulfillment hand-off notice:', shipErr.message);
        // Important: Order remains strictly PAID regardless of fulfillment state
      }

      const finalOrderRes = await pool.query('SELECT * FROM orders WHERE id = $1', [order.id]);
      const updatedOrder = finalOrderRes.rows[0];

      res.json({
        verified: true,
        status: 'PAID',
        orderNumber: order.orderNumber,
        paymentTransactionId: paymentTxnId,
        shippingStatus: updatedOrder.shippingStatus || 'SHIPMENT_PENDING',
        fulfillmentStatus: updatedOrder.fulfillmentStatus || 'SHIPMENT_PENDING',
        awbCode: updatedOrder.awbCode || null,
        courierPartner: updatedOrder.shiprocketCourierName || updatedOrder.courierPartner || 'Delhivery Express Direct',
        trackingUrl: updatedOrder.shipmentTrackingUrl || null,
        order: updatedOrder,
        message: 'Payment successfully verified and order confirmed.'
      });
    } catch (err: any) {
      console.error('Error during payment verification:', err);
      res.status(500).json({ error: err.message || 'Payment verification failed.' });
    }
  });

  /**
   * POST /api/payment/webhook & POST /api/payment/phonepe/callback
   * Server-to-Server Webhook Handler with Idempotency & Signature Verification
   */
  const handlePaymentWebhook = async (req: Request, res: Response) => {
    try {
      const signature = (req.headers['x-verify'] || req.headers['x-razorpay-signature'] || '') as string;
      const webhookRes = await gateway.verifyWebhook(req.body, signature);

      if (!webhookRes.verified) {
        console.error('🚨 Invalid Webhook Signature received!');
        return res.status(400).json({ error: 'Invalid webhook signature.' });
      }

      if (!isDbConfigured || !webhookRes.gatewayOrderId) {
        return res.json({ success: true, message: 'Webhook received (dev mode).' });
      }

      // Check order
      const orderRes = await pool.query(
        'SELECT * FROM orders WHERE "gatewayOrderId" = $1 OR "orderNumber" = $1',
        [webhookRes.gatewayOrderId]
      );

      if (orderRes.rows.length === 0) {
        return res.status(404).json({ error: 'Order not found for webhook.' });
      }

      const order = orderRes.rows[0];

      // IDEMPOTENCY: If order already PAID, acknowledge without repeating shipment
      if ((order.paymentStatus || '').toUpperCase() === 'PAID') {
        return res.json({ success: true, message: 'Order already processed.' });
      }

      if (webhookRes.status === 'PAID') {
        // Amount verification
        if (webhookRes.amountRupees && webhookRes.amountRupees !== Number(order.totalAmount)) {
          console.error(`🚨 Webhook Amount mismatch! Expected ₹${order.totalAmount}, got ₹${webhookRes.amountRupees}`);
          return res.status(400).json({ error: 'Amount mismatch in webhook.' });
        }

        const paymentId = webhookRes.paymentId || `UPI/${Date.now().toString().slice(-8)}`;

        await pool.query(
          `UPDATE orders SET
              "paymentStatus" = 'PAID',
              "paymentTransactionId" = $2,
              "orderStatus" = 'confirmed',
              "paymentVerifiedAt" = $3,
              "fulfillmentStatus" = COALESCE("fulfillmentStatus", 'SHIPMENT_PENDING'),
              "shippingStatus" = COALESCE("shippingStatus", 'SHIPMENT_PENDING')
            WHERE id = $1`,
           [order.id, paymentId, new Date().toISOString()]
         );

         // Production-safe fulfillment handoff
         try {
           await handleOrderPaid(pool, order.id);
         } catch (e: any) {
           console.warn('[Webhook] Fulfillment handoff notice:', e.message);
         }
       }

       res.json({ success: true, message: 'Webhook processed successfully.' });
    } catch (err: any) {
      console.error('Webhook error:', err);
      res.status(500).json({ error: err.message });
    }
  };

  router.post('/webhook', handlePaymentWebhook);
  router.post('/phonepe/callback', handlePaymentWebhook);

  return router;
}
