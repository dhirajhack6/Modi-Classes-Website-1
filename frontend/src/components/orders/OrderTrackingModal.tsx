import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Package, 
  RotateCcw, 
  FileText, 
  AlertCircle,
  PhoneCall
} from 'lucide-react';
import { Order } from '../../types';

export const OrderTrackingModal: React.FC = () => {
  const { 
    selectedOrderForTracking, 
    setSelectedOrderForTracking,
    setSelectedOrderForInvoice,
    requestReturn,
    addToast
  } = useApp();

  const [returnReason, setReturnReason] = useState('');
  const [showReturnForm, setShowReturnForm] = useState(false);

  if (!selectedOrderForTracking) return null;

  const order = selectedOrderForTracking;

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnReason.trim()) return;
    requestReturn(order.id, returnReason);
    setShowReturnForm(false);
    setReturnReason('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-serif">
                Courier Tracking & Fulfillment
              </h3>
              <p className="text-[11px] text-slate-500">
                Order <strong className="text-slate-800 font-mono">{order.orderNumber}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedOrderForTracking(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tracking Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          
          {/* Quick Courier Status Card */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Payment</span>
                <span className="font-bold text-emerald-400 text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {order.paymentStatus?.toUpperCase() || 'PAID'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Shipping Status</span>
                <span className="font-bold text-amber-400 text-xs">
                  {order.shippingStatus?.replace(/_/g, ' ') || 'SHIPMENT CREATED'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Courier Partner</span>
                <span className="font-bold text-white text-xs">{order.courierPartner || 'Delhivery Express'}</span>
              </div>
              <div className="text-right sm:text-left">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">AWB Tracking #</span>
                <span className="font-mono font-bold text-purple-300 text-xs">{order.awbCode || order.trackingNumber || 'Pending AWB'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <span>Estimated Delivery: <strong className="text-emerald-400 font-semibold">{order.estimatedDeliveryDate || 'Within 2-3 Business Days'}</strong></span>
              {(order.shipmentTrackingUrl || order.awbCode) && (
                <a
                  href={order.shipmentTrackingUrl || `https://shiprocket.co/tracking/${order.awbCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-[11px] transition-colors"
                >
                  Live Courier Tracking →
                </a>
              )}
            </div>
          </div>

          {/* Step-by-Step Delivery Timeline */}
          <div className="space-y-4">
            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
              Live Shipment Stages
            </h4>

            <div className="space-y-6 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {order.trackingTimeline.map((step, idx) => (
                <div key={idx} className="relative space-y-1">
                  {/* Status Circle */}
                  <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white ${
                    step.done ? 'bg-emerald-600 ring-4 ring-emerald-100' : 'bg-slate-300 ring-4 ring-slate-100'
                  }`}>
                    {step.done ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3 text-slate-600" />}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <h5 className={`font-bold ${step.done ? 'text-slate-900' : 'text-slate-400'}`}>
                      {step.title}
                    </h5>
                    <span className="text-[10px] text-slate-400">{step.timestamp}</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-snug">{step.description}</p>
                  <p className="text-[10px] text-slate-600 font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-600" />
                    <span>{step.location}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address Display */}
          {order.shippingAddress && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Delivering To:
              </span>
              <p className="font-bold text-slate-900">{order.shippingAddress.fullName}</p>
              <p className="text-slate-600">{order.shippingAddress.line1}</p>
              <p className="text-slate-600">
                {order.shippingAddress.city}, {order.shippingAddress.state} - <strong>{order.shippingAddress.pincode}</strong>
              </p>
            </div>
          )}

          {/* Return & Replacement Option */}
          {order.hasPhysicalItems && (
            <div className="pt-4 border-t border-slate-200">
              {showReturnForm ? (
                <form onSubmit={handleReturnSubmit} className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3 text-xs">
                  <h5 className="font-bold text-amber-950">Request Free Return / Replacement</h5>
                  <p className="text-amber-800">
                    If pages are damaged, missing, or wrong edition was dispatched, we will pick up and send a replacement free of charge.
                  </p>
                  <textarea
                    rows={2}
                    required
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    placeholder="Describe issue (e.g. Binding tear on chapter 4 / damaged during transit)..."
                    className="w-full p-2 rounded-lg border border-amber-300 bg-white text-slate-900"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowReturnForm(false)}
                      className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-200 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold"
                    >
                      Submit Return Request
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Need help or exchange for this shipment?</span>
                  <button
                    onClick={() => setShowReturnForm(true)}
                    className="text-indigo-600 font-bold hover:text-indigo-800 cursor-pointer"
                  >
                    Request Replacement / Return
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                setSelectedOrderForTracking(null);
                setSelectedOrderForInvoice(order);
              }}
              className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Tax Invoice</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
