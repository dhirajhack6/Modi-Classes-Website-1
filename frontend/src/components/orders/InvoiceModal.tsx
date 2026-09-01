import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Printer, 
  Download, 
  BookOpen, 
  CheckCircle2, 
  ShieldCheck,
  Building
} from 'lucide-react';
import { Order } from '../../types';

export const InvoiceModal: React.FC = () => {
  const { selectedOrderForInvoice, setSelectedOrderForInvoice, addToast } = useApp();

  if (!selectedOrderForInvoice) return null;

  const order = selectedOrderForInvoice;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadInvoice = () => {
    addToast('success', 'Invoice Downloaded', `Invoice ${order.invoiceNumber}.pdf saved.`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Controls Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-800 font-serif">GST Tax Invoice</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-sm">
              PAID & VERIFIED
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={() => setSelectedOrderForInvoice(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-8 sm:p-12 overflow-y-auto space-y-8 text-xs text-slate-800" id="printable-invoice">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pb-6 border-b-2 border-slate-900">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-800 text-white flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-black text-slate-900 font-serif tracking-tight">
                    MODI RAILWAY PSYCHOTEST CLASSES
                  </h1>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                    Official RRB ALP (CBAT) Psychological Aptitude Publications
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 max-w-sm pt-1">
                Modi Classes Academic Tower, Mukherjee Nagar, New Delhi - 110009<br />
                <strong>GSTIN:</strong> 07AAECM9821Q1Z8 • <strong>Email:</strong> railway@modiclasses.in
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="text-base font-black text-indigo-800 font-mono block">
                {order.invoiceNumber}
              </span>
              <p className="text-[11px] text-slate-500">
                Date: {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
              </p>
              <p className="text-[11px] text-slate-500">
                Order Ref: <strong className="font-mono text-slate-800">{order.orderNumber}</strong>
              </p>
              <p className="text-[11px] text-emerald-700 font-bold">
                Status: {order.paymentStatus.toUpperCase()} ({order.paymentMethod.toUpperCase()})
              </p>
            </div>
          </div>

          {/* Billed To / Shipped To Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-slate-200">
            <div className="space-y-1">
              <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider text-slate-500 block">
                Billed Student / Buyer:
              </span>
              <h3 className="font-bold text-sm text-slate-900">{order.customerName}</h3>
              <p className="text-slate-600">{order.customerEmail}</p>
              <p className="text-slate-600">Phone: {order.customerPhone}</p>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider text-slate-500 block">
                Shipping / Fulfillment Destination:
              </span>
              {order.shippingAddress ? (
                <>
                  <p className="font-semibold text-slate-900">{order.shippingAddress.line1}</p>
                  <p className="text-slate-600">
                    {order.shippingAddress.city}, {order.shippingAddress.state} - <strong>{order.shippingAddress.pincode}</strong>
                  </p>
                  <p className="text-[11px] text-indigo-700 font-medium">
                    Courier: {order.courierPartner} (AWB: {order.trackingNumber})
                  </p>
                </>
              ) : (
                <p className="text-slate-600 italic">
                  Digital Delivery: Access granted instantly in Modi Classes Student Library.
                </p>
              )}
            </div>
          </div>

          {/* Itemized Table */}
          <div className="space-y-3">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-slate-900 bg-slate-50 text-[11px] uppercase font-bold text-slate-700">
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-2">HSN</th>
                  <th className="py-2.5 px-2 text-center">Format</th>
                  <th className="py-2.5 px-2 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-900">{item.bookTitle}</p>
                      <p className="text-[10px] text-slate-500">By {item.author}</p>
                    </td>
                    <td className="py-3 px-2 font-mono text-slate-600 text-[11px]">
                      {item.format === 'pdf' ? '9984' : '4901'}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="font-bold text-[10px] uppercase bg-slate-100 px-2 py-0.5 rounded-sm">
                        {item.format}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center font-bold">{item.quantity}</td>
                    <td className="py-3 px-3 text-right">₹{item.unitPrice}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">₹{item.totalPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Calculations Breakdown */}
            <div className="flex justify-end pt-4">
              <div className="w-full sm:w-64 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-900">₹{order.subtotal}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount ({order.couponCode || 'Promo'}):</span>
                    <span>-₹{order.discount}</span>
                  </div>
                )}
                {order.shippingFee > 0 && (
                  <div className="flex justify-between">
                    <span>Courier Delivery Fee:</span>
                    <span>₹{order.shippingFee}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Integrated GST (5% Included):</span>
                  <span>₹{order.taxAmount}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-slate-900 pt-2 border-t-2 border-slate-900">
                  <span>Total Amount Paid:</span>
                  <span className="text-base text-indigo-800">₹{order.totalAmount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stamp & Authorized Signatory */}
          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-[11px] text-slate-500">
            <div className="space-y-1 text-center sm:text-left">
              <p className="font-bold text-slate-800">Terms & Conditions:</p>
              <p>1. Physical books eligible for 7-day replacement if received damaged.</p>
              <p>2. Digital PDF licenses are non-transferable and watermarked for copyright.</p>
              <p>3. This is a computer-generated tax invoice and requires no physical signature.</p>
            </div>

            <div className="text-center space-y-2">
              <div className="w-28 h-12 border border-dashed border-slate-300 rounded-lg flex items-center justify-center bg-slate-50 mx-auto text-indigo-900 font-bold font-serif text-xs">
                MODI CLASSES<br />ACCOUNTS
              </div>
              <p className="font-bold text-slate-900">Authorized Signatory</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
