import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ModiClassesLogo } from '../common/ModiClassesLogo';
import { 
  X, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  QrCode, 
  Smartphone, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  MapPin, 
  User as UserIcon, 
  Lock, 
  Sparkles, 
  FileText, 
  Copy, 
  Check,
  Building,
  Home,
  GraduationCap,
  Phone,
  PhoneCall,
  Package,
  Plus
} from 'lucide-react';
import { Address, Order } from '../../types';
import confetti from 'canvas-confetti';
import { 
  ALL_INDIAN_STATES, 
  getDistrictsForState, 
  guessStateFromPincode 
} from '../../data/indiaLocations';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutModalOpen,
    setIsCheckoutModalOpen,
    cart,
    cartSubtotal,
    cartDiscount,
    shippingFee,
    cartTotal,
    currentUser,
    addAddress,
    createOrder,
    setActiveView,
    setSelectedOrderForInvoice,
    setSelectedOrderForTracking,
    addToast
  } = useApp();

  const [step, setStep] = useState<'address' | 'payment' | 'success'>('address');
  
  // Student Contact Details
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [alternatePhone, setAlternatePhone] = useState('');

  // Address Details
  const savedAddresses = currentUser?.savedAddresses || [];
  const defaultSavedAddress = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    savedAddresses.length > 0 ? (defaultSavedAddress?.id || 'new') : 'new'
  );

  const [pincode, setPincode] = useState(defaultSavedAddress?.pincode || '211002');
  const [selectedState, setSelectedState] = useState(defaultSavedAddress?.state || 'Uttar Pradesh');
  const [selectedDistrict, setSelectedDistrict] = useState(
    defaultSavedAddress?.district || defaultSavedAddress?.city || 'Prayagraj (Allahabad)'
  );
  const [street, setStreet] = useState(defaultSavedAddress?.street || defaultSavedAddress?.line1 || '');
  const [landmark, setLandmark] = useState(defaultSavedAddress?.landmark || '');
  const [addressType, setAddressType] = useState<'home' | 'work' | 'coaching_hostel' | 'other'>('home');
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);

  // Update district options whenever selectedState changes
  useEffect(() => {
    const districts = getDistrictsForState(selectedState);
    setAvailableDistricts(districts);
    if (districts.length > 0 && !districts.includes(selectedDistrict)) {
      setSelectedDistrict(districts[0]);
    }
  }, [selectedState]);

  // Sync if user logs in or switches
  useEffect(() => {
    if (currentUser) {
      if (!customerName) setCustomerName(currentUser.name || '');
      if (!customerEmail) setCustomerEmail(currentUser.email || '');
      if (!customerPhone) setCustomerPhone(currentUser.phone || '');
      if (currentUser.savedAddresses?.length > 0 && selectedAddressId === 'new') {
        const def = currentUser.savedAddresses.find((a) => a.isDefault) || currentUser.savedAddresses[0];
        if (def) {
          setSelectedAddressId(def.id);
          applySavedAddress(def);
        }
      }
    }
  }, [currentUser]);

  const applySavedAddress = (addr: Address) => {
    setCustomerName(addr.fullName || currentUser?.name || '');
    setCustomerPhone(addr.phone || currentUser?.phone || '');
    setAlternatePhone(addr.alternatePhone || '');
    setPincode(addr.pincode);
    setSelectedState(addr.state);
    const dists = getDistrictsForState(addr.state);
    setAvailableDistricts(dists);
    setSelectedDistrict(addr.district || addr.city);
    setStreet(addr.street || addr.line1 || '');
    setLandmark(addr.landmark || '');
    setAddressType(addr.addressType || 'home');
  };

  const handleSelectAddressChange = (addrId: string) => {
    setSelectedAddressId(addrId);
    if (addrId === 'new') {
      setStreet('');
      setLandmark('');
      setAlternatePhone('');
    } else {
      const found = savedAddresses.find((a) => a.id === addrId);
      if (found) {
        applySavedAddress(found);
      }
    }
  };

  const handlePincodeChange = (val: string) => {
    const clean = val.replace(/[^0-9]/g, '').slice(0, 6);
    setPincode(clean);
    if (clean.length === 6) {
      const guessed = guessStateFromPincode(clean);
      if (guessed.state) {
        setSelectedState(guessed.state);
        const dists = getDistrictsForState(guessed.state);
        setAvailableDistricts(dists);
        if (guessed.defaultDistrict && dists.includes(guessed.defaultDistrict)) {
          setSelectedDistrict(guessed.defaultDistrict);
        }
      }
    }
  };

  // Payment Options
  const [paymentMethod, setPaymentMethod] = useState<'upi_qr' | 'upi_intent' | 'card' | 'cod'>('upi_qr');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [qrTimer, setQrTimer] = useState(300);

  useEffect(() => {
    let interval: any;
    if (step === 'payment' && paymentMethod === 'upi_qr') {
      interval = setInterval(() => {
        setQrTimer((prev) => (prev > 0 ? prev - 1 : 300));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, paymentMethod]);

  if (!isCheckoutModalOpen) return null;

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !customerPhone) {
      addToast('error', 'Required Fields', 'Please provide student name, email, and 10-digit mobile number.');
      return;
    }
    if (!street || !selectedDistrict || !selectedState || !pincode || pincode.length !== 6) {
      addToast('error', 'Address Incomplete', 'Please provide full delivery address with 6-digit pincode, selectable state, and city/district.');
      return;
    }

    if (selectedAddressId === 'new' && currentUser) {
      addAddress({
        fullName: customerName,
        phone: customerPhone,
        alternatePhone: alternatePhone || undefined,
        street,
        line1: street,
        city: selectedDistrict,
        district: selectedDistrict,
        state: selectedState,
        pincode,
        landmark: landmark || undefined,
        addressType,
        isDefault: (currentUser.savedAddresses || []).length === 0
      });
    }

    setStep('payment');
  };

  const handleExecutePayment = () => {
    setIsProcessingPayment(true);

    const shippingAddress: Address = {
      id: selectedAddressId !== 'new' ? selectedAddressId : 'addr-' + Date.now(),
      fullName: customerName,
      phone: customerPhone,
      alternatePhone: alternatePhone || undefined,
      line1: street,
      street,
      city: selectedDistrict,
      district: selectedDistrict,
      state: selectedState,
      pincode,
      landmark: landmark || undefined,
      addressType
    };

    const codSurcharge = paymentMethod === 'cod' ? 40 : 0;
    const finalTotal = cartTotal + codSurcharge;

    setTimeout(() => {
      setIsProcessingPayment(false);
      const newOrder = createOrder({
        customerName,
        customerEmail,
        customerPhone,
        items: cart.map((item) => ({
          bookId: item.bookId,
          bookTitle: item.book.title,
          author: item.book.author,
          format: 'hardcopy',
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
          isBatchFree: false
        })),
        subtotal: cartSubtotal,
        discountAmount: cartDiscount,
        shippingFee: 0,
        codFee: codSurcharge,
        taxAmount: Math.round(cartSubtotal * 0.05),
        finalTotal,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        orderStatus: 'confirmed',
        shippingAddress
      });

      setPlacedOrder(newOrder);
      setStep('success');

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fallback
      }

      addToast('success', 'Order Placed!', `Your RRB ALP Psycho Test Book has been booked successfully.`);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 text-slate-900 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-3">
            <ModiClassesLogo size={38} />
            <div>
              <h2 className="font-bold text-sm text-slate-900 font-serif">Modi Railway Psychotest Classes</h2>
              <p className="text-[11px] text-amber-700 font-semibold">Official Physical Book Dispatch Portal</p>
            </div>
          </div>

          <button
            onClick={() => setIsCheckoutModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress */}
        <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className={`flex items-center gap-2 font-bold ${
            step === 'address' ? 'text-amber-800' : 'text-emerald-700'
          }`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              step === 'address' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white'
            }`}>
              1
            </span>
            <span>Delivery Address</span>
          </div>

          <div className="h-px bg-slate-300 flex-1 mx-4"></div>

          <div className={`flex items-center gap-2 font-bold ${
            step === 'payment' ? 'text-amber-800' : step === 'success' ? 'text-emerald-700' : 'text-slate-400'
          }`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              step === 'payment' ? 'bg-amber-500 text-slate-950' : step === 'success' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              2
            </span>
            <span>UPI & Payment</span>
          </div>

          <div className="h-px bg-slate-300 flex-1 mx-4"></div>

          <div className={`flex items-center gap-2 font-bold ${
            step === 'success' ? 'text-emerald-700' : 'text-slate-400'
          }`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              step === 'success' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              3
            </span>
            <span>Order Confirmed</span>
          </div>
        </div>

        {/* Modal Content Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          
          {/* STEP 1: Address & Contact */}
          {step === 'address' && (
            <form onSubmit={handleProceedToPayment} className="space-y-5">
              
              {/* Saved Addresses quick picker (if any) */}
              {savedAddresses.length > 0 && (
                <div className="space-y-2 pb-3 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Select Delivery Address:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelectAddressChange('new')}
                      className={`text-xs font-bold cursor-pointer ${
                        selectedAddressId === 'new' ? 'text-amber-700 underline' : 'text-[#2874f0] hover:underline'
                      }`}
                    >
                      + Add New Address
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {savedAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => handleSelectAddressChange(addr.id)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          selectedAddressId === addr.id
                            ? 'border-[#2874f0] bg-blue-50/50 ring-2 ring-[#2874f0]/40 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>{addr.fullName}</span>
                          <span className="text-[10px] text-slate-500 uppercase">
                            {addr.addressType || 'Home'}
                          </span>
                        </div>
                        <p className="text-slate-600 truncate mt-1">{addr.street || addr.line1}</p>
                        <p className="text-slate-700 font-semibold">{addr.city || addr.district}, {addr.state} - {addr.pincode}</p>
                        <p className="text-slate-500 text-[11px]">Phone: {addr.phone}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-amber-600" />
                  <span>Student & Contact Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Aman Deep Verma"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="e.g. student@gmail.com"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      10-Digit Mobile *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-600" />
                  <span>Doorstep Delivery Address</span>
                </h3>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  {/* Alternate Mobile & Pincode */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                        <span>Alternate Mobile Number</span>
                        <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                      </label>
                      <input
                        type="tel"
                        value={alternatePhone}
                        onChange={(e) => setAlternatePhone(e.target.value)}
                        placeholder="Secondary / Parent Phone"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        6-Digit Pincode *
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={pincode}
                        onChange={(e) => handlePincodeChange(e.target.value)}
                        placeholder="e.g. 211002"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Selectable State & Selectable District (All States of India) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        State / UT (Selectable) *
                      </label>
                      <select
                        required
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer font-medium"
                      >
                        {ALL_INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        City / District (Selectable) *
                      </label>
                      <select
                        required
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer font-medium"
                      >
                        {availableDistricts.length > 0 ? (
                          availableDistricts.map((dst) => (
                            <option key={dst} value={dst}>
                              {dst}
                            </option>
                          ))
                        ) : (
                          <option value="General District">General District</option>
                        )}
                      </select>
                    </div>
                  </div>

                  {/* House / Street Address */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      House / Flat No., Building Name, Street / Colony / Area *
                    </label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="e.g. House No. 42, Near Railway Coaching Colony, Katra"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Landmark */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Landmark</span>
                      <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                    </label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="e.g. Near Railway Station / SBI Branch"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Address Type Selector */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Address Type
                    </label>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {[
                        { id: 'home', label: 'Home (All Day)', icon: Home },
                        { id: 'coaching_hostel', label: 'Coaching / Hostel / Library', icon: GraduationCap },
                        { id: 'work', label: 'Office / Work', icon: Building }
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setAddressType(t.id as any)}
                          className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 cursor-pointer transition-colors ${
                            addressType === t.id
                              ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <t.icon className="w-3.5 h-3.5" />
                          <span>{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order summary mini bar */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500">Payable Total:</span>
                  <span className="text-lg font-black text-slate-900 ml-2">₹{cartTotal}</span>
                </div>

                <button
                  type="submit"
                  className="py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Payment Gateway */}
          {step === 'payment' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep('address')}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Address</span>
                </button>

                <div className="text-right">
                  <span className="text-xs text-slate-500">Total:</span>
                  <span className="text-base font-black text-slate-950 ml-1.5">
                    ₹{paymentMethod === 'cod' ? cartTotal + 40 : cartTotal}
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi_qr')}
                  className={`p-3 rounded-xl border flex flex-col items-center text-center gap-1 cursor-pointer transition-all ${
                    paymentMethod === 'upi_qr'
                      ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold ring-2 ring-amber-400'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-amber-700" />
                  <span>UPI QR Code</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi_intent')}
                  className={`p-3 rounded-xl border flex flex-col items-center text-center gap-1 cursor-pointer transition-all ${
                    paymentMethod === 'upi_intent'
                      ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold ring-2 ring-amber-400'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-blue-600" />
                  <span>PhonePe/GPay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border flex flex-col items-center text-center gap-1 cursor-pointer transition-all ${
                    paymentMethod === 'card'
                      ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold ring-2 ring-amber-400'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  <span>Debit / Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-xl border flex flex-col items-center text-center gap-1 cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold ring-2 ring-amber-400'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <Package className="w-5 h-5 text-emerald-600" />
                  <span>Cash on Delivery</span>
                </button>
              </div>

              {/* UPI QR View */}
              {paymentMethod === 'upi_qr' && (
                <div className="p-6 rounded-2xl bg-slate-900 text-white text-center space-y-3">
                  <div className="inline-block p-3 bg-white rounded-2xl shadow-xl">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=modiclasses@okhdfcbank%26pn=Modi%20Railway%20Classes%26am=${cartTotal}%26cu=INR`}
                      alt="UPI QR Code"
                      className="w-40 h-40 mx-auto"
                    />
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
                    Scan with <strong>Google Pay, PhonePe, Paytm, or BHIM</strong> to complete payment.
                  </p>

                  <button
                    onClick={handleExecutePayment}
                    disabled={isProcessingPayment}
                    className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isProcessingPayment ? 'Verifying Payment...' : `Confirm Payment of ₹${cartTotal}`}
                  </button>
                </div>
              )}

              {/* UPI App Selector View */}
              {paymentMethod === 'upi_intent' && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">Select Preferred UPI App:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI'].map((name) => (
                      <div key={name} className="p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 text-center">
                        {name}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleExecutePayment}
                    disabled={isProcessingPayment}
                    className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md cursor-pointer"
                  >
                    {isProcessingPayment ? 'Connecting UPI...' : `Pay ₹${cartTotal}`}
                  </button>
                </div>
              )}

              {/* COD View */}
              {paymentMethod === 'cod' && (
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-3 text-xs text-amber-950">
                  <h4 className="font-bold text-sm">Cash on Delivery (Doorstep Payment)</h4>
                  <p>Pay cash directly to Delhivery courier agent upon parcel delivery. (+₹40 COD handling charges apply).</p>
                  <button
                    onClick={handleExecutePayment}
                    disabled={isProcessingPayment}
                    className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md cursor-pointer"
                  >
                    {isProcessingPayment ? 'Confirming...' : `Confirm COD Order (₹${cartTotal + 40})`}
                  </button>
                </div>
              )}

              {/* Card View */}
              {paymentMethod === 'card' && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Card Number</label>
                    <input
                      type="text"
                      defaultValue="4532 •••• •••• 9821"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                  <button
                    onClick={handleExecutePayment}
                    disabled={isProcessingPayment}
                    className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md cursor-pointer"
                  >
                    {isProcessingPayment ? 'Processing...' : `Pay ₹${cartTotal}`}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Success Screen */}
          {step === 'success' && placedOrder && (
            <div className="text-center space-y-5 py-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                  Order Confirmed
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-serif pt-1">
                  Thank You, {placedOrder.customerName}!
                </h2>
                <p className="text-xs text-slate-500">
                  Order Number: <strong className="font-mono text-slate-800">{placedOrder.orderNumber}</strong>
                </p>
              </div>

              {/* Physical Dispatch Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs text-slate-700">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    Physical Book Dispatch (48h)
                  </span>
                  <span className="text-indigo-700 font-mono">{placedOrder.trackingNumber}</span>
                </div>
                <p>
                  Your parcel (524 Pages Book + 50 OMR Sheets + Simulator Access Key) is being prepared at our Mukherjee Nagar Dispatch Center.
                </p>
                {placedOrder.shippingAddress && (
                  <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                    <strong>Delivery To:</strong> {placedOrder.shippingAddress.fullName} ({placedOrder.shippingAddress.phone}), {placedOrder.shippingAddress.street || placedOrder.shippingAddress.line1}, {placedOrder.shippingAddress.city || placedOrder.shippingAddress.district}, {placedOrder.shippingAddress.state} - {placedOrder.shippingAddress.pincode}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    setIsCheckoutModalOpen(false);
                    setSelectedOrderForTracking(placedOrder);
                  }}
                  className="py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  <span>Track Courier Delivery</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedOrderForInvoice(placedOrder);
                  }}
                  className="py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Download Invoice</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
