import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Filter, 
  RotateCcw, 
  Layers, 
  FileText, 
  Book, 
  Sparkles, 
  Check, 
  GraduationCap,
  SlidersHorizontal
} from 'lucide-react';
import { ExamCategory, SubjectCategory, BookFormat } from '../../types';

const EXAMS: ExamCategory[] = [
  'All Exams',
  'UPSC Civil Services',
  'SSC CGL & CHSL',
  'NEET UG (Medical)',
  'JEE Main & Advanced',
  'State PSC (BPSC/UPPSC/MPPSC)',
  'Banking & Insurance',
  'Foundation (Class 9-12)'
];

const SUBJECTS: SubjectCategory[] = [
  'All Subjects',
  'Polity & Constitution',
  'History & Art-Culture',
  'Economy & Budget',
  'Geography & Environment',
  'Physics',
  'Chemistry',
  'Biology',
  'Quantitative Aptitude',
  'Reasoning & Mental Ability',
  'General Studies & GK'
];

export const BookFilters: React.FC = () => {
  const {
    selectedExam,
    setSelectedExam,
    selectedSubject,
    setSelectedSubject,
    selectedFormat,
    setSelectedFormat,
    selectedLanguage,
    setSelectedLanguage,
    inStockOnly,
    setInStockOnly,
    batchOnlyFilter,
    setBatchOnlyFilter,
    sortBy,
    setSortBy,
    resetFilters,
    currentUser
  } = useApp();

  const isAnyFilterActive = 
    selectedExam !== 'All Exams' || 
    selectedSubject !== 'All Subjects' || 
    selectedFormat !== 'all' || 
    selectedLanguage !== 'all' || 
    inStockOnly || 
    batchOnlyFilter;

  return (
    <aside className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
          <h3 className="font-bold text-sm text-slate-900">Filters & Sorting</h3>
        </div>
        {isAnyFilterActive && (
          <button
            onClick={resetFilters}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* Enrolled Coaching Batch Quick Filter Banner */}
      {currentUser && (
        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80">
          <div className="flex items-start gap-2">
            <GraduationCap className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-950">Batch Free Access</p>
              <p className="text-[11px] text-amber-800 leading-snug mb-2">
                Enrolled in <strong>{currentUser.enrolledBatches?.join(', ') || ''}</strong>? You get 100% free digital PDFs!
              </p>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-amber-900">
                <input
                  type="checkbox"
                  checked={batchOnlyFilter}
                  onChange={(e) => setBatchOnlyFilter(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <span>Show my batch study materials only</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Sort By Dropdown */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Sort Catalog By
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all cursor-pointer"
        >
          <option value="popularity">Most Popular / Bestsellers</option>
          <option value="rating">Highest Rated (Student Reviews)</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="newest">New Arrivals (2025 Edition)</option>
        </select>
      </div>

      {/* Format Filter (PDF vs Hardcopy vs Combo) */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Format
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => setSelectedFormat('all')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
              selectedFormat === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            All Formats
          </button>
          <button
            onClick={() => setSelectedFormat('pdf')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
              selectedFormat === 'pdf'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <FileText className="w-3 h-3" />
            <span>PDF (Digital)</span>
          </button>
          <button
            onClick={() => setSelectedFormat('hardcopy')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
              selectedFormat === 'hardcopy'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Book className="w-3 h-3" />
            <span>Hardcopy</span>
          </button>
          <button
            onClick={() => setSelectedFormat('combo')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
              selectedFormat === 'combo'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Combo</span>
          </button>
        </div>
      </div>

      {/* Target Exam Category */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Target Exam
        </label>
        <div className="space-y-1">
          {EXAMS.map((exam) => (
            <button
              key={exam}
              onClick={() => setSelectedExam(exam)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                selectedExam === exam
                  ? 'bg-indigo-50 text-indigo-800 font-bold border border-indigo-200'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="truncate">{exam}</span>
              {selectedExam === exam && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Subject Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Subject Category
        </label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value as any)}
          className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all cursor-pointer"
        >
          {SUBJECTS.map((sub) => (
            <option key={sub} value={sub}>{sub}</option>
          ))}
        </select>
      </div>

      {/* Medium / Language */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Medium / Language
        </label>
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: 'All', value: 'all' },
            { label: 'English', value: 'English' },
            { label: 'Hindi', value: 'Hindi' },
            { label: 'Bilingual', value: 'Bilingual (Hindi + English)' }
          ].map((lang) => (
            <button
              key={lang.value}
              onClick={() => setSelectedLanguage(lang.value)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedLanguage === lang.value
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Checkboxes */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 hover:text-slate-900">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <span>In-Stock Hardcopy Only</span>
        </label>
      </div>

    </aside>
  );
};
