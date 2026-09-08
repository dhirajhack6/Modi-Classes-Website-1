import React from 'react';
import { useApp } from '../../context/AppContext';
import { ModiClassesLogo } from '../common/ModiClassesLogo';
import { 
  TrainTrack, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  MapPin, 
  Phone, 
  Mail, 
  BookOpen,
  Building2,
  FileCheck2
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveView, setIsBulkModalOpen } = useApp();

  return (
    <footer className="bg-slate-100 text-slate-700 pt-10 pb-8 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Value Proposition Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-8 border-b border-slate-200 text-xs">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0 border border-amber-300">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-0.5">524 Pages Hardcopy</h4>
              <p className="text-slate-500 text-[11px]">Includes 50 Physical OMR Bubble Sheets.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-slate-200/80 text-amber-800 shrink-0 border border-slate-300">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-0.5">48-Hour Dispatch</h4>
              <p className="text-slate-500 text-[11px]">Free delivery via Delhivery Express across India.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0 border border-emerald-300">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-0.5">Instant UPI & COD</h4>
              <p className="text-slate-500 text-[11px]">Safe payment with instant order confirmation.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-800 shrink-0 border border-indigo-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-0.5">RDSO Lucknow Compliant</h4>
              <p className="text-slate-500 text-[11px]">100% strictly matched with latest 2025-26 pattern.</p>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-8 text-xs">
          
          {/* Brand & About */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <ModiClassesLogo size={44} />
              <div>
                <span className="text-base font-black text-slate-900 font-serif leading-none block">
                  MODI RAILWAY PSYCHOTEST CLASSES
                </span>
                <span className="text-[11px] text-amber-700 font-semibold mt-0.5 block">
                  In Partnership with Vidyasagar Publication
                </span>
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed max-w-md text-xs">
              Specialized coaching & publication center for Indian Railways recruitment exams (RRB Assistant Loco Pilot, Technician, and Station Master CBAT). Prepared with authentic RDSO test patterns and 50 OMR practice sheets.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
            <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Quick Navigation</h5>
            <ul className="space-y-1.5 text-slate-600">
              <li>
                <button 
                  onClick={() => {
                    setActiveView('catalog');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                  className="hover:text-amber-800 transition-colors cursor-pointer"
                >
                  3D Book Showcase
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setActiveView('catalog');
                    setTimeout(() => {
                      document.getElementById('five-batteries-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }} 
                  className="hover:text-amber-800 transition-colors cursor-pointer"
                >
                  5 RDSO Batteries Breakdown
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setActiveView('catalog');
                    setTimeout(() => {
                      document.getElementById('interactive-test-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }} 
                  className="hover:text-amber-800 transition-colors cursor-pointer"
                >
                  30-Second Mini Test Simulator
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('orders')} className="hover:text-amber-800 transition-colors cursor-pointer">
                  Track Parcel Delivery
                </button>
              </li>
              <li>
                <button onClick={() => setIsBulkModalOpen(true)} className="hover:text-amber-800 transition-colors cursor-pointer">
                  Coaching Bulk Supply
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-2.5">
            <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Study Center & Dispatch</h5>
            <div className="space-y-2 text-slate-600 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>Modi Classes Academic Tower, Commercial Complex, Mukherjee Nagar, Delhi 110009</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-700 shrink-0" />
                <span>+91 98100 88221 / 011-4982100</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-700 shrink-0" />
                <span>railway@modiclasses.in</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Modi Railway Psychotest Classes. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px] font-medium">
            <span>100% RDSO Lucknow CBAT Syllabus Compliant</span>
            <span className="text-slate-300">•</span>
            <a 
              href="/admin" 
              className="text-slate-400 hover:text-indigo-600 transition-colors font-medium"
              title="Open Admin Dashboard"
            >
              Admin Portal
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
