import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Package, 
  Truck, 
  FileText, 
  Library, 
  Eye, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { OrderStatus } from '../../types';

export const OrdersView: React.FC = () => {
  const { 
    orders, 
    setSelectedOrderForInvoice, 
    setSelectedOrderForTracking,
    setActiveView 
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'all') return true;
    return o.orderStatus === statusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <Package className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-serif">
              My Orders & Material Shipments
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Track dispatch, courier delivery milestones, dynamic digital watermarking licenses, and tax invoices
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'in_transit', label: 'In Transit' },
            { id: 'processing', label: 'Processing' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-base text-slate-900">No Orders Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You haven't placed any orders under this filter yet. Check out our RRB ALP Psycho Test book.
          </p>
          <button
            onClick={() => setActiveView('catalog')}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer shadow-sm"
          >
            Browse 3D Book
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs overflow-hidden transition-all"
            >
              {/* Order Card Header Bar */}
              <div className="px-6 py-3.5 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Order Placed</span>
                    <span className="font-bold text-slate-800">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Amount</span>
                    <span className="font-extrabold text-indigo-700">₹{order.totalAmount}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Order Ref #</span>
                    <span className="font-mono font-bold text-slate-800">{order.orderNumber}</span>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                    order.orderStatus === 'delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : order.orderStatus === 'in_transit'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {order.orderStatus.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Items in Order */}
              <div className="p-6 space-y-4">
                <div className="divide-y divide-slate-100">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.coverImage}
                          alt={item.bookTitle}
                          className="w-12 h-16 object-cover rounded-md border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate font-serif">
                            {item.bookTitle}
                          </h4>
                          <p className="text-[11px] text-slate-500">By {item.author}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-sm">
                              {item.format}
                            </span>
                            <span className="text-[11px] text-slate-600">Qty: {item.quantity}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-extrabold text-xs sm:text-sm text-slate-900">
                          ₹{item.totalPrice}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Action Strip */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="text-slate-500 text-[11px]">
                    {order.hasDigitalItems && (
                      <span className="text-indigo-700 font-semibold mr-3">
                        ✓ {order.digitalLicenses.length} Digital License(s) Active
                      </span>
                    )}
                    {order.hasPhysicalItems && order.courierPartner && (
                      <span>
                        Courier: <strong>{order.courierPartner}</strong> ({order.trackingNumber})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {order.hasPhysicalItems && (
                      <button
                        onClick={() => setSelectedOrderForTracking(order)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Track Courier</span>
                      </button>
                    )}

                    {order.hasDigitalItems && (
                      <button
                        onClick={() => setActiveView('my_library')}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Library className="w-3.5 h-3.5" />
                        <span>Open in Library</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedOrderForInvoice(order)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Invoice</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
