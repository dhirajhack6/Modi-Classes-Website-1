export interface PaymentConfig {
  success: boolean;
  provider: string;
  supportedMethods: string[];
  codEnabled: boolean;
  merchantName?: string;
  merchantUpiVpa?: string;
}

export interface InitiateCheckoutRequest {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items?: Array<{ bookId: string; quantity: number }>;
  shippingAddress: {
    street: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  couponCode?: string;
  userId?: string;
}

export interface InitiateCheckoutResponse {
  success: boolean;
  orderId: string;
  orderNumber: string;
  unitPrice: number;
  subtotal: number;
  discount: number;
  shippingFee: number;
  totalAmount: number;
  gatewayOrderId: string;
  paymentUrl?: string;
  qrData?: string;
  provider: string;
  message: string;
  error?: string;
}

export interface VerifyPaymentRequest {
  orderId?: string;
  orderNumber?: string;
  gatewayOrderId?: string;
  paymentId: string;
  signature?: string;
}

export interface VerifyPaymentResponse {
  verified: boolean;
  status: 'PAID' | 'FAILED' | 'PENDING';
  alreadyPaid?: boolean;
  orderNumber?: string;
  paymentTransactionId?: string;
  shippingStatus?: string;
  awbCode?: string;
  courierPartner?: string;
  trackingUrl?: string;
  order?: any;
  message?: string;
  error?: string;
}

/**
 * Fetch public payment gateway configuration
 */
export async function getPaymentConfig(): Promise<PaymentConfig> {
  try {
    const res = await fetch('/api/payment/config');
    if (!res.ok) throw new Error('Failed to fetch payment config');
    return await res.json();
  } catch (e) {
    return {
      success: true,
      provider: 'phonepe',
      supportedMethods: ['UPI_INTENT', 'UPI_QR', 'UPI_COLLECT', 'PHONEPE_GATEWAY'],
      codEnabled: false
    };
  }
}

/**
 * Initiate checkout on backend (Zero-Trust: Backend determines exact DB price)
 */
export async function initiateCheckoutOrder(payload: InitiateCheckoutRequest): Promise<InitiateCheckoutResponse> {
  const res = await fetch('/api/payment/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to initiate order checkout.');
  }

  return data;
}

/**
 * Backward compatibility helper for direct payment initiation
 */
export async function initiatePayment(params: {
  amount: number;
  orderId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}): Promise<any> {
  return initiateCheckoutOrder({
    customerName: params.customerName || 'Aspirant Student',
    customerPhone: params.customerPhone || '9876543210',
    customerEmail: params.customerEmail,
    shippingAddress: {
      street: 'Civil Lines',
      city: 'Prayagraj',
      district: 'Prayagraj',
      state: 'Uttar Pradesh',
      pincode: '211002'
    }
  }).then(d => ({
    ...d,
    merchantTransactionId: d.gatewayOrderId
  }));
}

/**
 * Zero-trust server-side payment verification
 */
export async function verifyPayment(payload: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
  const res = await fetch('/api/payment/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Payment verification failed.');
  }

  return data;
}

/**
 * Helper to build standard UPI URI string
 */
export function buildUpiUri(params: {
  vpa: string;
  name: string;
  amount: number;
  txnId: string;
  note?: string;
}): string {
  const { vpa, name, amount, txnId, note } = params;
  const tn = encodeURIComponent(note || 'Modi Classes Book Order');
  const pn = encodeURIComponent(name);
  return `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${pn}&am=${amount}&cu=INR&tr=${encodeURIComponent(txnId)}&tn=${tn}`;
}

/**
 * Helper to generate QR image URL
 */
export function getUpiQrImageUrl(upiUri: string, size = 200): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&data=${encodeURIComponent(upiUri)}`;
}
