import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  User as UserIcon, 
  Mail, 
  Phone, 
  GraduationCap, 
  MapPin, 
  Package, 
  LogOut, 
  Plus, 
  Check, 
  Shield, 
  Building,
  Home,
  Compass,
  PhoneCall,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  ALL_INDIAN_STATES, 
  getDistrictsForState, 
  guessStateFromPincode 
} from '../../data/indiaLocations';

export const UserProfileModal: React.FC = () => {
  const { 
    currentUser, 
    isProfileModalOpen, 
    setIsProfileModalOpen, 
    logout, 
    setActiveView, 
    addAddress, 
    setDefaultAddress
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'addresses'>('profile');
  const [showAddAddr, setShowAddAddr] = useState(false);

  // Address form fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [pincode, setPincode] = useState('');
  const [selectedState, setSelectedState] = useState('Uttar Pradesh');
  const [selectedDistrict, setSelectedDistrict] = useState('Prayagraj (Allahabad)');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [addressType, setAddressType] = useState<'home' | 'work' | 'coaching_hostel' | 'other'>('home');
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);

  // Initialize defaults from current user
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.name || '');
      setPhone(currentUser.phone || '');
    }
  }, [currentUser]);

  // Update districts whenever selectedState changes
  useEffect(() => {
    const districts = getDistrictsForState(selectedState);
    setAvailableDistricts(districts);
    if (districts.length > 0 && !districts.includes(selectedDistrict)) {
      setSelectedDistrict(districts[0]);
    }
  }, [selectedState]);

  // When pincode is entered (6 digits), auto-detect state and district
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

  if (!isProfileModalOpen || !currentUser) return null;

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!street.trim() || !pincode.trim() || !selectedState || !selectedDistrict) return;
    
    addAddress({
      fullName: fullName.trim() || currentUser.name,
      phone: phone.trim() || currentUser.phone,
      alternatePhone: alternatePhone.trim() || undefined,
      pincode: pincode.trim(),
      state: selectedState,
      city: selectedDistrict,
      district: selectedDistrict,
      street: street.trim(),
      line1: street.trim(),
      landmark: landmark.trim() || undefined,
      addressType,
      isDefault: (currentUser.savedAddresses || []).length === 0
    });

    setStreet('');
    setLandmark('');
    setAlternatePhone('');
    setShowAddAddr(false);
  };

  return (
    <div id="user-profile-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-[#2874f0] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-white text-base sm:text-lg font-bold">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">{currentUser.name}</h3>
              <p className="text-xs text-blue-100 flex items-center gap-1.5 mt-0.5">
                <span className="capitalize">{currentUser.role}</span>
                {currentUser.studentRollNumber && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-yellow-300">{currentUser.studentRollNumber}</span>
                  </>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 text-xs font-semibold shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-[#2874f0] text-[#2874f0]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Account Details</span>
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'addresses'
                ? 'border-[#2874f0] text-[#2874f0]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Saved Addresses ({(currentUser.savedAddresses || []).length})</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" /> Email ID
                  </span>
                  <p className="text-sm font-medium text-slate-800 mt-1">{currentUser.email}</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" /> Mobile Number
                  </span>
                  <p className="text-sm font-medium text-slate-800 mt-1">{currentUser.phone}</p>
                </div>
              </div>

              {/* Enrolled Batches */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900 mb-2">
                  <GraduationCap className="w-4 h-4 text-[#2874f0]" />
                  <span>Enrolled Coaching Batches</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(currentUser.enrolledBatches || []).length > 0 ? (
                    currentUser.enrolledBatches.map((b, i) => (
                      <span key={i} className="px-2.5 py-1 bg-white border border-blue-300 text-blue-800 text-xs font-semibold rounded-md shadow-2xs">
                        {b}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">No batch assigned</span>
                  )}
                </div>
                <p className="text-[11px] text-blue-700 mt-2">
                  💡 Enrolled batch students get 100% Free PDF and up to 35% Hardcopy discounts automatically.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileModalOpen(false);
                    setActiveView('orders');
                  }}
                  className="flex-1 py-2 px-3 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5"
                >
                  <Package className="w-3.5 h-3.5 text-slate-500" />
                  <span>My Orders & Licenses</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileModalOpen(false);
                    logout();
                  }}
                  className="py-2 px-4 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Manage Delivery Addresses ({(currentUser.savedAddresses || []).length})
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddAddr(!showAddAddr)}
                  className="text-xs font-semibold text-[#2874f0] flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddAddr ? 'Cancel' : 'Add New Address'}</span>
                </button>
              </div>

              {showAddAddr && (
                <form onSubmit={handleSaveAddress} className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#2874f0]" />
                      <span>Add New Delivery Address</span>
                    </h5>
                    <span className="text-[11px] text-slate-500">All India Coverage</span>
                  </div>

                  {/* Name & Primary Mobile */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Student Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        10-Digit Mobile Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]"
                      />
                    </div>
                  </div>

                  {/* Alternate Mobile & Pincode */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
                        <span>Alternate Mobile Number</span>
                        <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="Secondary / Guardian Phone"
                        value={alternatePhone}
                        onChange={(e) => setAlternatePhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        6-Digit Pincode *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="e.g. 211002"
                        value={pincode}
                        onChange={(e) => handlePincodeChange(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]"
                      />
                    </div>
                  </div>

                  {/* Selectable Indian State & Cascading District Dropdowns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        State / UT (Selectable) *
                      </label>
                      <select
                        required
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0] cursor-pointer"
                      >
                        {ALL_INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        City / District (Selectable) *
                      </label>
                      <select
                        required
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0] cursor-pointer"
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

                  {/* Street Address & Landmark */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      House No., Building Name, Street / Colony / Area *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Flat 302, Vidyasagar Complex, Katra Road"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Landmark</span>
                      <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Near Railway Coaching Center / SBI ATM"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]"
                    />
                  </div>

                  {/* Address Type Selector */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                      Address Type
                    </label>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {[
                        { id: 'home', label: 'Home (All Day Delivery)', icon: Home },
                        { id: 'coaching_hostel', label: 'Coaching / Hostel / Library', icon: GraduationCap },
                        { id: 'work', label: 'Office / Work', icon: Building }
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setAddressType(t.id as any)}
                          className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 cursor-pointer transition-colors ${
                            addressType === t.id
                              ? 'bg-[#2874f0] text-white border-[#2874f0] font-semibold'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <t.icon className="w-3.5 h-3.5" />
                          <span>{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#2874f0] hover:bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    Save Delivery Address
                  </button>
                </form>
              )}

              {/* Saved Addresses List */}
              <div className="space-y-3">
                {(currentUser.savedAddresses || []).map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-3.5 rounded-xl border text-xs flex items-start justify-between transition-all ${
                      addr.isDefault ? 'border-[#2874f0] bg-blue-50/40 shadow-2xs' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{addr.fullName}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 uppercase">
                          {addr.addressType === 'coaching_hostel' ? 'Hostel/Coaching' : addr.addressType || 'Home'}
                        </span>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 bg-[#2874f0] text-white text-[10px] font-semibold rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-slate-700 font-medium">{addr.street || addr.line1}</p>
                      {addr.landmark && (
                        <p className="text-slate-500 text-[11px]">Landmark: {addr.landmark}</p>
                      )}
                      <p className="text-slate-700 font-semibold">
                        {addr.city || addr.district}, {addr.state} - <span className="font-bold text-[#2874f0]">{addr.pincode}</span>
                      </p>
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-600">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>Mobile: <strong>{addr.phone}</strong></span>
                        </span>
                        {addr.alternatePhone && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <PhoneCall className="w-3 h-3 text-slate-400" />
                            <span>Alt: {addr.alternatePhone}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {!addr.isDefault && (
                      <button
                        type="button"
                        onClick={() => setDefaultAddress(addr.id)}
                        className="text-xs font-semibold text-[#2874f0] hover:underline cursor-pointer ml-3 shrink-0"
                      >
                        Set Default
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
