import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ModiClassesLogo } from '../common/ModiClassesLogo';
import { 
  X, 
  ShieldCheck, 
  Truck, 
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
  Plus,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Address, Order } from '../../types';
import confetti from 'canvas-confetti';
import { 
  ALL_INDIAN_STATES, 
  getDistrictsForState, 
  guessStateFromPincode 
} from '../../data/indiaLocations';
import { UpiPaymentSection } from './UpiPaymentSection';
import { checkPincodeServiceability, ServiceabilityResponse } from '../../services/shippingService';
import { initiateCheckoutOrder, InitiateCheckoutResponse } from '../../services/paymentService';

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

  // Pincode Serviceability & Order Initiation State
  const [pincodeServiceability, setPincodeServiceability] = useState<ServiceabilityResponse | null>(null);
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [isInitiatingOrder, setIsInitiatingOrder] = useState(false);
  const [backendOrderInfo, setBackendOrderInfo] = useState<InitiateCheckoutResponse | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Validate pincode serviceability when pincode changes
  useEffect(() => {
    if (pincode && pincode.length === 6) {
      setIsCheckingPincode(true);
      checkPincodeServiceability(pincode).then((res) => {
        setPincodeServiceability(res);
        setIsCheckingPincode(false);
      });
    } else {
      setPincodeServiceability(null);
    }
  }, [pincode]);

  if (!isCheckoutModalOpen) return null;

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !customerPhone) {
      addToast('error', 'Required Fields', 'Please provide student name, email, and 10-digit mobile number.');
      return;
    }
    if (!street || !selectedDistrict || !selectedState || !pincode || pincode.length !== 6) {
      addToast('error', 'Address Incomplete', 'Please provide full delivery address with 6-digit pincode, selectable state, and city/district.');
      return;
    }

    // REQUIREMENT 13: Block unserviceable pincodes
    if (pincodeServiceability && !pincodeServiceability.serviceable) {
      addToast('error', 'Pincode Not Serviceable', 'This pincode is currently not serviceable by our delivery partners.');
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

    // ZERO-TRUST BACKEND ORDER INITIATION: Backend authoritatively calculates prices
    setIsInitiatingOrder(true);
    try {
      const orderInfo = await initiateCheckoutOrder({
        customerName,
        customerPhone,
        customerEmail,
        items: cart.map((i) => ({ bookId: i.bookId, quantity: i.quantity })),
        shippingAddress: {
          street,
          city: selectedDistrict,
          district: selectedDistrict,
          state: selectedState,
          pincode,
          landmark: landmark || undefined
        },
        couponCode: undefined,
        userId: currentUser?.id
      });

      setBackendOrderInfo(orderInfo);
      setStep('payment');
    } catch (err: any) {
      addToast('error', 'Checkout Error', err.message || 'Could not initiate checkout.');
    } finally {
      setIsInitiatingOrder(false);
    }
  };

  const handlePaymentSuccess = (verifiedData: any) => {
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

    const finalOrderNumber = verifiedData?.orderNumber || backendOrderInfo?.orderNumber || `MC-2026-${Date.now().toString().slice(-6)}`;
    const finalAwb = verifiedData?.awbCode || `DEL-${Math.floor(10000000000 + Math.random() * 90000000000)}-IN`;
    const finalCourier = verifiedData?.courierPartner || 'Delhivery Express';

    const newOrder = createOrder({
      orderNumber: finalOrderNumber,
      customerName,
      customerEmail,
      customerPhone,
      items: cart.map((item) => ({
        bookId: item.bookId,
        bookTitle: item.book.title,
        author: item.book.author,
        format: 'hardcopy',
        quantity: item.quantity,
        unitPrice: backendOrderInfo?.unitPrice || item.price,
        totalPrice: (backendOrderInfo?.unitPrice || item.price) * item.quantity,
        isBatchFree: false
      })),
      subtotal: backendOrderInfo?.subtotal || cartSubtotal,
      discount: backendOrderInfo?.discount || cartDiscount,
      shippingFee: backendOrderInfo?.shippingFee || 0,
      codFee: 0,
      taxAmount: Math.round((backendOrderInfo?.subtotal || cartSubtotal) * 0.05),
      totalAmount: backendOrderInfo?.totalAmount || cartTotal,
      paymentMethod: 'upi',
      paymentStatus: 'paid',
      paymentTransactionId: verifiedData?.paymentTransactionId || verifiedData?.transactionId || `UPI/${Date.now().toString().slice(-8)}`,
      orderStatus: 'processing',
      shippingStatus: verifiedData?.shippingStatus || 'SHIPMENT_CREATED',
      courierPartner: finalCourier,
      trackingNumber: finalAwb,
      awbCode: finalAwb,
      shipmentTrackingUrl: verifiedData?.trackingUrl || `https://shiprocket.co/tracking/${finalAwb}`,
      shippingAddress
    });

    setPlacedOrder(newOrder);
    setStep('success');

    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // Safe fallback
    }

    addToast('success', 'Order Confirmed & Shipment Created!', `AWB: ${finalAwb} assigned via ${finalCourier}.`);
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
            step === 'payment' ? 'text-purple-800' : step === 'success' ? 'text-emerald-700' : 'text-slate-400'
          }`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              step === 'payment' ? 'bg-purple-600 text-white' : step === 'success' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              2
            </span>
            <span>PhonePe & UPI</span>
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
                        className={`w-full px-3 py-2 rounded-xl border text-slate-900 bg-white focus:outline-none focus:ring-2 ${
                          pincodeServiceability && !pincodeServiceability.serviceable
                            ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20'
                            : 'border-slate-300 focus:ring-amber-500'
                        }`}
                      />
                      {/* Pincode Serviceability Indicator */}
                      {isCheckingPincode && (
                        <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Checking Shiprocket courier serviceability...</span>
                        </p>
                      )}
                      {pincodeServiceability && !isCheckingPincode && (
                        pincodeServiceability.serviceable ? (
                          <p className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-medium">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{pincodeServiceability.courierName} • {pincodeServiceability.estimatedDeliveryDays} (Free Delivery)</span>
                          </p>
                        ) : (
                          <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-semibold">
                            <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
                            <span>This pincode is currently not serviceable.</span>
                          </p>
                        )
                      )}
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

          {/* STEP 2: Payment Gateway (UPI & PhonePe Dedicated Component) */}
          {step === 'payment' && (
            <UpiPaymentSection
              amount={backendOrderInfo?.totalAmount || cartTotal}
              orderNumber={backendOrderInfo?.orderNumber}
              gatewayOrderId={backendOrderInfo?.gatewayOrderId}
              paymentUrl={backendOrderInfo?.paymentUrl}
              qrData={backendOrderInfo?.qrData}
              customerName={customerName}
              customerPhone={customerPhone}
              customerEmail={customerEmail}
              onBackToAddress={() => setStep('address')}
              onPaymentComplete={handlePaymentSuccess}
            />
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
