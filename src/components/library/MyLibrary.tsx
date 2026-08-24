import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Library as LibraryIcon, 
  FileText, 
  Download, 
  Eye, 
  ShieldCheck, 
  Search, 
  GraduationCap, 
  Lock, 
  CheckCircle2, 
  Calendar, 
  Key, 
  Smartphone, 
  BookOpen, 
  Clock, 
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Moon,
  Sun,
  X
} from 'lucide-react';
import { Book, DigitalLicense } from '../../types';

export const MyLibrary: React.FC = () => {
  const { 
    orders, 
    books, 
    currentUser, 
    downloadDigitalPdf, 
    setActiveView,
    addToast 
  } = useApp();

  const [searchFilter, setSearchFilter] = useState('');
  const [readingLicense, setReadingLicense] = useState<{ book: Book; license: DigitalLicense } | null>(null);
  
  // PDF Reading view controls
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Extract all digital licenses across orders
  const allDigitalLicenses: { book: Book; license: DigitalLicense; orderNumber: string; orderDate: string }[] = [];

  orders.forEach((ord) => {
    ord.digitalLicenses.forEach((lic) => {
      const b = books.find((x) => x.id === lic.bookId);
      if (b) {
        allDigitalLicenses.push({
          book: b,
          license: lic,
          orderNumber: ord.orderNumber,
          orderDate: ord.createdAt
        });
      }
    });
  });

  // Filter licenses by search query
  const filteredLicenses = allDigitalLicenses.filter((item) =>
    item.book.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    item.book.exam.toLowerCase().includes(searchFilter.toLowerCase()) ||
    item.book.author.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleDownload = (bookId: string, licenseKey: string) => {
    const res = downloadDigitalPdf(bookId, licenseKey);
    if (res.success) {
      // Simulate real browser PDF download trigger
      const blob = new Blob([
        `%PDF-1.4\n% Modi Classes Digital Study Material\n% ${res.watermark}\n% Licensed for offline academic use.`
      ], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ModiClasses_${bookId}_Secure.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <LibraryIcon className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-serif">
              My Digital Study Material Library
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Instant digital access with Dynamic Anti-Piracy Watermarking • Student ID: <strong>{currentUser?.studentRollNumber || 'MC-DEL-2025-0842'}</strong>
          </p>
        </div>

        {/* Search within library */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search your unlocked PDFs..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Security Notice Banner */}
      <div className="p-4 rounded-2xl bg-indigo-950 text-indigo-100 border border-indigo-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3 text-xs">
          <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="font-bold text-white">Dynamic Anti-Piracy Watermarking Active</h4>
            <p className="text-indigo-300">
              Every page is embedded with your student credentials ({currentUser.email} | Roll: {currentUser.studentRollNumber}). Sharing on public Telegram groups is tracked and subject to instant copyright deactivation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold bg-indigo-800 text-amber-300 px-3 py-1.5 rounded-lg border border-indigo-700">
            {allDigitalLicenses.length} Digital Materials Active
          </span>
        </div>
      </div>

      {/* Library Grid */}
      {filteredLicenses.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-base text-slate-900">No Digital Books Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You haven't unlocked any digital PDF materials yet. Browse our catalog to claim batch-free materials or purchase study guides.
          </p>
          <button
            onClick={() => setActiveView('catalog')}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer shadow-md"
          >
            Explore Books Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLicenses.map(({ book, license, orderNumber, orderDate }) => {
            const downloadsLeft = Math.max(0, license.maxDownloads - license.downloadCount);
            
            return (
              <div
                key={license.licenseKey}
                className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-lg transition-all p-5 flex flex-col justify-between space-y-4"
              >
                {/* Book Info Top */}
                <div className="flex items-start gap-3.5">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-16 h-22 object-cover rounded-lg shadow-sm shrink-0 border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 uppercase">
                      {book.exam}
                    </span>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug line-clamp-2 mt-1 font-serif">
                      {book.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">By {book.author}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{book.pages} Pages • {book.edition}</p>
                  </div>
                </div>

                {/* Digital License Key Pill */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="flex items-center gap-1 font-semibold">
                      <Key className="w-3 h-3 text-indigo-600" />
                      Security License:
                    </span>
                    <span className="font-mono font-bold text-slate-800 text-[10px]">{license.licenseKey}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Downloads:</span>
                    <span className={`font-bold ${downloadsLeft > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {license.downloadCount} / {license.maxDownloads} used ({downloadsLeft} remaining)
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {/* Read Online in Protected Reader */}
                  <button
                    onClick={() => {
                      setReadingLicense({ book, license });
                      setActivePageIndex(0);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Read PDF Online</span>
                  </button>

                  {/* Download Watermarked PDF */}
                  <button
                    onClick={() => handleDownload(book.id, license.licenseKey)}
                    disabled={downloadsLeft === 0}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      downloadsLeft > 0
                        ? 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{downloadsLeft > 0 ? 'Download PDF' : 'Limit Reached'}</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* FULL SCREEN PROTECTED DIGITAL PDF READER MODAL */}
      {readingLicense && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in">
          <div className={`w-full max-w-5xl h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border ${
            isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            
            {/* Reader Header */}
            <div className={`px-5 py-3.5 border-b flex items-center justify-between gap-4 ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-indigo-700 text-white flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 text-amber-300" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-xs sm:text-sm truncate font-serif">{readingLicense.book.title}</h3>
                  <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Full Verified Digital Edition • License: {readingLicense.license.licenseKey}</span>
                  </p>
                </div>
              </div>

              {/* Reader Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
                </button>

                <div className="hidden sm:flex items-center gap-1 bg-slate-200/70 dark:bg-slate-800 rounded-lg p-1 text-xs">
                  <button onClick={() => setZoom(Math.max(80, zoom - 10))} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-md">
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-1.5 font-medium">{zoom}%</span>
                  <button onClick={() => setZoom(Math.min(140, zoom + 10))} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-md">
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => setReadingLicense(null)}
                  className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Reader Stage with Dynamic Watermark */}
            <div className={`flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center ${
              isDarkMode ? 'bg-slate-900' : 'bg-slate-100'
            }`}>
              <div 
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                className={`w-full max-w-3xl min-h-[600px] p-8 sm:p-12 rounded-2xl shadow-xl transition-transform duration-200 relative overflow-hidden flex flex-col justify-between ${
                  isDarkMode ? 'bg-slate-950 border border-slate-800 text-slate-100' : 'bg-white border border-slate-200 text-slate-900'
                }`}
              >
                {/* DYNAMIC ANTI-PIRACY SECURITY WATERMARK ON PAGE */}
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-around items-center select-none overflow-hidden opacity-15">
                  <div className="transform -rotate-25 text-center font-black text-xs sm:text-sm text-rose-800 uppercase tracking-widest leading-loose">
                    {readingLicense.license.watermarkText}
                  </div>
                  <div className="transform -rotate-25 text-center font-black text-xs sm:text-sm text-indigo-900 uppercase tracking-widest leading-loose">
                    MODI CLASSES PROTECTED STUDY MATERIAL • UNIQUE ROLL: {currentUser.studentRollNumber || 'MC-DEL-0842'}
                  </div>
                </div>

                {/* Content Header */}
                <div className="border-b pb-4 mb-6 flex items-center justify-between text-xs text-slate-500 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-600 font-serif">MODI CLASSES PUBLICATIONS</span>
                    <span>•</span>
                    <span>{readingLicense.book.exam}</span>
                  </div>
                  <span>Page {activePageIndex + 1} of {readingLicense.book.samplePages.length} (Sample Viewer Simulation)</span>
                </div>

                {/* Page Body */}
                <div className="space-y-4 relative z-10 flex-1">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white font-serif border-l-4 border-indigo-600 pl-3">
                    {readingLicense.book.samplePages[activePageIndex]?.title || 'Chapter Section'}
                  </h2>

                  <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed font-sans">
                    {readingLicense.book.samplePages[activePageIndex]?.content}
                  </div>

                  {readingLicense.book.samplePages[activePageIndex]?.notes && (
                    <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                      <strong className="font-bold block mb-1">🎯 Faculty Exam Strategy:</strong>
                      {readingLicense.book.samplePages[activePageIndex]?.notes}
                    </div>
                  )}
                </div>

                {/* Footer with Anti-Piracy Stamp */}
                <div className="border-t pt-4 mt-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500 relative z-10">
                  <span>{readingLicense.book.title} ({readingLicense.book.edition})</span>
                  <span className="font-mono text-indigo-700 dark:text-indigo-400">
                    ID: {readingLicense.license.licenseKey} • {currentUser.email}
                  </span>
                </div>

              </div>
            </div>

            {/* Reader Bottom Navigation */}
            <div className={`px-5 py-3 border-t flex items-center justify-between ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="text-xs text-slate-500">
                Reading Mode: <strong>Secure Canvas View</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActivePageIndex(Math.max(0, activePageIndex - 1))}
                  disabled={activePageIndex === 0}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold disabled:opacity-40"
                >
                  Previous Page
                </button>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Page {activePageIndex + 1} / {readingLicense.book.samplePages.length}
                </span>
                <button
                  onClick={() => setActivePageIndex(Math.min(readingLicense.book.samplePages.length - 1, activePageIndex + 1))}
                  disabled={activePageIndex === readingLicense.book.samplePages.length - 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold disabled:opacity-40"
                >
                  Next Page
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
