import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Smartphone, 
  Mail, 
  User as UserIcon, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Lock,
  BookOpen,
  KeyRound,
  GraduationCap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getApiUrl } from '../../services/api';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    authModalMode, 
    setAuthModalMode,
    login, 
    signup, 
    usersList,
    quickLoginAs 
  } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  
  // OTP stage state
  const [otpValue, setOtpValue] = useState(['', '', '', '']);
  const [otpSentTo, setOtpSentTo] = useState('');
 
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingSignupData, setPendingSignupData] = useState<{ name: string; phone: string; email: string } | null>(null);
  const [otpPurpose, setOtpPurpose] = useState<'login' | 'signup'>('login');

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setErrorMessage('');
    setOtpValue(['', '', '', '']);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!identifier.trim()) {
      setErrorMessage('Please enter your Mobile number or Email ID.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/auth/send-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() })
      });
      const data = await response.json();
      setIsLoading(false);

      if (response.ok && data.success) {
  setOtpSentTo(identifier.trim());
  setOtpPurpose('login');
  setOtpValue(['', '', '', '']);
  setAuthModalMode('otp');
} else {
  setErrorMessage(data.error || 'Failed to send OTP. Please try again.');
}
    } catch (err) {
      setIsLoading(false);
      setErrorMessage('Network error. Failed to send OTP.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otpValue.join('');
    if (entered.length < 4) {
      setErrorMessage('Please enter the complete 4-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/auth/verify-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: otpSentTo, otp: entered })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        if (otpPurpose === 'login') {
          const res = await login(otpSentTo);
          setIsLoading(false);
          if (!res.success) {
            setErrorMessage(res.error || 'Authentication failed. Please try again.');
          }
        } else if (otpPurpose === 'signup' && pendingSignupData) {
          const res = await signup(pendingSignupData);
          setIsLoading(false);
          if (!res.success) {
            setErrorMessage(res.error || 'Registration failed.');
          }
        }
      } else {
        setIsLoading(false);
        setErrorMessage(data.error || 'Invalid OTP code. Please check and try again.');
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMessage('Network error. Failed to verify OTP.');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!fullName.trim()) {
      setErrorMessage('Please enter your Full Name.');
      return;
    }
    if (!signupPhone.trim()) {
      setErrorMessage('Please enter your Mobile number.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setErrorMessage('Please enter a valid Email address.');
      return;
    }

    setIsLoading(true);
    const targetEmail = signupEmail.trim().toLowerCase();
       try{
      const response = await fetch(getApiUrl('/api/auth/send-otp'), {
        method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ identifier: targetEmail })
         });
      const data = await response.json();
      setIsLoading(false);

      if (response.ok && data.success) {
        setPendingSignupData({ name: fullName, phone: signupPhone, email: signupEmail });
        setOtpSentTo(targetEmail);
        setOtpPurpose('signup');
         setOtpValue(['', '', '', '']);
          setAuthModalMode('otp');
      } else {
        setErrorMessage(data.error || 'Failed to send verification OTP.');
    }
    } catch (err) {
      setIsLoading(false);
      setErrorMessage('Network error. Failed to send verification OTP.');
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) {
      val = val.slice(-1);
    }
    const next = [...otpValue];
    next[index] = val;
    setOtpValue(next);

    // Auto-focus next input
    if (val && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValue[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <div id="auth-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-200 max-h-[92vh] overflow-y-auto md:overflow-hidden"
      >
        {/* Close Button */}
        <button
          id="close-auth-modal-btn"
          onClick={handleClose}
          className="absolute top-3 right-3 z-20 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Blue Brand Banner */}
        <div className="w-full md:w-2/5 bg-[#2874f0] text-white p-5 sm:p-8 flex flex-col justify-between relative overflow-hidden shrink-0">
          {/* Subtle Background Pattern */}
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-blue-600/50 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-6 -top-6 w-32 h-32 bg-sky-400/20 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-xs font-medium tracking-wide mb-2 sm:mb-4">
              <GraduationCap className="w-3.5 h-3.5 text-yellow-300" />
              <span>Modi Railway Classes</span>
            </div>

            {authModalMode === 'login' && (
              <>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1 sm:mb-2">Login</h2>
                <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
                  Access your Orders, CBAT Master Books, and Student Batch Discounts.
                </p>
              </>
            )}

            {authModalMode === 'signup' && (
              <>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1 sm:mb-2">Create Account</h2>
                <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
                  Sign up to unlock instant official book purchases & delivery tracking.
                </p>
              </>
            )}

            {authModalMode === 'otp' && (
              <>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1 sm:mb-2">Verify OTP</h2>
                <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
                  Enter the 4-digit code sent to your mobile or email.
                </p>
              </>
            )}
          </div>

          {/* Bottom Illustration / Trust Points (desktop) */}
          <div className="relative z-10 pt-4 sm:pt-6 border-t border-blue-400/30 text-xs text-blue-100 space-y-2 hidden md:block">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>100% Genuine Physical Book</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Instant Digital License Sync</span>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Forms */}
        <div className="w-full md:w-3/5 p-5 sm:p-8 flex flex-col justify-between bg-white overflow-y-auto flex-1">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <span className="font-semibold">Error:</span> {errorMessage}
            </div>
          )}

          {/* MODE: LOGIN */}
          {authModalMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Enter Email / Mobile Number
                </label>
                <div className="relative">
                  <input
                    id="login-identifier-input"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="+91 98765 43210 or name@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2874f0] focus:border-transparent transition-all"
                  />
                  <div className="absolute right-3 top-2.5 text-slate-400">
                    <Smartphone className="w-4 h-4" />
                  </div>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  By continuing, you agree to Modi Classes' Terms of Use and Privacy Policy.
                </p>
              </div>

              <button
                id="login-request-otp-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#fb641b] hover:bg-[#e85a14] text-white text-sm font-semibold rounded-lg shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Request OTP / Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
               
              </div>

             
              <div className="pt-2 text-center">
                <button
                  type="button"
                  id="switch-to-signup-btn"
                  onClick={() => {
                    setErrorMessage('');
                    setAuthModalMode('signup');
                  }}
                  className="text-xs font-semibold text-[#2874f0] hover:underline"
                >
                  New to Modi Classes? Create an account
                </button>
              </div>
            </form>
          )}

          {/* MODE: SIGNUP */}
          {authModalMode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  id="signup-name-input"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2874f0] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile Number
                </label>
                <input
                  id="signup-phone-input"
                  type="tel"
                  required
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2874f0] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  id="signup-email-input"
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="student@gmail.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2874f0] transition-all"
                />
              </div>

              <p className="text-[11px] text-slate-500">
                We will send an SMS with a confirmation code to verify your mobile number.
              </p>

              <button
                id="signup-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#fb641b] hover:bg-[#e85a14] text-white text-sm font-semibold rounded-lg shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>CONTINUE</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  id="switch-to-login-btn"
                  onClick={() => {
                    setErrorMessage('');
                    setAuthModalMode('login');
                  }}
                  className="w-full py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg transition-colors"
                >
                  Existing User? Log in
                </button>
              </div>
            </form>
          )}

          {/* MODE: OTP VERIFICATION */}
          {authModalMode === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <p className="text-xs text-slate-600 mb-3">
                  Please enter the OTP sent to <span className="font-semibold text-slate-900">{otpSentTo || 'your number'}</span>.{' '}
                  <button
                    type="button"
                    onClick={() => setAuthModalMode('login')}
                    className="text-[#2874f0] hover:underline font-medium text-xs ml-1"
                  >
                    Change
                  </button>
                </p>

                
               

                <div className="flex items-center justify-center gap-3">
                  {[0, 1, 2, 3].map((idx) => (
                    <input
                      key={idx}
                      id={`otp-input-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otpValue[idx]}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-12 h-12 text-center text-lg font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-[#2874f0] focus:ring-2 focus:ring-[#2874f0] focus:outline-none transition-all"
                    />
                  ))}
                </div>
              </div>

              <button
                id="verify-otp-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#fb641b] hover:bg-[#e85a14] text-white text-sm font-semibold rounded-lg shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Continue</span>
                  </>
                )}
              </button>

              <div className="text-center text-xs text-slate-500">
                Didn't receive the OTP?{' '}
                <button
                  type="button"
                  onClick={async () => {
                    setErrorMessage('');
                    setIsLoading(true);
                    try {
                      const response = await fetch(getApiUrl('/api/auth/send-otp'), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ identifier: otpSentTo })
                      });
                      const data = await response.json();
                      setIsLoading(false);
                      if (response.ok && data.success) {
                        setOtpValue(['', '', '', '']);
                      } else {
                        setErrorMessage(data.error || 'Failed to resend OTP.');
                      }
                    } catch (err) {
                      setIsLoading(false);
                      setErrorMessage('Network error. Failed to resend OTP.');
                    }
                  }}
                  className="font-semibold text-[#2874f0] hover:underline"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
