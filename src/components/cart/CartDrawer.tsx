import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ModiClassesLogo } from '../common/ModiClassesLogo';
import { 
  X, 
  ShoppingBag, 
  Trash2, 
  Sparkles, 
  Tag, 
  Truck, 
  ArrowRight, 
  ShieldCheck, 
  BookOpen,
  Plus,
  Minus
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    cart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartSubtotal,
    cartDiscount,
    shippingFee,
    cartTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    setIsCheckoutModalOpen
  } = useApp();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isCartDrawerOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponError('');
      setCouponInput('');
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartDrawerOpen(false);
    setIsCheckoutModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-xs flex justify-end animate-fade-in">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200">
        
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 text-slate-900">
          <div className="flex items-center gap-2.5">
            <ModiClassesLogo size={34} />
            <div>
              <h2 className="font-bold text-sm text-slate-900">Your Order Cart</h2>
              <p className="text-[11px] text-amber-700 font-semibold">Modi Railway Psychotest Classes</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 px-2 py-1 rounded-md hover:bg-slate-100 cursor-pointer"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Free Shipping Notice */}
        <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-200 text-xs text-amber-950 flex items-center justify-between">
          <span className="font-bold flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-amber-700" />
            <span>🎉 FREE Courier Delivery Included across India</span>
          </span>
          <span className="text-[10px] font-extrabold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
            48h Dispatch
          </span>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-sm text-slate-800">Your Cart is Empty</h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Add the official RRB ALP Psycho Test (CBAT) Master Hardcopy Book to proceed.
              </p>
              <button
                onClick={() => setIsCartDrawerOpen(false)}
                className="mt-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
              >
                View 3D Book Showcase
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div 
                key={item.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-3 shadow-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="w-14 h-18 rounded-lg bg-slate-900 border border-amber-400 flex flex-col justify-between p-1.5 text-center shrink-0">
                    <span className="text-[8px] font-black text-amber-400 uppercase">RDSO 2026</span>
                    <span className="text-[9px] font-bold text-white leading-tight font-serif">ALP PSYCHO</span>
                    <span className="text-[7px] text-slate-400">524 Pgs</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[9px] font-black text-amber-800 uppercase bg-amber-100 px-1.5 py-0.5 rounded-sm">
                        PHYSICAL BOOK + 50 OMRs
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 leading-snug line-clamp-2 mt-1 font-serif">
                      {item.book.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">By {item.book.author}</p>
                    <p className="text-[10px] text-emerald-700 font-semibold mt-1">
                      ✓ Includes Simulator Access Key + 50 OMR Sheets
                    </p>
                  </div>
                </div>

                {/* Bottom Row: Quantity & Price */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 py-1 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 font-bold text-slate-900 text-xs">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      className="px-2.5 py-1 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-slate-900 text-sm">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: Coupons & Checkout Summary */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-4">
            
            {/* Coupon Box */}
            <div className="space-y-1.5">
              {appliedCoupon ? (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold text-emerald-900 uppercase">{appliedCoupon.code}</span>
                      <p className="text-[10px] text-emerald-700">{appliedCoupon.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs font-bold text-rose-600 hover:text-rose-800 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Coupon Code (e.g. MODI100)"
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs uppercase font-bold text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-[11px] text-rose-600">{couponError}</p>}
                </form>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-200 pt-3">
              <div className="flex justify-between">
                <span>Hardcopy Book Subtotal:</span>
                <span className="font-semibold text-slate-900">₹{cartSubtotal}</span>
              </div>

              {cartDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount:</span>
                  <span>-₹{cartDiscount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Express Courier Shipping:</span>
                <span className="text-emerald-700 font-bold">FREE (₹0)</span>
              </div>

              <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount to Pay:</span>
                <span className="text-base text-slate-950 font-black">₹{cartTotal}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={handleProceedToCheckout}
              className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/25 transition-all cursor-pointer"
              id="drawer-proceed-checkout-btn"
            >
              <span>Proceed to Delivery & Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>
        )}

      </div>
    </div>
  );
};
