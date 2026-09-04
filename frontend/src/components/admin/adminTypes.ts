import { Order, OrderStatus } from '../../types';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin';
  avatarUrl?: string;
}

export interface AdminDashboardMetrics {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  booksSold: number;
  pendingPayments: number;
  ordersInDelivery: number;
}

export interface AdminDashboardData {
  metrics: AdminDashboardMetrics;
  recentOrders: Order[];
  statusCounts: Record<string, number>;
  paymentCounts?: Record<string, number>;
}

export interface AdminCustomerSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  studentRollNumber?: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string | null;
  joinedDate: string;
}

export interface PriceHistoryRecord {
  id: number;
  book_id: string;
  old_mrp: number;
  new_mrp: number;
  old_selling_price: number;
  new_selling_price: number;
  changed_by: string;
  changed_at: string;
}

export interface AdminPaymentRecord {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  paymentTransactionId: string;
  date: string;
}

export interface AdminDeliveryRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: any;
  orderDate: string;
  deliveryProvider: string;
  trackingNumber: string;
  expectedDeliveryDate: string;
  deliveryStatus: OrderStatus | string;
}

export interface AdminStoreSettings {
  storeName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  orderPrefix: string;
  codFee: number;
  freeShippingThreshold: number;
  defaultCourier: string;
  dispatchHours: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
}
