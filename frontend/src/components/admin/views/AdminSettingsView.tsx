import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { 
  Settings, 
  User, 
  Lock, 
  Store, 
  Truck, 
  Bell, 
  ShieldCheck, 
  Save, 
  CheckCircle2, 
  AlertTriangle,
  KeyRound,
  ShieldAlert
} from 'lucide-react';

export const AdminSettingsView: React.FC = () => {
  const { adminUser } = useAdminAuth();
  
  // Settings Form State
  const [storeName, setStoreName] = useState('Modi Railway Classes');
  const [contactEmail, setContactEmail] = useState('support@modiclasses.in');
  const [contactPhone, setContactPhone] = useState('+91 94310 00000');
  const [storeAddress, setStoreAddress] = useState('Patna Coaching Hub, Bihar, India - 800001');
  const [orderPrefix, setOrderPrefix] = useState('MC-ALP-');
  const [codFee, setCodFee] = useState(40);
  const [defaultCourier, setDefaultCourier] = useState('Delhivery Express');
  const [dispatchHours, setDispatchHours] = useState('24 Hours');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);

  // Admin Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Settings Save State
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch initial settings from backend
    const fetchSettings = async () => {
      const token = localStorage.getItem('modi_admin_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      try {
        const res = await fetch('/api/admin/settings', { headers, credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          const s = data.settings || data;
          if (s.storeName) setStoreName(s.storeName);
          if (s.contactEmail) setContactEmail(s.contactEmail);
          if (s.contactPhone) setContactPhone(s.contactPhone);
          if (s.address) setStoreAddress(s.address);
          if (s.orderPrefix) setOrderPrefix(s.orderPrefix);
          if (s.codFee !== undefined) setCodFee(Number(s.codFee));
          if (s.defaultCourier) setDefaultCourier(s.defaultCourier);
          if (s.dispatchHours) setDispatchHours(s.dispatchHours);
          if (s.emailNotifications !== undefined) setEmailNotifications(Boolean(s.emailNotifications));
          if (s.smsNotifications !== undefined) setSmsNotifications(Boolean(s.smsNotifications));
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsSuccess(null);
    setSettingsError(null);

    const token = localStorage.getItem('modi_admin_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          settings: {
            storeName,
            contactEmail,
            contactPhone,
            address: storeAddress,
            orderPrefix,
            codFee,
            defaultCourier,
            dispatchHours,
            emailNotifications,
            smsNotifications
          }
        })
      });

      if (res.ok) {
        setSettingsSuccess('Store settings saved successfully.');
        setTimeout(() => setSettingsSuccess(null), 3500);
      } else {
        setSettingsError('Failed to save store configuration.');
      }
    } catch (err: any) {
      setSettingsError(err.message || 'Error communicating with server.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setIsChangingPassword(true);
    const token = localStorage.getItem('modi_admin_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          passwordChange: {
            currentPassword,
            newPassword
          }
        })
      });

      const data = await res.json();
      if (res.ok) {
        setPasswordSuccess('Master admin password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(null), 4000);
      } else {
        setPasswordError(data.error || 'Failed to update password.');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Network error updating password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-100 max-w-5xl mx-auto">
      
      {/* Security Architecture Notice */}
      <div className="p-4 bg-blue-950/40 border border-blue-900/50 rounded-2xl flex items-start gap-3 text-xs">
        <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-white">Security & Environment Isolation Compliant</p>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Sensitive database credentials (<code className="text-blue-300">DATABASE_URL</code>), payment gateway secret keys, SMS auth tokens (<code className="text-blue-300">TWILIO_AUTH_TOKEN</code>), and mail server passwords (<code className="text-blue-300">SMTP_PASS</code>) are strictly held in secure server environment variables and never exposed to the frontend interface.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Store & Order Settings */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveSettings} className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-6 shadow-xl">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Store className="w-4 h-4 text-blue-400" />
                  <span>Store & Order Configuration</span>
                </h3>
                <p className="text-xs text-slate-400">Single-book storefront identity & delivery defaults.</p>
              </div>
            </div>

            {settingsSuccess && (
              <div className="p-3 bg-emerald-950/70 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{settingsSuccess}</span>
              </div>
            )}

            {settingsError && (
              <div className="p-3 bg-rose-950/70 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{settingsError}</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Store / Brand Name
                  </label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Customer Support Phone
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Order ID Prefix
                  </label>
                  <input
                    type="text"
                    value={orderPrefix}
                    onChange={(e) => setOrderPrefix(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                  Dispatch Center / Warehouse Address
                </label>
                <textarea
                  rows={2}
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Cash on Delivery (COD) Fee
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-mono">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={codFee}
                      onChange={(e) => setCodFee(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Default Courier Partner
                  </label>
                  <input
                    type="text"
                    value={defaultCourier}
                    onChange={(e) => setDefaultCourier(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Automated Customer Notifications
                </span>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded bg-slate-950 border-slate-700"
                    />
                    <span className="text-slate-300 font-medium">Send automated dispatch emails with tracking URL</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={smsNotifications}
                      onChange={(e) => setSmsNotifications(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded bg-slate-950 border-slate-700"
                    />
                    <span className="text-slate-300 font-medium">Send SMS OTP & order delivery status updates</span>
                  </label>
                </div>
              </div>

            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-900/30 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {isSavingSettings ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Store Settings</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Admin Profile & Master Password Change */}
        <div className="space-y-6">
          
          {/* Admin Profile Overview */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl text-xs">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" />
              <span>Admin Profile</span>
            </h3>

            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-base mb-2">
                {adminUser?.name?.charAt(0) || 'A'}
              </div>
              <p className="font-bold text-white text-sm">{adminUser?.name || 'sandeep'}</p>
              <p className="text-slate-400 font-mono">{adminUser?.email || 'admin@modiclasses.in'}</p>
              <span className="inline-block px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold uppercase">
                Master Administrator
              </span>
            </div>
          </div>

          {/* Change Admin Password */}
          <form onSubmit={handleChangePassword} className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl text-xs">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-rose-400" />
              <span>Change Admin Password</span>
            </h3>
            <p className="text-slate-400 text-[11px]">
              Update the master credential used to access the dedicated admin panel.
            </p>

            {passwordSuccess && (
              <div className="p-3 bg-emerald-950/70 border border-emerald-800 text-emerald-300 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3 bg-rose-950/70 border border-rose-800 text-rose-300 rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Current Master Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  New Password (Min 8 chars)
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-rose-900/30 disabled:opacity-50"
            >
              {isChangingPassword ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Update Admin Password</span>
                </>
              )}
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};
