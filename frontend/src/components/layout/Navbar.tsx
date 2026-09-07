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
  GraduationCap,
  Menu,
  X,
  Phone
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
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md text-slate-900 border-b border-slate-200 shadow-xs">
      
      {/* Top Notification / Dispatch Notice Ticker */}
      <div className="bg-amber-500 text-slate-950 text-xs py-1.5 px-3 sm:px-4 font-bold">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="bg-slate-950 text-amber-300 font-extrabold px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] uppercase tracking-wider shrink-0">
              RRB ALP & TECH
            </span>
            <span className="hidden sm:inline text-xs truncate">
              Official RDSO CBAT Master Hardcopy Book: 524 Pages + 50 OMR Sheets Included.
            </span>
            <span className="sm:hidden text-[10.5px] truncate">524 Pgs Book + 50 OMRs</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] shrink-0">
            <button 
              onClick={() => setIsBulkModalOpen(true)}
              className="hover:underline flex items-center gap-1 cursor-pointer font-bold"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Coaching </span>Bulk
            </button>
            <div className="hidden md:flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" />
              <span>48h Express Shipping across India</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand Identity & Website Name */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button 
              onClick={() => {
                setActiveView('catalog');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 sm:gap-3 text-left group cursor-pointer focus:outline-hidden min-w-0"
              id="brand-logo-btn"
            >
              <div className="shrink-0">
                <div className="sm:hidden">
                  <ModiClassesLogo size={36} className="group-hover:scale-105 transition-transform" />
                </div>
                <div className="hidden sm:block">
                  <ModiClassesLogo size={44} className="group-hover:scale-105 transition-transform" />
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="font-black text-xs xs:text-sm sm:text-base md:text-lg text-slate-900 tracking-tight leading-tight font-serif truncate">
                    MODI RAILWAY CLASSES
                  </span>
                </div>
                <p className="text-[9.5px] sm:text-[11px] text-amber-700 font-bold tracking-wide mt-0.5 flex items-center gap-1 truncate">
                  <span>Official RRB ALP (CBAT) Master Book</span>
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
            
            {/* Track Orders Button (Visible on sm+ screens) */}
            <button
              onClick={() => setActiveView('orders')}
              className={`hidden sm:flex px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer items-center gap-1.5 border ${
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
              className="relative p-1.5 sm:p-2 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all font-black cursor-pointer shadow-xs flex items-center gap-1.5 px-2.5 sm:px-3"
              id="cart-drawer-btn"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs hidden md:inline">Cart</span>
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
                    className="px-2.5 sm:px-4 py-1.5 font-bold text-xs flex items-center gap-1.5 hover:bg-blue-600 rounded-l-xl transition-colors cursor-pointer"
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
                  className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-all cursor-pointer text-xs"
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

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              aria-label="Open mobile navigation"
              id="mobile-nav-toggle-btn"
            >
              <Menu className="w-5 h-5" />
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Slide-Over Navigation Drawer */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-fade-in">
          {/* Backdrop */}
          <div 
            onClick={() => setIsMobileNavOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Drawer content */}
          <div className="absolute top-0 right-0 bottom-0 w-4/5 max-w-xs bg-white shadow-2xl flex flex-col justify-between z-10 border-l border-slate-200">
            <div>
              {/* Drawer Top Bar */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <ModiClassesLogo size={32} />
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 font-serif">Modi Railway Classes</h3>
                    <p className="text-[10px] text-amber-700 font-bold">RRB ALP CBAT Portal</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileNavOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="p-3 space-y-1 text-xs">
                <button
                  onClick={() => {
                    setIsMobileNavOpen(false);
                    setActiveView('catalog');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-full p-3 rounded-xl font-bold flex items-center gap-3 transition-colors text-left ${
                    activeView === 'catalog' ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="block font-bold">3D Master Book</span>
                    <span className="text-[10px] text-slate-500 font-normal">524 Pages + 50 OMR Sheets</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsMobileNavOpen(false);
                    setActiveView('catalog');
                    setTimeout(() => {
                      document.getElementById('five-batteries-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="w-full p-3 rounded-xl font-bold flex items-center gap-3 transition-colors text-left text-slate-700 hover:bg-slate-100"
                >
                  <Gauge className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="block font-bold">5 RDSO Batteries</span>
                    <span className="text-[10px] text-slate-500 font-normal">Formulas & Cutoff Rules</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsMobileNavOpen(false);
                    setActiveView('catalog');
                    setTimeout(() => {
                      document.getElementById('interactive-test-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="w-full p-3 rounded-xl font-bold flex items-center gap-3 transition-colors text-left text-slate-700 hover:bg-slate-100"
                >
                  <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <span className="block font-bold">30-Sec Mini Simulator</span>
                    <span className="text-[10px] text-slate-500 font-normal">Interactive Depth & Memory Test</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsMobileNavOpen(false);
                    setActiveView('orders');
                  }}
                  className={`w-full p-3 rounded-xl font-bold flex items-center gap-3 transition-colors text-left ${
                    activeView === 'orders' ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Package className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <span className="block font-bold">Track My Orders</span>
                      <span className="text-[10px] text-slate-500 font-normal">Courier AWB & Invoices</span>
                    </div>
                    {orders.length > 0 && (
                      <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                        {orders.length}
                      </span>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsMobileNavOpen(false);
                    setIsBulkModalOpen(true);
                  }}
                  className="w-full p-3 rounded-xl font-bold flex items-center gap-3 transition-colors text-left text-slate-700 hover:bg-slate-100"
                >
                  <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="block font-bold">Coaching Bulk Supply</span>
                    <span className="text-[10px] text-slate-500 font-normal">Institutes & Bulk Discounts</span>
                  </div>
                </button>
              </nav>
            </div>

            {/* Drawer Bottom user actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
              {isLoggedIn && currentUser ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#2874f0] text-white flex items-center justify-center font-bold text-xs">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-xs text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => {
                        setIsMobileNavOpen(false);
                        setIsProfileModalOpen(true);
                      }}
                      className="flex-1 py-2 px-3 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        setIsMobileNavOpen(false);
                        logout();
                      }}
                      className="py-2 px-3 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold hover:bg-rose-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setIsMobileNavOpen(false);
                      openLoginModal();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#2874f0] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login with OTP</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileNavOpen(false);
                      openSignupModal();
                    }}
                    className="w-full py-2 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100"
                  >
                    New Student? Sign Up
                  </button>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 flex items-center gap-2 text-[10px] text-slate-500">
                <Phone className="w-3.5 h-3.5 text-amber-700" />
                <span>Helpline: +91 98100 88221</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
