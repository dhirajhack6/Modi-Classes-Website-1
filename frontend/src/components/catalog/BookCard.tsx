import React, { useState } from 'react';
import { Book, BookFormat } from '../../types';
import { useApp } from '../../context/AppContext';
import { BookCoverGraphic } from '../common/BookCoverGraphic';
import { 
  FileText, 
  Book as BookIcon, 
  Sparkles, 
  Star, 
  Eye, 
  ShoppingBag, 
  GraduationCap, 
  Check,
  AlertCircle
} from 'lucide-react';

interface BookCardProps {
  book: Book;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const { 
    currentUser, 
    addToCart, 
    setSelectedBookForDetail, 
    setSelectedBookForSample,
    setIsCartDrawerOpen 
  } = useApp();

  const [activeFormat, setActiveFormat] = useState<BookFormat>('pdf');
  const [isAddedRecently, setIsAddedRecently] = useState(false);

  // Check if current user is enrolled in any linked coaching batch
  const isEnrolledInBatch = currentUser?.enrolledBatches ? book.linkedBatches?.some((b) => currentUser.enrolledBatches.includes(b)) : false;
  const isPdfFreeForUser = isEnrolledInBatch && book.batchDiscountPercent === 100;

  // Calculate pricing based on active format
  const getPriceDetails = () => {
    if (activeFormat === 'pdf') {
      if (isPdfFreeForUser) {
        return { original: book.pricePdf, current: 0, isFree: true, discountPercent: 100 };
      }
      return { 
        original: book.pricePdf, 
        current: book.discountPricePdf, 
        isFree: false,
        discountPercent: Math.round(((book.pricePdf - book.discountPricePdf) / book.pricePdf) * 100) 
      };
    }
    if (activeFormat === 'hardcopy') {
      return { 
        original: book.priceHardcopy, 
        current: book.discountPriceHardcopy, 
        isFree: false,
        discountPercent: Math.round(((book.priceHardcopy - book.discountPriceHardcopy) / book.priceHardcopy) * 100) 
      };
    }
    // Combo
    return { 
      original: book.priceCombo, 
      current: book.discountPriceCombo, 
      isFree: false,
      discountPercent: Math.round(((book.priceCombo - book.discountPriceCombo) / book.priceCombo) * 100) 
    };
  };

  const prices = getPriceDetails();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(book, activeFormat, 1);
    setIsAddedRecently(true);
    setTimeout(() => setIsAddedRecently(false), 2000);
  };

  const handleInstantBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(book, activeFormat, 1);
    setIsCartDrawerOpen(true);
  };

  const handleOpenSample = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBookForSample({ book, initialPage: 1 });
  };

  return (
    <div 
      onClick={() => setSelectedBookForDetail(book)}
      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-400/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer relative"
      id={`book-card-${book.id}`}
    >
      {/* Top Banner / Tags */}
      <div className="p-4 pb-0">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 uppercase tracking-wide truncate">
            {book.exam}
          </span>

          <div className="flex items-center gap-1">
            {book.isBestseller && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                <span>Bestseller</span>
              </span>
            )}
            {book.isNewArrival && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900">
                2026 Edition
              </span>
            )}
          </div>
        </div>

        {/* Book Cover Image & Quick Sample Action */}
        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 mb-3 group/cover shadow-xs border border-slate-200">
          <BookCoverGraphic />

          {/* Overlay hover peek */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover/cover:opacity-100 transition-opacity" />

          {/* Quick PDF Sample Peek Trigger */}
          <button
            onClick={handleOpenSample}
            className="absolute bottom-2.5 left-2.5 right-2.5 py-1.5 px-3 rounded-lg bg-white/95 hover:bg-white text-slate-900 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md backdrop-blur-xs transition-all cursor-pointer transform translate-y-2 opacity-0 group-hover/cover:opacity-100 group-hover/cover:translate-y-0"
            title="Read free sample chapters"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-600" />
            <span>Read PDF Sample (Free)</span>
          </button>
        </div>

        {/* Title and Author info */}
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2 group-hover:text-indigo-700 transition-colors font-serif">
            {book.title}
          </h3>
          <p className="text-xs text-slate-600 truncate">
            By <span className="font-semibold text-slate-700">{book.author}</span>
          </p>
        </div>

        {/* Rating and Batch Badge */}
        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1 text-amber-500 font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-slate-800">{book.rating}</span>
            <span className="text-slate-400 font-normal text-[11px]">({book.reviewCount})</span>
          </div>

          {/* Batch Free Badge */}
          {isEnrolledInBatch && (
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              <GraduationCap className="w-3 h-3" />
              <span>Batch Free PDF</span>
            </div>
          )}
        </div>
      </div>

      {/* Format Selector & Pricing Section */}
      <div className="p-4 pt-3 bg-slate-50/70 border-t border-slate-100 space-y-3 mt-3">
        
        {/* Format Selector Chips */}
        <div className="grid grid-cols-3 gap-1 p-0.5 bg-slate-200/80 rounded-lg text-[11px] font-medium">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveFormat('pdf');
            }}
            className={`py-1 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeFormat === 'pdf'
                ? 'bg-white text-indigo-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3 h-3" />
            <span>PDF</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveFormat('hardcopy');
            }}
            className={`py-1 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeFormat === 'hardcopy'
                ? 'bg-white text-indigo-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookIcon className="w-3 h-3" />
            <span>Book</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveFormat('combo');
            }}
            className={`py-1 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeFormat === 'combo'
                ? 'bg-white text-indigo-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-2.5 h-2.5 text-amber-500" />
            <span>Combo</span>
          </button>
        </div>

        {/* Pricing Display */}
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            {prices.isFree ? (
              <span className="text-base font-extrabold text-emerald-600 uppercase tracking-tight">
                FREE <span className="text-[11px] font-normal text-emerald-700">(Batch Pass)</span>
              </span>
            ) : (
              <>
                <span className="text-lg font-black text-slate-900">₹{prices.current}</span>
                <span className="text-xs text-slate-400 line-through">₹{prices.original}</span>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-sm">
                  {prices.discountPercent}% OFF
                </span>
              </>
            )}
          </div>

          {/* Hardcopy Stock status indicator */}
          {activeFormat !== 'pdf' && (
            <span className={`text-[10px] font-semibold ${
              book.stockQuantity <= book.lowStockThreshold ? 'text-rose-600 font-bold' : 'text-slate-500'
            }`}>
              {book.stockQuantity <= book.lowStockThreshold 
                ? `Only ${book.stockQuantity} left!` 
                : `${book.stockQuantity} in stock`}
            </span>
          )}
        </div>

        {/* Action Buttons: Add to Cart & Buy Now */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            className={`w-full py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
              isAddedRecently
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 hover:border-slate-400 shadow-xs'
            }`}
            id={`add-cart-btn-${book.id}`}
          >
            {isAddedRecently ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
                <span>Add Cart</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleInstantBuy}
            className="w-full py-2 px-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20 transition-all flex items-center justify-center gap-1 cursor-pointer"
            id={`instant-buy-btn-${book.id}`}
          >
            <span>{prices.isFree ? 'Claim Free' : 'Buy Now'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
