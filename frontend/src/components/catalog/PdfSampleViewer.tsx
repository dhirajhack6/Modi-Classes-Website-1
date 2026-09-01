import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Moon, 
  Sun, 
  ShieldCheck, 
  ShoppingBag, 
  BookOpen, 
  Sparkles,
  Layers,
  Lock
} from 'lucide-react';

export const PdfSampleViewer: React.FC = () => {
  const { 
    selectedBookForSample, 
    setSelectedBookForSample, 
    addToCart, 
    setIsCartDrawerOpen 
  } = useApp();

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showToc, setShowToc] = useState(true);

  if (!selectedBookForSample) return null;

  const { book } = selectedBookForSample;
  const samplePages = book.samplePages || [];
  const activePage = samplePages[currentPageIndex] || samplePages[0];

  const handleNext = () => {
    if (currentPageIndex < samplePages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const handleUnlockFullBook = () => {
    addToCart(book, 'combo', 1);
    setSelectedBookForSample(null);
    setIsCartDrawerOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className={`w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border ${
        isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Top Viewer Toolbar */}
        <div className={`px-4 py-3 border-b flex items-center justify-between gap-3 ${
          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          {/* Left: Book Title & Badge */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-700 text-white flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xs sm:text-sm truncate font-serif">{book.title}</h3>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full shrink-0">
                  Sample Preview
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">By {book.author} • {book.edition}</p>
            </div>
          </div>

          {/* Right: Controls & Close */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Dark / Light Reader Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Toggle reading contrast"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-200/70 dark:bg-slate-800 rounded-lg p-1 text-xs">
              <button
                onClick={() => setZoomLevel(Math.max(80, zoomLevel - 10))}
                className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-md cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 font-medium">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel(Math.min(140, zoomLevel + 10))}
                className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-md cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Unlock Button in Header */}
            <button
              onClick={handleUnlockFullBook}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Unlock Full Book (₹{book.discountPricePdf})</span>
              <span className="sm:hidden">Buy Book</span>
            </button>

            {/* Close Button */}
            <button
              onClick={() => setSelectedBookForSample(null)}
              className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Reader Body Area */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Side Drawer: Table of Contents */}
          <div className={`w-64 border-r hidden md:flex flex-col shrink-0 ${
            isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50/80 border-slate-200'
          }`}>
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                Table of Contents
              </span>
              <span className="text-[10px] text-slate-600 font-normal">{book.tableOfContents.length} Chapters</span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs">
              {book.tableOfContents.map((toc, idx) => (
                <div
                  key={toc.chapter}
                  className={`p-2.5 rounded-xl transition-all ${
                    toc.isSampleAvailable
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60'
                      : 'opacity-60 bg-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-bold text-indigo-700 dark:text-indigo-400 text-[11px]">
                      Ch {toc.chapter}.
                    </span>
                    {toc.isSampleAvailable ? (
                      <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 px-1.5 py-0.2 rounded-sm uppercase">
                        Sample
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-600 flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" />
                        Locked
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 leading-snug">
                    {toc.title}
                  </p>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1">{toc.pageRange}</p>
                </div>
              ))}
            </div>

            {/* Bottom sample note */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-amber-500/10 text-[11px] text-amber-900 dark:text-amber-300">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                Anti-Piracy Protected
              </div>
              Full edition has all {book.pages} pages with high-definition diagrams and complete solved PYQs.
            </div>
          </div>

          {/* Document Stage */}
          <div className={`flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center ${
            isDarkMode ? 'bg-slate-900' : 'bg-slate-100'
          }`}>
            <div 
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              className={`w-full max-w-2xl min-h-[560px] p-6 sm:p-10 rounded-xl shadow-xl transition-transform duration-200 relative overflow-hidden flex flex-col justify-between ${
                isDarkMode ? 'bg-slate-950 border border-slate-800 text-slate-100' : 'bg-white border border-slate-200 text-slate-900'
              }`}
            >
              {/* Dynamic Diagonal Anti-Piracy Watermark Stamp */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center select-none overflow-hidden opacity-10">
                <div className="transform -rotate-30 text-center font-black text-2xl sm:text-3xl text-slate-500 uppercase tracking-widest leading-loose">
                  MODI CLASSES DEMO PREVIEW<br />
                  COPYRIGHT 2025-26 • NOT FOR REDISTRIBUTION<br />
                  EXAM PREPARATION WING
                </div>
              </div>

              {/* Document Header */}
              <div className="border-b pb-4 mb-6 flex items-center justify-between text-xs text-slate-500 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 font-serif">MODI CLASSES</span>
                  <span>•</span>
                  <span>{book.exam}</span>
                </div>
                <span>Sample Page {currentPageIndex + 1} of {samplePages.length}</span>
              </div>

              {/* Document Page Content */}
              <div className="space-y-4 relative z-10 flex-1">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-serif border-l-4 border-indigo-600 pl-3">
                  {activePage?.title || 'Sample Chapter Preview'}
                </h2>

                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed font-sans">
                  {activePage?.content}
                </div>

                {activePage?.notes && (
                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-200">
                    <strong className="font-bold block mb-1">🎯 Faculty Exam Strategy Tip:</strong>
                    {activePage.notes}
                  </div>
                )}
              </div>

              {/* Bottom Document Page Footer */}
              <div className="border-t pt-4 mt-8 flex items-center justify-between text-[11px] text-slate-500 relative z-10">
                <span>{book.title} (8th Edition)</span>
                <span>Page {activePage?.pageNumber || 1}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation & Unlock Bar */}
        <div className={`px-4 py-3 border-t flex flex-wrap items-center justify-between gap-3 ${
          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          {/* Page Stepper */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentPageIndex === 0}
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Sample {currentPageIndex + 1} / {samplePages.length}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPageIndex === samplePages.length - 1}
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Full Access CTA */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Complete {book.pages} Pages Available
              </span>
              <span className="text-[11px] text-slate-500 block">
                Instant PDF Download + Hardcopy Delivery
              </span>
            </div>

            <button
              onClick={handleUnlockFullBook}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Get Full Book — ₹{book.discountPricePdf}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
