import React from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { AdminLoginView } from './AdminLoginView';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

export const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdminLoggedIn, isLoading, isForbidden } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center animate-pulse">
            <Lock className="w-6 h-6 text-blue-400" />
          </div>
          <div className="text-center">
            <h3 className="text-sm font-bold text-white tracking-wide">Authenticating Admin Session</h3>
            <p className="text-xs text-slate-500 mt-1">Verifying administrative security credentials...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isForbidden) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-100">
        <div className="max-w-md w-full bg-slate-900 border border-rose-900/50 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">403 Forbidden: Access Denied</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your authenticated account is a customer account. The Modi Railway Classes Admin Panel is strictly reserved for authorized coaching staff and administrators.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                window.location.pathname = '/';
              }}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 transition-colors cursor-pointer border border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Customer Store</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdminLoggedIn) {
    return <AdminLoginView />;
  }

  return <>{children}</>;
};
