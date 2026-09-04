import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../../../types';
import { getApiUrl } from '../../../services/api';
import { 
  Search, 
  Filter, 
  Eye, 
  X, 
  CheckCircle2, 
  Clock, 
  Truck, 
  CreditCard, 
  MapPin, 
  Phone, 
  Mail, 
  BookOpen, 
  AlertTriangle,
  RefreshCw,
  Save,
  Check,
  ChevronDown,
  Lock
} from 'lucide-react';

interface AdminOrdersViewProps {
  selectedOrder?: Order | null;
  onClearSelectedOrder?: () => void;
}

export const AdminOrdersView: React.FC<AdminOrdersViewProps> = ({ 
  selectedOrder: initialSelected,
  onClearSelectedOrder 
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(initialSelected || null);
  
  // Status editing in modal
  const [editingOrderStatus, setEditingOrderStatus] = useState<OrderStatus>('confirmed');
  const [editingShippingStatus, setEditingShippingStatus] = useState<string>('SHIPMENT_PENDING');
  const [editingPaymentStatus, setEditingPaymentStatus] = useState<'paid' | 'pending' | 'failed' | 'refunded'>('paid');
  const [editingCourier, setEditingCourier] = useState('');
  const [editingTracking, setEditingTracking] = useState('');
  const [editingEstDelivery, setEditingEstDelivery] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState(false);

  // Status Change Confirmation modal
  const [showConfirmStatusChange, setShowConfirmStatusChange] = useState(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('modi_admin_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (selectedStatusFilter !== 'all') params.append('orderStatus', selectedStatusFilter);
      if (selectedPaymentFilter !== 'all') params.append('paymentStatus', selectedPaymentFilter);

      const res = await fetch(getApiUrl(`/api/admin/orders?${params.toString()}`), {
        headers,
        credentials: 'include'
      });
      if (res.ok) {
        const json = await res.json();
        setOrders(json.orders || []);
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatusFilter, selectedPaymentFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (initialSelected) {
      handleOpenOrderDetails(initialSelected);
    }
  }, [initialSelected]);

  const handleOpenOrderDetails = (ord: Order) => {
    setSelectedOrder(ord);
    setEditingOrderStatus(ord.orderStatus);
    setEditingShippingStatus(ord.shippingStatus || 'SHIPMENT_CREATED');
    setEditingPaymentStatus(ord.paymentStatus);
    setEditingCourier(ord.courierPartner || 'Delhivery Express');
    setEditingTracking(ord.trackingNumber || '');
    setEditingEstDelivery(ord.estimatedDeliveryDate || 'In 2-3 Business Days');
    setStatusUpdateSuccess(false);
  };

  const handleCloseOrderDetails = () => {
    setSelectedOrder(null);
    if (onClearSelectedOrder) onClearSelectedOrder();
  };

  const handleSaveStatus = async () => {
    if (!selectedOrder) return;
    setIsUpdatingStatus(true);
    const token = localStorage.getItem('modi_admin_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(getApiUrl(`/api/admin/orders/${selectedOrder.id}/status`), {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          orderStatus: editingOrderStatus,
          shippingStatus: editingShippingStatus,
          courierPartner: editingCourier,
          trackingNumber: editingTracking,
          estimatedDeliveryDate: editingEstDelivery
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setSelectedOrder(updated);
        setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
        setStatusUpdateSuccess(true);
        setShowConfirmStatusChange(false);
        setTimeout(() => setStatusUpdateSuccess(false), 3000);
      } else {
        alert('Failed to update order status. Please check backend.');
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const orderStatuses = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'processing', label: 'Processing' },
    { id: 'shipped', label: 'Shipped' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' }
  ];

  const paymentStatuses = [
    { id: 'all', label: 'All Payments' },
    { id: 'paid', label: 'Paid' },
    { id: 'pending', label: 'Pending' },
    { id: 'failed', label: 'Failed' },
    { id: 'refunded', label: 'Refunded' }
  ];

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      {/* Header Controls & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              id="admin-order-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, Customer, Phone, or Email..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchOrders}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors cursor-pointer"
              title="Refresh Orders"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="text-xs font-mono font-bold text-slate-400 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
              Total: <span className="text-white">{orders.length}</span>
            </div>
          </div>
        </div>

        {/* Filters Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          
          {/* Order Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {orderStatuses.map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStatusFilter(st.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedStatusFilter === st.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Payment Status Pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-500 mr-1">Payment:</span>
            {paymentStatuses.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPaymentFilter(p.id)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  selectedPaymentFilter === p.id
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <span className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
            <p>Loading single-book orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No matching orders found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase text-[10px] tracking-wider text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Qty</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Order Status</th>
                  <th className="py-3 px-4">Delivery</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white whitespace-nowrap">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-200">{ord.customerName}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[150px]">{ord.customerEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                      {ord.customerPhone}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-center">
                      {ord.itemsCount || 1}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-white whitespace-nowrap">
                      ₹{ord.totalAmount}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        ord.paymentStatus === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : ord.paymentStatus === 'pending'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        ord.orderStatus === 'delivered'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : ord.orderStatus === 'shipped' || ord.orderStatus === 'in_transit'
                          ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                          : ord.orderStatus === 'cancelled'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-400 whitespace-nowrap">
                      {ord.courierPartner || 'Delhivery'}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenOrderDetails(ord)}
                        className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Complete Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white font-mono">
                    Order #{selectedOrder.orderNumber}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    selectedOrder.paymentStatus === 'paid'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}>
                    {selectedOrder.paymentStatus}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>

              <button
                onClick={handleCloseOrderDetails}
                className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {statusUpdateSuccess && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Order and delivery statuses updated successfully in database.</span>
                </div>
              )}

              {/* Status Updater Card */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Save className="w-3.5 h-3.5" />
                    <span>Admin Status & Dispatch Controls</span>
                  </span>
                  <span className="text-[10px] text-slate-500">Live DB synchronization</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Order Status
                    </label>
                    <select
                      value={editingOrderStatus}
                      onChange={(e) => setEditingOrderStatus(e.target.value as OrderStatus)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="in_transit">In Transit</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center justify-between">
                      <span>Payment Status</span>
                      <span className="text-emerald-400 text-[9px] flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" /> Verified Only
                      </span>
                    </label>
                    <div className={`w-full rounded-xl px-3 py-2 text-xs font-bold border flex items-center justify-between ${
                      selectedOrder.paymentStatus === 'paid'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    }`}>
                      <span>{selectedOrder.paymentStatus?.toUpperCase()}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {selectedOrder.paymentTransactionId ? `UTR: ${selectedOrder.paymentTransactionId.slice(-8)}` : 'Prepaid'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Shipping Status (Shiprocket)
                    </label>
                    <select
                      value={editingShippingStatus}
                      onChange={(e) => setEditingShippingStatus(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="SHIPMENT_PENDING">SHIPMENT_PENDING</option>
                      <option value="SHIPMENT_CREATED">SHIPMENT_CREATED</option>
                      <option value="PICKED_UP">PICKED_UP</option>
                      <option value="IN_TRANSIT">IN_TRANSIT</option>
                      <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                      <option value="RTO">RTO</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Courier Partner
                    </label>
                    <input
                      type="text"
                      value={editingCourier}
                      onChange={(e) => setEditingCourier(e.target.value)}
                      placeholder="e.g. Delhivery Express"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Tracking AWB Number
                    </label>
                    <input
                      type="text"
                      value={editingTracking}
                      onChange={(e) => setEditingTracking(e.target.value)}
                      placeholder="e.g. DEL-1029384756-IN"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setShowConfirmStatusChange(true)}
                    disabled={isUpdatingStatus}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors disabled:opacity-50"
                  >
                    {isUpdatingStatus ? (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Status Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Two Column Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Customer Information */}
                <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl space-y-3">
                  <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    <span>Customer & Delivery Details</span>
                  </h4>
                  <div className="space-y-1.5 text-slate-300">
                    <p><strong className="text-white">{selectedOrder.customerName}</strong></p>
                    <p className="flex items-center gap-2"><Mail className="w-3 h-3 text-slate-500" /> {selectedOrder.customerEmail}</p>
                    <p className="flex items-center gap-2 font-mono"><Phone className="w-3 h-3 text-slate-500" /> {selectedOrder.customerPhone}</p>
                    {selectedOrder.shippingAddress && (
                      <div className="mt-2 pt-2 border-t border-slate-800/80 text-slate-400">
                        <p className="text-slate-300 font-medium">Shipping Address:</p>
                        <p>{selectedOrder.shippingAddress.line1 || selectedOrder.shippingAddress.street}</p>
                        <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - <strong className="text-white font-mono">{selectedOrder.shippingAddress.pincode}</strong></p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Breakdown */}
                <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl space-y-3">
                  <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Payment & Pricing Breakdown</span>
                  </h4>
                  <div className="space-y-1.5 text-slate-300 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Payment Method:</span>
                      <span className="font-bold uppercase text-white">{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Transaction ID:</span>
                      <span className="text-slate-200">{selectedOrder.paymentTransactionId || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Items Subtotal:</span>
                      <span>₹{selectedOrder.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount:</span>
                      <span>-₹{selectedOrder.discount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">COD Surcharge:</span>
                      <span>₹{selectedOrder.codFee || 0}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-black text-white">
                      <span>Total Amount Paid:</span>
                      <span>₹{selectedOrder.totalAmount}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Historical Order Items (Immutable Price Snapshot) */}
              <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ordered Book (Historical Price Snapshot)</span>
                  </h4>
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    Saved at purchase moment
                  </span>
                </div>

                <div className="divide-y divide-slate-800">
                  {(selectedOrder.items || []).map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-white">{item.bookTitle}</p>
                        <p className="text-[11px] text-slate-400">
                          Format: <span className="uppercase text-amber-400 font-bold">{item.format}</span> • By {item.author}
                        </p>
                      </div>
                      <div className="text-right font-mono">
                        <p className="font-bold text-white">Qty: {item.quantity} × ₹{item.unitPrice}</p>
                        <p className="text-[11px] text-slate-400">Subtotal: ₹{item.totalPrice}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracking Timeline */}
              {selectedOrder.trackingTimeline && selectedOrder.trackingTimeline.length > 0 && (
                <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl space-y-3">
                  <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-sky-400" />
                    <span>Tracking Event Timeline</span>
                  </h4>

                  <div className="space-y-3 pl-2 border-l-2 border-slate-800 ml-2">
                    {selectedOrder.trackingTimeline.map((step, idx) => (
                      <div key={idx} className="relative pl-4">
                        <div className={`w-2.5 h-2.5 rounded-full absolute -left-[18px] top-1 ${
                          step.done ? 'bg-emerald-400 ring-4 ring-emerald-500/20' : 'bg-slate-700'
                        }`} />
                        <p className="font-bold text-white">{step.title}</p>
                        <p className="text-[11px] text-slate-400">{step.description}</p>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{step.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                Invoice: {selectedOrder.invoiceNumber || 'INV-MC-2026'}
              </span>
              <button
                onClick={handleCloseOrderDetails}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Close Order Details
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Confirmation Dialog for Status Change */}
      {showConfirmStatusChange && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-60 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Confirm Status Update?</h4>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to update order <strong>{selectedOrder?.orderNumber}</strong> to <strong>{editingOrderStatus.toUpperCase()}</strong>?
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowConfirmStatusChange(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStatus}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
