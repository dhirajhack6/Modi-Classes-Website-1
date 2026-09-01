import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Truck, 
  BookOpen, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  KeyRound, 
  Award,
  Layers,
  Sparkles,
  TrainTrack
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AlpFeatureHighlights: React.FC = () => {
  const { 
    deliveryPincode, 
    checkPincodeDelivery, 
    books 
  } = useApp();

  const singleBook = books[0];
  const [pincodeInput, setPincodeInput] = useState(deliveryPincode || '110009');
  const [pincodeResult, setPincodeResult] = useState<any>(null);

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincodeInput.trim()) return;
    const res = checkPincodeDelivery(pincodeInput.trim());
    setPincodeResult(res);
  };

  return (
    <section className="py-8 space-y-8">
      
      {/* 3 Pillar Inclusions Grid */}
      <div className="space-y-4">
        <div className="text-center max-w-2xl mx-auto space-y-1.5">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            PACKAGE INCLUSIONS
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-slate-900 tracking-tight">
            Complete Physical Practice Kit
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Everything needed to score T-Score ≥ 42 and secure your Assistant Loco Pilot seat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Inclusion 1: 524 Pages Hardcopy */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">524 Pages Master Guide</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Printed on high-opacity eye-friendly paper with clear diagrams, 3D brick models, and complete Hindi + English explanations.
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>All 5 RDSO Psycho Batteries</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Modi Classes Shortcut Formulas</span>
              </li>
            </ul>
          </div>

          {/* Inclusion 2: 50 OMR Practice Sets */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">50 Physical OMR Bubble Sheets</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Develop real exam speed and timing muscle memory by filling physical bubble sheets under strict RDSO clock constraints.
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>50 Full-Length Timed Mocks</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Detailed step-by-step solutions</span>
              </li>
            </ul>
          </div>

          {/* Inclusion 3: Online Simulator Scratch Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Online Exam Simulator Access</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Scratch code attached inside each book to unlock the Computer Based Aptitude Test (CBAT) exact TCS/RDSO exam interface.
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Live T-Score & Speed Analytics</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Authentic CBAT Timer Constraints</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Pincode Courier Delivery Checker */}
      <div className="rounded-2xl bg-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-lg flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-2 text-xs font-bold text-amber-400">
            <Truck className="w-4 h-4" />
            <span>EXPRESS COURIER SERVICEABILITY</span>
          </div>
          <h3 className="text-lg font-bold text-white">Check Delivery Estimate to Your Pincode</h3>
          <p className="text-xs text-slate-400">Shipped within 48 hours via Delhivery / Bluedart Express with live SMS tracking.</p>
        </div>

        <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-2">
          <form onSubmit={handleCheckPincode} className="flex flex-col sm:flex-row items-center gap-2 w-full">
            <div className="relative w-full sm:w-60">
              <input
                type="text"
                maxLength={6}
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit Pincode"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-400"
              />
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-sm transition-all"
            >
              Check Pincode
            </button>
          </form>

          {pincodeResult && (
            <div className="text-xs text-left animate-fade-in bg-slate-950 p-2.5 rounded-xl border border-slate-700">
              {pincodeResult.serviceable ? (
                <div>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Serviceable ({pincodeResult.city}, {pincodeResult.state})
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Estimated: <strong>{pincodeResult.estimatedDays} Days</strong> via {pincodeResult.courier}
                  </span>
                </div>
              ) : (
                <span className="text-rose-400 font-bold">Pincode not serviceable by standard courier.</span>
              )}
            </div>
          )}
        </div>
      </div>

    </section>
  );
};
