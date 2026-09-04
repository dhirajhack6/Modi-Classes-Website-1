import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ModiClassesLogo } from '../common/ModiClassesLogo';
import { 
  BookOpen, 
  ShoppingBag, 
  Package, 
  Gauge, 
  Zap,
  User as UserIcon, 
  ChevronDown, 
  Truck, 
  Building2, 
  LogOut, 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  GraduationCap
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    currentUser,
    isLoggedIn,
    logout,
    openLoginModal,
    openSignupModal,
    setIsProfileModalOpen,
    cart,
    setIsCartDrawerOpen,
    orders,
    setIsBulkModalOpen,
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md text-slate-900 border-b border-slate-200 shadow-xs">
      
      {/* Top Notification / Dispatch Notice Ticker */}
      <div className="bg-amber-500 text-slate-950 text-xs py-1.5 px-4 font-bold">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-slate-950 text-amber-300 font-extrabold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
              RRB ALP & TECH 2025-26
            </span>
            <span className="hidden sm:inline">
              Official RDSO CBAT Master Hardcopy Book: 524 Pages + 50 OMR Sheets Included.
            </span>
            <span className="sm:hidden text-[11px]">524 Pages Book + 50 OMRs</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button 
              onClick={() => setIsBulkModalOpen(true)}
              className="hover:underline flex items-center gap-1 cursor-pointer font-bold"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Coaching Bulk Supply</span>
            </button>
            <div className="hidden md:flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" />
              <span>48h Express Shipping across India</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Brand Identity & Website Name */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setActiveView('catalog');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-3 text-left group cursor-pointer focus:outline-hidden"
              id="brand-logo-btn"
            >
              <ModiClassesLogo size={46} className="group-hover:scale-105 transition-transform" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-base sm:text-lg text-slate-900 tracking-tight leading-none font-serif">
                    MODI RAILWAY PSYCHOTEST CLASSES
                  </span>
                </div>
                <p className="text-[11px] text-amber-700 font-bold tracking-wide mt-0.5 flex items-center gap-1">
                  <span>Official RRB ALP (CBAT) Master Book Portal</span>
                </p>
              </div>
            </button>
          </div>

          {/* Center Quick Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => {
                setActiveView('catalog');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'catalog' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span>3D Book</span>
            </button>

            <button
              onClick={() => {
                setActiveView('catalog');
                setTimeout(() => {
                  document.getElementById('five-batteries-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="px-3 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Gauge className="w-3.5 h-3.5 text-amber-600" />
              <span>5 RDSO Batteries</span>
            </button>

            <button
              onClick={() => {
                setActiveView('catalog');
                setTimeout(() => {
                  document.getElementById('interactive-test-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="px-3 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>30-Sec Mini Test</span>
            </button>
          </div>

          {/* Right Action Navigation Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Track Orders Button */}
            <button
              onClick={() => setActiveView('orders')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                activeView === 'orders'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                  : 'text-slate-700 bg-slate-100 hover:bg-slate-200 border-slate-200'
              }`}
              id="nav-orders-btn"
            >
              <Package className="w-3.5 h-3.5 text-amber-700" />
              <span>Track Order</span>
              {orders.length > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900">
                  {orders.length}
                </span>
              )}
            </button>

            {/* Shopping Cart Drawer Trigger */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative p-2 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all font-black cursor-pointer shadow-md flex items-center gap-1.5 px-3"
              id="cart-drawer-btn"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">Cart</span>
              {cartItemCount > 0 && (
                <span className="bg-slate-950 text-amber-300 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Flipkart-Style Login / Signup / User Profile Controls */}
            {!isLoggedIn || !currentUser ? (
              <div className="relative">
                <div className="flex items-center rounded-xl bg-[#2874f0] text-white shadow-xs hover:shadow-md transition-all">
                  <button
                    id="flipkart-login-btn"
                    onClick={openLoginModal}
                    className="px-3 sm:px-4 py-1.5 font-bold text-xs flex items-center gap-1.5 hover:bg-blue-600 rounded-l-xl transition-colors cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Login</span>
                  </button>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="p-1.5 border-l border-blue-400/40 hover:bg-blue-600 rounded-r-xl transition-colors cursor-pointer"
                    aria-label="More login options"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Dropdown for non-logged-in visitors */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-fade-in text-xs">
                    <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-slate-500 font-medium">New customer?</span>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          openSignupModal();
                        }}
                        className="text-[#2874f0] font-bold hover:underline"
                      >
                        Sign Up
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        openLoginModal();
                      }}
                      className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-blue-50 flex items-center gap-2"
                    >
                      <LogIn className="w-3.5 h-3.5 text-[#2874f0]" />
                      <span>Login with OTP</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setActiveView('orders');
                      }}
                      className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-blue-50 flex items-center gap-2"
                    >
                      <Package className="w-3.5 h-3.5 text-slate-500" />
                      <span>Orders & Licenses</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* User is Logged In */
              <div className="relative">
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-all cursor-pointer text-xs"
                >
                  <div className="w-6 h-6 rounded-full bg-[#2874f0] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold hidden sm:inline truncate max-w-[100px]">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Dropdown for Logged-in User */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 animate-fade-in text-xs">
                    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                      <p className="font-bold text-slate-900 text-sm leading-snug">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      {currentUser.studentRollNumber && (
                        <p className="text-[10px] font-mono text-amber-700 font-bold mt-0.5">
                          Roll: {currentUser.studentRollNumber}
                        </p>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsProfileModalOpen(true);
                        }}
                        className="w-full px-4 py-2 text-left text-slate-700 hover:bg-blue-50 hover:text-blue-900 flex items-center gap-2 font-medium"
                      >
                        <UserIcon className="w-4 h-4 text-[#2874f0]" />
                        <span>My Profile & Addresses</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setActiveView('orders');
                        }}
                        className="w-full px-4 py-2 text-left text-slate-700 hover:bg-blue-50 hover:text-blue-900 flex items-center gap-2 font-medium"
                      >
                        <Package className="w-4 h-4 text-amber-600" />
                        <span>My Orders & Licenses</span>
                      </button>

                      <div className="border-t border-slate-100 my-1" />

                      {/* Sign Out Button */}
                      <button
                        id="logout-btn"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 font-bold transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out / Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
