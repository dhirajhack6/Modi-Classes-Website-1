import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CatalogView } from './components/catalog/CatalogView';
import { MyLibrary } from './components/library/MyLibrary';
import { OrdersView } from './components/orders/OrdersView';
import { BookDetailModal } from './components/catalog/BookDetailModal';
import { PdfSampleViewer } from './components/catalog/PdfSampleViewer';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { InvoiceModal } from './components/orders/InvoiceModal';
import { OrderTrackingModal } from './components/orders/OrderTrackingModal';
import { AuthModal } from './components/auth/AuthModal';
import { UserProfileModal } from './components/auth/UserProfileModal';
import { AdminApp } from './components/admin/AdminApp';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-60 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-start justify-between gap-3 text-xs animate-fade-in ${
            t.type === 'success'
              ? 'bg-slate-900 text-white border-slate-800'
              : t.type === 'error'
              ? 'bg-rose-950 text-white border-rose-800'
              : 'bg-indigo-950 text-white border-indigo-800'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
            {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
            {t.type === 'info' && <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
            <div>
              <h4 className="font-bold">{t.title}</h4>
              <p className="text-slate-300 text-[11px] mt-0.5 leading-snug">{t.message}</p>
            </div>
          </div>
          <button
            onClick={() => removeToast(t.id)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

const MainAppContent: React.FC = () => {
  const { activeView } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-900 font-sans selection:bg-indigo-600 selection:text-white">
      {/* Navigation Header - Customer Only */}
      <Navbar />

      {/* Main Page Area */}
      <main className="flex-1">
        {activeView === 'catalog' && <CatalogView />}
        {activeView === 'my_library' && <MyLibrary />}
        {activeView === 'orders' && <OrdersView />}
      </main>

      {/* Footer - Customer Only */}
      <Footer />

      {/* Interactive Global Modals & Drawers */}
      <BookDetailModal />
      <PdfSampleViewer />
      <CartDrawer />
      <CheckoutModal />
      <InvoiceModal />
      <OrderTrackingModal />
      <AuthModal />
      <UserProfileModal />
      <ToastContainer />
    </div>
  );
};

const checkIsAdminPath = () => {
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  return (
    path.startsWith('/admin') ||
    hash.startsWith('#admin') ||
    hash.startsWith('#/admin')
  );
};

export default function App() {
  const [isAdminPath, setIsAdminPath] = useState(checkIsAdminPath);

  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdminPath(checkIsAdminPath());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  if (isAdminPath) {
    return <AdminApp />;
  }

  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
