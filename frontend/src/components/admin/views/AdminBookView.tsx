import React, { useState, useEffect } from 'react';
import { Book } from '../../../types';
import { PriceHistoryRecord } from '../adminTypes';
import { getApiUrl } from '../../../services/api';
import { 
  BookOpen, 
  IndianRupee, 
  Save, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Layers, 
  Tag, 
  PackageCheck,
  History,
  RefreshCw,
  Edit3
} from 'lucide-react';

export const AdminBookView: React.FC = () => {
  const [book, setBook] = useState<Book | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceHardcopy, setPriceHardcopy] = useState(899); // MRP
  const [discountPriceHardcopy, setDiscountPriceHardcopy] = useState(499); // Selling Price
  const [stockQuantity, setStockQuantity] = useState(120);
  const [lowStockThreshold, setLowStockThreshold] = useState(20);
  const [isbn, setIsbn] = useState('978-93-8921-990-1');
  const [edition, setEdition] = useState('2026 RDSO Revised Edition');
  const [isActive, setIsActive] = useState(true);

  // Confirmation Modal
  const [showPriceConfirmModal, setShowPriceConfirmModal] = useState(false);

  const fetchBookAndHistory = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('modi_admin_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const [bookRes, histRes] = await Promise.all([
        fetch(getApiUrl('/api/admin/book'), { headers, credentials: 'include' }),
        fetch(getApiUrl('/api/admin/book/price-history'), { headers, credentials: 'include' })
      ]);

      if (bookRes.ok) {
        const b = await bookRes.json();
        setBook(b);
        setTitle(b.title || '');
        setDescription(b.description || '');
        setPriceHardcopy(Number(b.priceHardcopy) || 899);
        setDiscountPriceHardcopy(Number(b.discountPriceHardcopy) || 499);
        setStockQuantity(Number(b.stockQuantity) || 0);
        setLowStockThreshold(Number(b.lowStockThreshold) || 10);
        setIsbn(b.isbn || '978-93-8921-990-1');
        setEdition(b.edition || '2026 RDSO Revised Edition');
        setIsActive(Boolean(b.isActive));
      }

      if (histRes.ok) {
        const h = await histRes.json();
        setPriceHistory(h);
      }
    } catch (err) {
      console.error('Error fetching book details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookAndHistory();
  }, []);

  // Compute discount percentage dynamically
  const discountPercent = priceHardcopy > 0 && discountPriceHardcopy <= priceHardcopy
    ? Math.round(((priceHardcopy - discountPriceHardcopy) / priceHardcopy) * 100)
    : 0;

  const handleInitiateSave = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validate inputs
    if (isNaN(priceHardcopy) || priceHardcopy <= 0) {
      setValidationError('MRP must be a valid positive number.');
      return;
    }
    if (isNaN(discountPriceHardcopy) || discountPriceHardcopy <= 0) {
      setValidationError('Selling price must be a valid positive number.');
      return;
    }
    if (discountPriceHardcopy > priceHardcopy) {
      setValidationError(`Selling price (₹${discountPriceHardcopy}) cannot exceed MRP (₹${priceHardcopy}).`);
      return;
    }

    // If price changed, trigger explicit confirmation modal
    if (book && (book.discountPriceHardcopy !== discountPriceHardcopy || book.priceHardcopy !== priceHardcopy)) {
      setShowPriceConfirmModal(true);
      return;
    }

    // Otherwise save immediately
    executeSave();
  };

  const executeSave = async () => {
    setIsSaving(true);
    setValidationError(null);
    setShowPriceConfirmModal(false);

    const token = localStorage.getItem('modi_admin_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(getApiUrl('/api/admin/book'), {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          priceHardcopy,
          discountPriceHardcopy,
          stockQuantity,
          lowStockThreshold,
          isbn: isbn.trim(),
          edition: edition.trim(),
          isActive
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setBook(updated);
        setSuccessMessage('Book price & details updated successfully.');
        // Refresh audit history
        const histRes = await fetch(getApiUrl('/api/admin/book/price-history'), { headers, credentials: 'include' });
        if (histRes.ok) {
          setPriceHistory(await histRes.json());
        }
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        const errJson = await res.json();
        setValidationError(errJson.error || 'Failed to update book.');
      }
    } catch (err: any) {
      setValidationError(err.message || 'Network error updating book.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !book) {
    return (
      <div className="p-12 text-center text-slate-500 text-xs">
        <span className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
        <p>Loading single book management console...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-slate-100 max-w-5xl mx-auto">
      
      {/* Alert Notices */}
      {successMessage && (
        <div className="p-4 bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {validationError && (
        <div className="p-4 bg-rose-950/70 border border-rose-800 text-rose-300 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleInitiateSave} className="space-y-6">
        
        {/* Book Overview Banner Card */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col md:flex-row items-center gap-6 shadow-xl">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-28 h-40 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-lg shrink-0 flex items-center justify-center relative">
              <img
                src={book.coverImage || '/assets/book.jpg'}
                alt="Front Cover"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/book.jpg';
                }}
              />
              <span className="absolute bottom-2 left-2 right-2 text-center bg-slate-950/85 text-[9px] font-mono text-amber-300 py-0.5 rounded backdrop-blur-xs font-bold">
                Front Cover
              </span>
            </div>

            <div className="w-28 h-40 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-lg shrink-0 flex items-center justify-center relative">
              <img
                src={book.backCoverImage || '/assets/book-back.jpg'}
                alt="Back Cover"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/book-back.png';
                }}
              />
              <span className="absolute bottom-2 left-2 right-2 text-center bg-slate-950/85 text-[9px] font-mono text-emerald-300 py-0.5 rounded backdrop-blur-xs font-bold">
                Back Cover
              </span>
            </div>
          </div>

          <div className="flex-1 space-y-2 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider">
                Official Single Book
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {isActive ? '● Published & Active' : '○ Inactive / Hidden'}
              </span>
            </div>
            <h2 className="text-lg font-black text-white font-serif">
              {book.title}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
              By {book.author}. Official RDSO Assistant Loco Pilot & Technician CBAT syllabus with 50 OMR bubble sheets.
            </p>
          </div>
        </div>

        {/* Pricing Management Card */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-emerald-400" />
                <span>Price & Discount Management</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Modifying the selling price here instantly reflects on the customer storefront.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Calculated Discount:</span>
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs rounded-full">
                {discountPercent}% OFF
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* MRP Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Maximum Retail Price (MRP)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono text-sm">₹</span>
                <input
                  id="admin-book-mrp-input"
                  type="number"
                  min="1"
                  required
                  value={priceHardcopy}
                  onChange={(e) => setPriceHardcopy(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-[11px] text-slate-500">Printed strike-through price shown to buyers.</p>
            </div>

            {/* Selling Price Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Selling / Offer Price</span>
                <span className="text-amber-400 text-[10px]">Authoritative</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-emerald-400 font-mono text-sm font-bold">₹</span>
                <input
                  id="admin-book-selling-input"
                  type="number"
                  min="1"
                  required
                  value={discountPriceHardcopy}
                  onChange={(e) => setDiscountPriceHardcopy(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-emerald-500/50 rounded-xl text-sm font-mono font-black text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <p className="text-[11px] text-slate-500">Actual amount customers pay at checkout.</p>
            </div>

            {/* Live Visual Comparison */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col justify-center text-center">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Live Customer Badge Preview</span>
              <div className="flex items-baseline justify-center gap-2 mt-1">
                <span className="text-xl font-black text-white font-mono">₹{discountPriceHardcopy}</span>
                <span className="text-xs text-slate-500 line-through font-mono">₹{priceHardcopy}</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">({discountPercent}% OFF)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stock & Publishing Details */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-6 shadow-xl">
          <h3 className="text-base font-black text-white border-b border-slate-800 pb-4 flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-blue-400" />
            <span>Stock & Publishing Inventory</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Stock Quantity
              </label>
              <input
                id="admin-book-stock-input"
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Low Stock Threshold
              </label>
              <input
                id="admin-book-threshold-input"
                type="number"
                min="1"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                ISBN Number
              </label>
              <input
                id="admin-book-isbn-input"
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Status
              </label>
              <select
                value={isActive ? 'active' : 'inactive'}
                onChange={(e) => setIsActive(e.target.value === 'active')}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active (Available)</option>
                <option value="inactive">Inactive (Hidden)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase">
              Book Description & Features
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              id="admin-save-book-btn"
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-900/30 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Update Book & Price</span>
                </>
              )}
            </button>
          </div>
        </div>

      </form>

      {/* Price Change Audit History Table */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" />
            <span>Price Change Audit Trail</span>
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">Immutable audit records</span>
        </div>

        {priceHistory.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No price alterations recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 uppercase text-[10px] font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Old Selling Price</th>
                  <th className="py-2.5 px-3">New Selling Price</th>
                  <th className="py-2.5 px-3">MRP Changed</th>
                  <th className="py-2.5 px-3">Changed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {priceHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 text-slate-400">
                      {new Date(item.changed_at).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">₹{item.old_selling_price}</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-400">₹{item.new_selling_price}</td>
                    <td className="py-2.5 px-3 text-slate-400">
                      ₹{item.old_mrp} → ₹{item.new_mrp}
                    </td>
                    <td className="py-2.5 px-3 text-white">{item.changed_by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Price Change Confirmation Dialog */}
      {showPriceConfirmModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl text-center animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              <IndianRupee className="w-7 h-7" />
            </div>

            <div>
              <h4 className="text-lg font-black text-white">Confirm Price Modification?</h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Are you sure you want to change the selling price from{' '}
                <strong className="text-rose-400 font-mono">₹{book.discountPriceHardcopy}</strong> to{' '}
                <strong className="text-emerald-400 font-mono">₹{discountPriceHardcopy}</strong>?
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                New customer orders will reflect ₹{discountPriceHardcopy}. All past/historical orders will remain intact at their original purchase price.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPriceConfirmModal(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-price-change-btn"
                onClick={executeSave}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-lg shadow-emerald-900/30"
              >
                Confirm & Update
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
