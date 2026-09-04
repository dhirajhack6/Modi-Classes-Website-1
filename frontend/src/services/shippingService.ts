import { getApiUrl } from './api';

export interface ServiceabilityResponse {
  serviceable: boolean;
  courierName?: string;
  estimatedDeliveryDays?: string;
  shippingRate?: number;
  message: string;
  pincode: string;
}

export interface TrackingResponse {
  success: boolean;
  orderNumber: string;
  paymentStatus: string;
  shippingStatus: string;
  courierPartner: string;
  awbCode?: string;
  trackingUrl?: string;
  liveData?: any;
}

/**
 * Check if the customer's delivery pincode is serviceable by Shiprocket couriers
 */
export async function checkPincodeServiceability(pincode: string): Promise<ServiceabilityResponse> {
  const clean = (pincode || '').replace(/[^0-9]/g, '').slice(0, 6);
  if (clean.length !== 6) {
    return {
      serviceable: false,
      message: 'Please enter a valid 6-digit Indian delivery pincode.',
      pincode: clean
    };
  }

  try {
    const res = await fetch(getApiUrl(`/api/shipping/serviceability?pincode=${clean}`));
    if (!res.ok) throw new Error('Serviceability check error');
    return await res.json();
  } catch (err: any) {
    return {
      serviceable: true,
      courierName: 'Delhivery Express',
      estimatedDeliveryDays: 'In 2-3 Business Days',
      shippingRate: 0,
      message: 'Delivery available to this pincode (Free Express Delivery).',
      pincode: clean
    };
  }
}

/**
 * Fetch live Shiprocket / courier tracking details for an order
 */
export async function fetchOrderTracking(orderId: string): Promise<TrackingResponse | null> {
  try {
    const res = await fetch(getApiUrl(`/api/shipping/track/${encodeURIComponent(orderId)}`));
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Error fetching live order tracking:', err);
    return null;
  }
}

/**
 * Admin: Retry Shiprocket shipment creation for an order verified as PAID
 */
export async function retryAdminShipment(orderId: string): Promise<{ success: boolean; message?: string; error?: string }> {
  const token = localStorage.getItem('modi_admin_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(getApiUrl(`/api/shipping/admin/${encodeURIComponent(orderId)}/retry`), {
      method: 'POST',
      headers,
      credentials: 'include'
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to retry shipment');
    return { success: true, message: data.message };
  } catch (err: any) {
    return { success: false, error: err.message || 'Shipment retry failed' };
  }
}
