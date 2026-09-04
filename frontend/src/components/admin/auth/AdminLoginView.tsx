import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { ShieldCheck, Lock, Mail, ArrowRight, ArrowLeft, AlertCircle, Sparkles } from 'lucide-react';
import { ModiClassesLogo } from '../../common/ModiClassesLogo';

export const AdminLoginView: React.FC = () => {
  const { login, isLoading, authError, isForbidden, clearError } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    await login(email.trim(), password);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex flex-col items-center">
          <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl mb-4">
            <ModiClassesLogo size={52} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-serif text-center">
            MODI RAILWAY CLASSES
          </h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800 text-blue-300 text-xs font-bold uppercase tracking-widest mt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Dedicated Admin Portal</span>
          </div>
          <p className="mt-2 text-xs text-slate-400 text-center max-w-xs">
            Restricted access for book publishing, order fulfillment, and single-product management.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-900/90 backdrop-blur-xl py-8 px-6 sm:px-10 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
          
          {authError && (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">{isForbidden ? 'Access Denied' : 'Authentication Error'}</p>
                <p className="text-[11px] text-rose-300 mt-0.5">{authError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <input
                  id="admin-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    clearError();
                    setEmail(e.target.value);
                  }}
                  placeholder="admin@modiclasses.in"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Master Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="relative">
                <input
                  id="admin-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    clearError();
                    setPassword(e.target.value);
                  }}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              id="admin-login-btn"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Admin Panel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800/80 text-center">
            <button
              type="button"
              onClick={() => {
                window.location.pathname = '/';
              }}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors font-medium cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Customer Website</span>
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-600 mt-6">
          Authorized personnel only. All access attempts are logged for security auditing.
        </p>
      </div>
    </div>
  );
};
