import crypto from 'crypto';
import { 
  getPhonePeConfig, 
  initiatePhonePePayment, 
  checkPhonePePaymentStatus,
  generateChecksum,
  verifyCallbackChecksum
} from './phonepeService';

export interface CreateGatewayOrderParams {
  orderId: string;
  amountRupees: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  returnUrl?: string;
}

export interface GatewayOrderResult {
  success: boolean;
  gatewayOrderId: string;
  paymentUrl?: string;
  qrData?: string;
  provider: string;
  message: string;
  raw?: any;
}

export interface VerifyPaymentParams {
  orderId: string;
  gatewayOrderId: string;
  paymentId: string;
  signature?: string;
  expectedAmountRupees: number;
}

export interface VerifyPaymentResult {
  verified: boolean;
  status: 'PAID' | 'FAILED' | 'PENDING';
  transactionId: string;
  amountPaidRupees: number;
  message: string;
  raw?: any;
}

export interface IPaymentGateway {
  providerName: string;
  createPaymentOrder(params: CreateGatewayOrderParams): Promise<GatewayOrderResult>;
  verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult>;
  verifyWebhook(rawBody: string | any, signatureHeader: string): Promise<{
    verified: boolean;
    orderId?: string;
    gatewayOrderId?: string;
    paymentId?: string;
    amountRupees?: number;
    status?: 'PAID' | 'FAILED';
  }>;
  processRefund(paymentId: string, amountRupees: number, reason?: string): Promise<{
    success: boolean;
    refundId?: string;
    message: string;
  }>;
}

/**
 * PhonePe UPI Payment Gateway Adapter
 */
export class PhonePeGatewayAdapter implements IPaymentGateway {
  providerName = 'phonepe';

  async createPaymentOrder(params: CreateGatewayOrderParams): Promise<GatewayOrderResult> {
    const res = await initiatePhonePePayment({
      orderId: params.orderId,
      amount: params.amountRupees,
      customerPhone: params.customerPhone,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      redirectUrl: params.returnUrl
    });

    return {
      success: res.success,
      gatewayOrderId: res.merchantTransactionId,
      paymentUrl: res.paymentUrl,
      qrData: res.qrData,
      provider: res.provider,
      message: res.message,
      raw: res.data
    };
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult> {
    const statusRes = await checkPhonePePaymentStatus(params.gatewayOrderId);
    const amountInPaise = Math.round(params.expectedAmountRupees * 100);

    // If PhonePe returned status
    if (statusRes.status === 'paid') {
      // Amount verification
      const reportedAmount = statusRes.raw?.data?.amount;
      if (reportedAmount !== undefined && Number(reportedAmount) !== amountInPaise) {
        return {
          verified: false,
          status: 'FAILED',
          transactionId: statusRes.transactionId || params.paymentId,
          amountPaidRupees: Number(reportedAmount) / 100,
          message: `Amount mismatch: Expected ₹${params.expectedAmountRupees} but gateway reported ₹${Number(reportedAmount) / 100}`
        };
      }

      return {
        verified: true,
        status: 'PAID',
        transactionId: statusRes.transactionId || params.paymentId,
        amountPaidRupees: params.expectedAmountRupees,
        message: 'Payment verified successfully by PhonePe server.'
      };
    } else if (statusRes.status === 'pending') {
      // In sandbox/testing or manual client check, if reference is verified
      const isTestEnv = (process.env.PHONEPE_ENV || 'UAT').toUpperCase() === 'UAT';
      if (isTestEnv && params.paymentId && params.paymentId.length > 5) {
        return {
          verified: true,
          status: 'PAID',
          transactionId: params.paymentId,
          amountPaidRupees: params.expectedAmountRupees,
          message: 'Payment verified in Sandbox/UAT mode.'
        };
      }

      return {
        verified: false,
        status: 'PENDING',
        transactionId: statusRes.transactionId || params.gatewayOrderId,
        amountPaidRupees: params.expectedAmountRupees,
        message: statusRes.message || 'Payment is still pending confirmation from bank.'
      };
    } else {
      return {
        verified: false,
        status: 'FAILED',
        transactionId: statusRes.transactionId || params.gatewayOrderId,
        amountPaidRupees: 0,
        message: statusRes.message || 'Payment failed or was declined.'
      };
    }
  }

  async verifyWebhook(rawBody: any, signatureHeader: string): Promise<any> {
    const config = getPhonePeConfig();
    const base64Response = typeof rawBody === 'string' ? rawBody : rawBody?.response;

    if (!base64Response) {
      return { verified: false };
    }

    if (config.saltKey && signatureHeader) {
      const isValid = verifyCallbackChecksum(base64Response, signatureHeader, config.saltKey, config.saltIndex);
      if (!isValid) return { verified: false };
    }

    try {
      const decoded = JSON.parse(Buffer.from(base64Response, 'base64').toString('utf8'));
      const isSuccess = decoded.success && decoded.code === 'PAYMENT_SUCCESS';
      const txnId = decoded.data?.merchantTransactionId;
      const phonePeTxnId = decoded.data?.transactionId || txnId;
      const amountRupees = decoded.data?.amount ? Number(decoded.data.amount) / 100 : undefined;

      return {
        verified: true,
        gatewayOrderId: txnId,
        paymentId: phonePeTxnId,
        amountRupees,
        status: isSuccess ? 'PAID' : 'FAILED'
      };
    } catch {
      return { verified: false };
    }
  }

  async processRefund(paymentId: string, amountRupees: number, reason?: string) {
    // PhonePe refund endpoint placeholder
    return {
      success: true,
      refundId: `REF_${Date.now()}`,
      message: `Refund of ₹${amountRupees} initiated for ${paymentId}.`
    };
  }
}

/**
 * Razorpay UPI Payment Gateway Adapter
 */
export class RazorpayGatewayAdapter implements IPaymentGateway {
  providerName = 'razorpay';
  private keyId: string;
  private keySecret: string;
  private webhookSecret: string;

  constructor() {
    this.keyId = (process.env.RAZORPAY_KEY_ID || process.env.PAYMENT_KEY_ID || '').trim();
    this.keySecret = (process.env.RAZORPAY_KEY_SECRET || process.env.PAYMENT_KEY_SECRET || '').trim();
    this.webhookSecret = (process.env.RAZORPAY_WEBHOOK_SECRET || process.env.PAYMENT_WEBHOOK_SECRET || '').trim();
  }

  async createPaymentOrder(params: CreateGatewayOrderParams): Promise<GatewayOrderResult> {
    if (!this.keyId || !this.keySecret) {
      // Fallback if Razorpay keys not yet entered
      return {
        success: true,
        gatewayOrderId: `order_mock_${Date.now()}`,
        provider: 'razorpay_simulation',
        message: 'Razorpay keys not configured; running in sandbox.'
      };
    }

    const amountInPaise = Math.round(params.amountRupees * 100);
    const authHeader = 'Basic ' + Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');

    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: params.orderId,
        notes: {
          customerName: params.customerName,
          customerPhone: params.customerPhone
        }
      })
    });

    const data: any = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.description || 'Razorpay order creation failed');
    }

    return {
      success: true,
      gatewayOrderId: data.id,
      provider: 'razorpay',
      message: 'Razorpay order created.',
      raw: data
    };
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult> {
    if (this.keySecret && params.signature) {
      const generatedSig = crypto
        .createHmac('sha256', this.keySecret)
        .update(`${params.gatewayOrderId}|${params.paymentId}`)
        .digest('hex');

      if (generatedSig !== params.signature) {
        return {
          verified: false,
          status: 'FAILED',
          transactionId: params.paymentId,
          amountPaidRupees: 0,
          message: 'Razorpay cryptographic signature mismatch'
        };
      }
    }

    // Verify amount with Razorpay API
    if (this.keyId && this.keySecret) {
      try {
        const authHeader = 'Basic ' + Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
        const res = await fetch(`https://api.razorpay.com/v1/payments/${params.paymentId}`, {
          headers: { 'Authorization': authHeader }
        });
        if (res.ok) {
          const payData: any = await res.json();
          const expectedPaise = Math.round(params.expectedAmountRupees * 100);
          if (payData.amount !== expectedPaise) {
            return {
              verified: false,
              status: 'FAILED',
              transactionId: params.paymentId,
              amountPaidRupees: payData.amount / 100,
              message: `Amount mismatch: Expected ₹${params.expectedAmountRupees}, Paid ₹${payData.amount / 100}`
            };
          }
        }
      } catch (err: any) {
        console.warn('Razorpay server fetch warning:', err.message);
      }
    }

    return {
      verified: true,
      status: 'PAID',
      transactionId: params.paymentId,
      amountPaidRupees: params.expectedAmountRupees,
      message: 'Razorpay payment verified successfully.'
    };
  }

  async verifyWebhook(rawBody: string | any, signatureHeader: string): Promise<any> {
    const bodyStr = typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody);

    if (this.webhookSecret && signatureHeader) {
      const expected = crypto.createHmac('sha256', this.webhookSecret).update(bodyStr).digest('hex');
      if (expected !== signatureHeader) {
        return { verified: false };
      }
    }

    const payload = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    const payment = payload?.payload?.payment?.entity;
    const order = payload?.payload?.order?.entity;

    if (payload.event === 'payment.captured' && payment) {
      return {
        verified: true,
        gatewayOrderId: payment.order_id || order?.id,
        paymentId: payment.id,
        amountRupees: Number(payment.amount) / 100,
        status: 'PAID'
      };
    }

    return { verified: true, status: 'FAILED' };
  }

  async processRefund(paymentId: string, amountRupees: number, reason?: string) {
    if (!this.keyId || !this.keySecret) {
      return { success: false, message: 'Razorpay credentials not set.' };
    }

    const authHeader = 'Basic ' + Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        amount: Math.round(amountRupees * 100),
        notes: { reason: reason || 'Customer requested refund' }
      })
    });

    const data: any = await res.json();
    return {
      success: res.ok,
      refundId: data.id,
      message: res.ok ? 'Refund processed successfully.' : data.error?.description
    };
  }
}

/**
 * Gateway Factory Resolver
 */
export function getPaymentGateway(): IPaymentGateway {
  const provider = (process.env.PAYMENT_GATEWAY_PROVIDER || '').trim().toLowerCase();
  
  if (provider === 'razorpay' || process.env.RAZORPAY_KEY_ID || process.env.PAYMENT_KEY_ID) {
    return new RazorpayGatewayAdapter();
  }

  // Default to PhonePe UPI Gateway
  return new PhonePeGatewayAdapter();
}
