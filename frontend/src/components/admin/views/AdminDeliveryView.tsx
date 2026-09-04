import React, { useState, useEffect } from 'react';
import { AdminDeliveryRecord } from '../adminTypes';
import { 
  Truck, 
  Search, 
  MapPin, 
  Phone, 
  Edit3, 
  Save, 
  X, 
  CheckCircle2, 
  RefreshCw, 
  PackageCheck,
  Calendar,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { retryAdminShipment } from '../../../services/shippingService';
import { getApiUrl } from '../../../services/api';

export const AdminDeliveryView: React.FC = () => {
  const [deliveries, setDeliveries] = useState<AdminDeliveryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [retryingOrderId, setRetryingOrderId] = useState<string | null>(null);

  // Edit Modal State
  const [editingDelivery, setEditingDelivery] = useState<AdminDeliveryRecord | null>(null);
  const [deliveryProvider, setDeliveryProvider] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchDeliveries = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('modi_admin_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(getApiUrl('/api/admin/delivery'), { headers, credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setDeliveries(data);
      }
    } catch (err) {
      console.error('Error fetching deliveries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleOpenEdit = (rec: AdminDeliveryRecord) => {
    setEditingDelivery(rec);
    setDeliveryProvider(rec.deliveryProvider || 'Delhivery Express');
    setTrackingNumber(rec.trackingNumber || '');
    setExpectedDate(rec.expectedDeliveryDate || 'In 2-3 Business Days');
    setDeliveryStatus(rec.deliveryStatus || 'processing');
    setSuccessMsg(null);
  };

  const handleRetryShiprocket = async (orderId: string) => {
    setRetryingOrderId(orderId);
    try {
      const res = await retryAdminShipment(orderId);
      if (res.success) {
        alert(res.message || 'Shipment created successfully via Shiprocket!');
        fetchDeliveries();
      } else {
        alert(res.error || 'Failed to retry shipment creation.');
      }
    } catch (err: any) {
      alert(err.message || 'Error retrying shipment.');
    } finally {
      setRetryingOrderId(null);
    }
  };

  const handleSaveDelivery = async () => {
    if (!editingDelivery) return;
    setIsUpdating(true);
    const token = localStorage.getItem('modi_admin_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(getApiUrl(`/api/admin/delivery/${editingDelivery.id}`), {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          deliveryProvider,
          trackingNumber,
          expectedDeliveryDate: expectedDate,
          deliveryStatus
        })
      });

      if (res.ok) {
        setDeliveries(prev => prev.map(d => d.id === editingDelivery.id ? {
          ...d,
          deliveryProvider,
          trackingNumber,
          expectedDeliveryDate: expectedDate,
          deliveryStatus
        } : d));
        setSuccessMsg('Delivery details updated successfully.');
        setTimeout(() => {
          setEditingDelivery(null);
          setSuccessMsg(null);
        }, 1200);
      } else {
        alert('Failed to update delivery information.');
      }
    } catch (err) {
      console.error('Error saving delivery:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const filtered = deliveries.filter((d) => {
    if (statusFilter !== 'all' && d.deliveryStatus !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.orderNumber.toLowerCase().includes(q) ||
      d.customerName.toLowerCase().includes(q) ||
      d.customerPhone?.includes(q) ||
      d.trackingNumber?.toLowerCase().includes(q)
    );
  });

  const statuses = [
    { id: 'all', label: 'All Dispatches' },
    { id: 'processing', label: 'Processing' },
    { id: 'shipped', label: 'Shipped' },
    { id: 'in_transit', label: 'In Transit' },
    { id: 'out_for_delivery', label: 'Out for Delivery' },
    { id: 'delivered', label: 'Delivered' }
  ];

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      {/* Header Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              id="admin-delivery-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order #, Customer, Phone, or AWB tracking..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchDeliveries}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors cursor-pointer"
              title="Refresh Deliveries"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="text-xs font-mono font-bold text-slate-400 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
              Total Shipments: <span className="text-white">{deliveries.length}</span>
            </div>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
          {statuses.map((s) => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === s.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <span className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
            <p>Loading single-book physical book deliveries...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No matching delivery records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase text-[10px] tracking-wider text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Customer & Destination</th>
                  <th className="py-3.5 px-4">Carrier Partner</th>
                  <th className="py-3.5 px-4">AWB Tracking Number</th>
                  <th className="py-3.5 px-4">Delivery Status</th>
                  <th className="py-3.5 px-4">Est. Date</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium text-[11px]">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white whitespace-nowrap">
                      {d.orderNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-200">{d.customerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-500" /> {d.customerPhone}
                      </div>
                      {d.shippingAddress && (
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-500" /> {d.shippingAddress.city}, {d.shippingAddress.state} - {d.shippingAddress.pincode}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-semibold">
                        {d.deliveryProvider || 'Delhivery Express'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                      {d.trackingNumber || 'Pending AWB Generation'}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        d.deliveryStatus === 'delivered'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : d.deliveryStatus === 'shipped' || d.deliveryStatus === 'in_transit'
                          ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                          : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {d.deliveryStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap font-mono">
                      {d.expectedDeliveryDate || '2-3 Days'}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(d)}
                          className="px-2.5 py-1.5 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          disabled={retryingOrderId === (d.orderId || d.id)}
                          onClick={() => handleRetryShiprocket(d.orderId || d.id)}
                          className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/30 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          title="Retry Shiprocket Shipment Creation"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${retryingOrderId === (d.orderId || d.id) ? 'animate-spin' : ''}`} />
                          <span>Retry Shiprocket</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Delivery Modal */}
      {editingDelivery && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-400" />
                <span>Update Delivery: {editingDelivery.orderNumber}</span>
              </h3>
              <button
                onClick={() => setEditingDelivery(null)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-950/70 border border-emerald-800 text-emerald-300 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Courier Carrier Partner
                </label>
                <select
                  value={deliveryProvider}
                  onChange={(e) => setDeliveryProvider(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                >
                  <option value="Delhivery Express">Delhivery Express</option>
                  <option value="Shiprocket Direct">Shiprocket Direct</option>
                  <option value="BlueDart Air">BlueDart Air</option>
                  <option value="India Post Speed Post">India Post Speed Post</option>
                  <option value="DTDC Courier">DTDC Courier</option>
                  <option value="Professional Courier">Professional Courier</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  AWB Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. DEL-2938472910"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Estimated Delivery Date
                </label>
                <input
                  type="text"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  placeholder="e.g. 5 March 2026"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Shipment Status
                </label>
                <select
                  value={deliveryStatus}
                  onChange={(e) => setDeliveryStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                >
                  <option value="processing">Processing / Packing</option>
                  <option value="shipped">Shipped</option>
                  <option value="in_transit">In Transit</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingDelivery(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleSaveDelivery}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isUpdating ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Delivery</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
