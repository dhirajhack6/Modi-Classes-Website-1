import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { ModiClassesLogo } from '../../common/ModiClassesLogo';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  BookOpen, 
  CreditCard, 
  Truck, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Bell
} from 'lucide-react';

interface AdminLayoutProps {
  currentSection: 'dashboard' | 'orders' | 'customers' | 'book' | 'payments' | 'delivery' | 'settings';
  onNavigate: (section: 'dashboard' | 'orders' | 'customers' | 'book' | 'payments' | 'delivery' | 'settings') => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentSection, onNavigate, children }) => {
  const { adminUser, logout } = useAdminAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders' as const, label: 'Orders', icon: ShoppingBag },
    { id: 'customers' as const, label: 'Customers', icon: Users },
    { id: 'book' as const, label: 'Book & Pricing', icon: BookOpen },
    { id: 'payments' as const, label: 'Payments', icon: CreditCard },
    { id: 'delivery' as const, label: 'Delivery', icon: Truck },
    { id: 'settings' as const, label: 'Settings', icon: Settings }
  ];

  const getSectionTitle = () => {
    switch (currentSection) {
      case 'dashboard': return 'Business Dashboard';
      case 'orders': return 'Orders Management';
      case 'customers': return 'Customer Management';
      case 'book': return 'Book & Price Management';
      case 'payments': return 'Payments & Transactions';
      case 'delivery': return 'Delivery & Tracking Management';
      case 'settings': return 'Admin & Store Settings';
      default: return 'Admin Portal';
    }
  };

  const handleNavClick = (section: any) => {
    onNavigate(section);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col md:flex-row selection:bg-amber-500 selection:text-slate-950">
      
      {/* Mobile Top App Bar */}
      <div className="md:hidden bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between z-30 sticky top-0">
        <div className="flex items-center gap-3">
          <ModiClassesLogo size={36} />
          <div>
            <span className="font-bold text-xs text-white tracking-wide block font-serif">
              MODI RAILWAY CLASSES
            </span>
            <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider block">
              ADMIN PANEL
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-xl border border-slate-800"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between z-40 transition-transform duration-200 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <ModiClassesLogo size={42} />
            <div>
              <h2 className="font-black text-xs sm:text-sm text-white tracking-tight leading-snug font-serif">
                MODI RAILWAY CLASSES
              </h2>
              <div className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] font-black uppercase tracking-wider">
                <ShieldCheck className="w-2.5 h-2.5" />
                <span>Admin Panel</span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-medium">
            Single-Product E-Commerce Engine
          </p>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                id={`admin-nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-200" />}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer: Admin profile & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 space-y-3">
          <div className="flex items-center gap-3 px-1">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
              {adminUser?.name?.charAt(0) || 'A'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{adminUser?.name || 'Administrator'}</p>
              <p className="text-[10px] text-slate-400 truncate">{adminUser?.email || 'admin@modiclasses.in'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[11px] font-bold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
              title="Open Public Customer Website in new tab"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Live Site</span>
            </a>

            <button
              onClick={logout}
              className="px-2.5 py-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/50 rounded-lg text-[11px] font-bold text-rose-300 hover:text-rose-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile drawer */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 md:hidden"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="bg-slate-950/70 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5 sticky top-0 z-20 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
              {getSectionTitle()}
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Modi Railway Psychotest Classes • Official Administration System
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>View Customer Store</span>
            </a>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                {adminUser?.name?.charAt(0) || 'A'}
              </div>
              <div className="hidden lg:block text-left">
                <span className="text-xs font-bold text-white block leading-none">{adminUser?.name}</span>
                <span className="text-[10px] text-blue-400 font-semibold block leading-tight">Master Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Inner Section Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
};
