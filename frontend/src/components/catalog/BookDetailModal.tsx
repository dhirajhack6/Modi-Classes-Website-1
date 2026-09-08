import React, { useState } from 'react';
import { Book, BookFormat, Review } from '../../types';
import { useApp } from '../../context/AppContext';
import { BookCoverGraphic } from '../common/BookCoverGraphic';
import { 
  X, 
  Star, 
  FileText, 
  Book as BookIcon, 
  Sparkles, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  Layers, 
  Eye, 
  Check, 
  GraduationCap, 
  MessageSquare, 
  ThumbsUp, 
  MapPin,
  Clock,
  Share2
} from 'lucide-react';

export const BookDetailModal: React.FC = () => {
  const { 
    selectedBookForDetail, 
    setSelectedBookForDetail, 
    setSelectedBookForSample,
    addToCart, 
    setIsCartDrawerOpen,
    currentUser,
    reviews,
    addReview,
    deliveryPincode,
    checkPincode,
    pincodeDeliveryEstimate,
    addToast
  } = useApp();

  const [selectedFormat, setSelectedFormat] = useState<BookFormat>('combo');
  const [quantity, setQuantity] = useState(1);
  const [pincodeInput, setPincodeInput] = useState(deliveryPincode || '110009');
  const [coverSide, setCoverSide] = useState<'front' | 'back'>('front');
  
  // Review form modal inside
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRole, setReviewRole] = useState(currentUser?.enrolledBatches?.[0] || 'UPSC Aspirant');

  if (!selectedBookForDetail) return null;

  const book = selectedBookForDetail;
  const bookReviews = reviews.filter((r) => r.bookId === book.id);

  const isUserInBatch = currentUser && book.linkedBatches?.some((b) => currentUser.enrolledBatches?.includes(b)) || false;
  const isPdfFreeForUser = selectedFormat === 'pdf' && isUserInBatch && book.batchDiscountPercent === 100;

  // Price calculations
  const getFormatPrice = (fmt: BookFormat) => {
    if (fmt === 'pdf') {
      if (isUserInBatch && book.batchDiscountPercent === 100) return { current: 0, original: book.pricePdf, isFree: true };
      return { current: book.discountPricePdf, original: book.pricePdf, isFree: false };
    }
    if (fmt === 'hardcopy') {
      return { current: book.discountPriceHardcopy, original: book.priceHardcopy, isFree: false };
    }
    return { current: book.discountPriceCombo, original: book.priceCombo, isFree: false };
  };

  const activePricing = getFormatPrice(selectedFormat);

  const handleAddToCart = () => {
    addToCart(book, selectedFormat, quantity);
  };

  const handleInstantBuy = () => {
    addToCart(book, selectedFormat, quantity);
    setSelectedBookForDetail(null);
    setIsCartDrawerOpen(true);
  };

  const handleOpenSample = () => {
    setSelectedBookForSample({ book, initialPage: 1 });
  };

  const handlePincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkPincode(pincodeInput);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    addReview({
      bookId: book.id,
      userName: currentUser?.name || 'Anonymous Student',
      userBatch: reviewRole,
      rating: reviewRating,
      comment: reviewComment.trim(),
      verifiedPurchase: true,
      formatPurchased: selectedFormat,
      conceptRating: reviewRating,
      printRating: reviewRating,
      questionsRating: reviewRating
    });
    setReviewComment('');
    setShowReviewForm(false);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addToast('success', 'Link Copied', 'Book link copied to clipboard.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="w-full max-w-5xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/80 sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="text-indigo-700 font-bold">{book.exam}</span>
            <span>/</span>
            <span>{book.subject}</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold truncate max-w-xs">{book.title}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Share study material link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedBookForDetail(null)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          
          {/* Main Grid: Left Cover & Right Info */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Left: Book Cover & Sample CTA */}
            <div className="md:col-span-5 space-y-4">
              <div 
                className="relative aspect-[3/4] max-w-[320px] mx-auto rounded-2xl overflow-hidden shadow-lg border border-slate-200 cursor-pointer group"
                onClick={() => setCoverSide(prev => prev === 'front' ? 'back' : 'front')}
                title="Click to toggle Front / Back Cover"
              >
                <BookCoverGraphic 
                  side={coverSide}
                  coverImage={book.coverImage}
                  backCoverImage={book.backCoverImage}
                />
                <div className="absolute top-3 left-3 bg-indigo-700/95 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs z-30">
                  {book.edition}
                </div>
                <div className="absolute bottom-3 right-3 bg-slate-900/85 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-xs flex items-center gap-1 z-30 opacity-80 group-hover:opacity-100 transition-opacity">
                  <span>{coverSide === 'front' ? 'Flip to Back Cover' : 'Flip to Front Cover'}</span>
                </div>
              </div>

              {/* Cover View Selector: Front / Back */}
              <div className="flex items-center justify-center gap-2 max-w-[320px] mx-auto">
                <button
                  type="button"
                  onClick={() => setCoverSide('front')}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
                    coverSide === 'front'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>Front Cover</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCoverSide('back')}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
                    coverSide === 'back'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>Back Cover</span>
                </button>
              </div>

              {/* Free Sample Chapter Button */}
              <button
                onClick={handleOpenSample}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Eye className="w-4 h-4 text-amber-400" />
                <span>Read Free PDF Sample & Table of Contents</span>
              </button>

              {/* Book Specs Mini Table */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Author / Faculty:</span>
                  <span className="font-semibold text-slate-900">{book.author}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Pages:</span>
                  <span className="font-semibold text-slate-900">{book.pages} Pages</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Language / Medium:</span>
                  <span className="font-semibold text-slate-900">{book.language}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>ISBN Identifier:</span>
                  <span className="font-mono text-slate-900 text-[11px]">{book.isbn}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Weight & Packaging:</span>
                  <span className="font-semibold text-slate-900">{book.weightGrams}g (Book Post Bound)</span>
                </div>
              </div>
            </div>

            {/* Right: Book Details, Format Selector & Checkout */}
            <div className="md:col-span-7 space-y-6">
              
              {/* Title & Author */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                    {book.exam}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                    {book.subject}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif leading-snug">
                  {book.title}
                </h1>
                <p className="text-xs text-slate-500 mt-1">{book.subtitle}</p>

                {/* Rating line */}
                <div className="flex items-center gap-2 mt-3 text-xs">
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-800 font-bold px-2 py-1 rounded-md border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{book.rating} / 5.0</span>
                  </div>
                  <span className="text-slate-500">Based on {book.reviewCount} verified student ratings</span>
                </div>
              </div>

              {/* Coaching Batch Linkage Box */}
              {book.linkedBatches && book.linkedBatches.length > 0 && (
                <div className="p-4 rounded-xl bg-linear-to-r from-amber-50 via-amber-100/60 to-orange-50 border border-amber-300/80">
                  <div className="flex items-start gap-3">
                    <GraduationCap className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-amber-950">
                        Coaching Batch Benefit: {book.linkedBatches.join(', ')}
                      </h4>
                      <p className="text-xs text-amber-900 mt-0.5 leading-relaxed">
                        {isUserInBatch ? (
                          <strong className="text-emerald-700 font-bold">
                            ✓ You are enrolled in {currentUser.enrolledBatches.join(', ')}! The PDF edition is 100% FREE for you.
                          </strong>
                        ) : (
                          <span>
                            Enrolled students in this batch receive complimentary digital PDFs and 50% discount on printed hardcopies.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Format Selector Cards (PDF vs Hardcopy vs Combo) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Material Format
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* PDF Digital */}
                  <button
                    type="button"
                    onClick={() => setSelectedFormat('pdf')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                      selectedFormat === 'pdf'
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.2 rounded-sm">
                        INSTANT
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900">PDF Digital</p>
                    <p className="text-[11px] text-slate-500 mb-2">Dynamic Watermarked</p>
                    <div className="text-sm font-extrabold text-slate-900">
                      {isUserInBatch ? (
                        <span className="text-emerald-600">FREE</span>
                      ) : (
                        <>₹{book.discountPricePdf} <span className="text-xs font-normal text-slate-400 line-through">₹{book.pricePdf}</span></>
                      )}
                    </div>
                  </button>

                  {/* Hardcopy Physical */}
                  <button
                    type="button"
                    onClick={() => setSelectedFormat('hardcopy')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                      selectedFormat === 'hardcopy'
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <BookIcon className="w-4 h-4 text-amber-600" />
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded-sm">
                        DISPATCH 24H
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900">Physical Book</p>
                    <p className="text-[11px] text-slate-500 mb-2">Paperback Bound</p>
                    <div className="text-sm font-extrabold text-slate-900">
                      ₹{book.discountPriceHardcopy} <span className="text-xs font-normal text-slate-400 line-through">₹{book.priceHardcopy}</span>
                    </div>
                  </button>

                  {/* Combo (Best Value) */}
                  <button
                    type="button"
                    onClick={() => setSelectedFormat('combo')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                      selectedFormat === 'combo'
                        ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-400/40'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="absolute -top-2.5 right-2 bg-amber-500 text-slate-950 font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Best Value
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                    </div>
                    <p className="text-xs font-bold text-slate-900">PDF + Hardcopy</p>
                    <p className="text-[11px] text-slate-500 mb-2">Instant + Physical</p>
                    <div className="text-sm font-extrabold text-slate-900">
                      ₹{book.discountPriceCombo} <span className="text-xs font-normal text-slate-400 line-through">₹{book.priceCombo}</span>
                    </div>
                  </button>

                </div>
              </div>

              {/* Delivery Estimator for Physical Formats */}
              {selectedFormat !== 'pdf' && (
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-indigo-600" />
                      Check Delivery by Pincode:
                    </span>
                    <span className="text-slate-500">Stock: {book.stockQuantity} available</span>
                  </div>

                  <form onSubmit={handlePincodeSubmit} className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        maxLength={6}
                        value={pincodeInput}
                        onChange={(e) => setPincodeInput(e.target.value)}
                        placeholder="Enter 6-digit Pincode (e.g. 110009)"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-600 bg-white"
                      />
                      <MapPin className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
                    >
                      Check
                    </button>
                  </form>

                  {pincodeDeliveryEstimate && (
                    <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>{pincodeDeliveryEstimate.days} via {pincodeDeliveryEstimate.courier}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons: Add to Cart & Buy Now */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  {selectedFormat !== 'pdf' && (
                    <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 px-2 py-1 text-xs">
                      <span className="text-slate-500 mr-2 text-[11px]">Qty:</span>
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-1 hover:bg-slate-200 rounded-sm font-bold"
                      >
                        -
                      </button>
                      <span className="px-2 font-bold text-slate-900">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(book.stockQuantity, quantity + 1))}
                        className="p-1 hover:bg-slate-200 rounded-sm font-bold"
                      >
                        +
                      </button>
                    </div>
                  )}

                  <button
                    onClick={handleAddToCart}
                    className="flex-1 py-3 px-4 rounded-xl bg-white hover:bg-slate-50 border-2 border-indigo-600 text-indigo-700 text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={handleInstantBuy}
                    className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>{activePricing.isFree ? 'Claim Free PDF' : 'Buy Now with UPI'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 text-center">
                  🔒 100% Secure Checkout via Razorpay & UPI. Free Replacement for Damaged Physical Books.
                </p>
              </div>

            </div>
          </div>

          {/* Highlights & Description */}
          <div className="border-t border-slate-100 pt-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-serif">
              About This Study Material
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
              {book.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {book.highlights.map((highlight, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Table of Contents List */}
          <div className="border-t border-slate-100 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-serif">
                Detailed Table of Contents ({book.tableOfContents.length} Chapters)
              </h3>
              <button
                onClick={handleOpenSample}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Read Free Sample</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {book.tableOfContents.map((toc) => (
                <div
                  key={toc.chapter}
                  className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white flex items-center justify-between gap-3 text-xs transition-colors"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-indigo-700 mr-1.5">Ch {toc.chapter}.</span>
                    <span className="font-medium text-slate-800">{toc.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-slate-600">{toc.pageRange}</span>
                    {toc.isSampleAvailable && (
                      <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-sm">
                        PREVIEW
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Reviews & Ratings Section */}
          <div className="border-t border-slate-100 pt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-serif">
                  Verified Student Reviews & Feedback
                </h3>
                <p className="text-xs text-slate-500">From rankers and classroom students</p>
              </div>

              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Write Review</span>
              </button>
            </div>

            {/* Review Form Drawer/Modal */}
            {showReviewForm && (
              <form onSubmit={handleSubmitReview} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Your Rating & Review</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 cursor-pointer"
                      >
                        <Star className={`w-4 h-4 ${
                          star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    value={reviewRole}
                    onChange={(e) => setReviewRole(e.target.value)}
                    placeholder="Your Batch or Exam Target (e.g. UPSC CSE 2025 Aspirant)"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                  />
                </div>

                <div>
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="How did this study material help in your syllabus completion and PYQ solving?"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                  >
                    Publish Review
                  </button>
                </div>
              </form>
            )}

            {/* Reviews List */}
            <div className="space-y-3">
              {bookReviews.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No reviews yet for this edition. Be the first student to review!</p>
              ) : (
                bookReviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{rev.userName}</span>
                          {rev.verifiedPurchase && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-sm flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" />
                              Verified Buyer
                            </span>
                          )}
                        </div>
                        {rev.userBatch && (
                          <p className="text-[11px] text-indigo-700 font-medium">{rev.userBatch}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-sans">{rev.comment}</p>
                    
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>Purchased {rev.formatPurchased.toUpperCase()} • {rev.date}</span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <ThumbsUp className="w-3 h-3" />
                        {rev.likes || 0} students found this helpful
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
