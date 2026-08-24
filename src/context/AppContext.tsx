import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Book, 
  BookFormat, 
  CartItem, 
  Coupon, 
  Order, 
  Review, 
  User, 
  Address, 
  BulkInquiry,
  ExamCategory,
  SubjectCategory,
  DigitalLicense
} from '../types';
import { 
  INITIAL_BOOKS, 
  INITIAL_COUPONS, 
  INITIAL_ORDERS, 
  INITIAL_REVIEWS, 
  INITIAL_USER,
  INITIAL_USERS_LIST,
  INITIAL_BULK_INQUIRIES 
} from '../data/initialData';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

interface AppContextType {
  // Navigation & View
  activeView: 'catalog' | 'my_library' | 'orders' | 'admin';
  setActiveView: (view: 'catalog' | 'my_library' | 'orders' | 'admin') => void;
  
  // User & Auth
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoggedIn: boolean;
  usersList: User[];
  login: (identifier: string, passwordOrOtp?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: { name: string; phone: string; email: string; password?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  quickLoginAs: (userId: string) => void;
  updateUserBatch: (userId: string, batches: string[]) => void;
  switchUserRole: (role: 'customer' | 'admin' | 'staff' | 'delivery_manager') => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  setDefaultAddress: (addressId: string) => void;
  toggleBatchEnrollment: (batchName: string) => void;
  
  // Auth & Profile Modals
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'signup' | 'otp';
  setAuthModalMode: (mode: 'login' | 'signup' | 'otp') => void;
  openLoginModal: () => void;
  openSignupModal: () => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  
  // Catalog & Filter state
  books: Book[];
  setBooks: React.Dispatch<React.SetStateAction<Book[]>>;
  filteredBooks: Book[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedExam: ExamCategory;
  setSelectedExam: (exam: ExamCategory) => void;
  selectedSubject: SubjectCategory;
  setSelectedSubject: (subject: SubjectCategory) => void;
  selectedFormat: 'all' | BookFormat;
  setSelectedFormat: (format: 'all' | BookFormat) => void;
  selectedLanguage: 'all' | string;
  setSelectedLanguage: (lang: 'all' | string) => void;
  inStockOnly: boolean;
  setInStockOnly: (val: boolean) => void;
  sortBy: 'popularity' | 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'price_low' | 'price_high';
  setSortBy: (sort: 'popularity' | 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'price_low' | 'price_high') => void;
  batchOnlyFilter: boolean;
  setBatchOnlyFilter: (val: boolean) => void;
  resetFilters: () => void;
  
  // Cart state
  cart: CartItem[];
  addToCart: (book: Book, format: BookFormat, quantity?: number) => void;
  openCheckoutDirect: (book: Book, format: BookFormat, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  updateCartItemFormat: (cartItemId: string, newFormat: BookFormat) => void;
  clearCart: () => void;
  
  // Coupon
  coupons: Coupon[];
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  addCoupon: (couponData: any) => void;
  toggleCouponStatus: (couponId: string) => void;
  
  // Pricing calculations
  cartSubtotal: number;
  cartDiscount: number;
  shippingFee: number;
  codFee: number;
  taxAmount: number;
  cartTotal: number;
  hasPhysicalInCart: boolean;
  hasDigitalInCart: boolean;
  
  // Delivery Pincode
  deliveryPincode: string;
  setDeliveryPincode: (pincode: string) => void;
  pincodeDeliveryEstimate: { serviceable: boolean; days: string; courier: string } | null;
  checkPincode: (pin: string) => void;
  checkPincodeDelivery: (pin: string) => { serviceable: boolean; estimatedDays: string; courier: string; city: string; state: string };
  
  // Modals
  selectedBookForDetail: Book | null;
  setSelectedBookForDetail: (book: Book | null) => void;
  selectedBookForSample: { book: Book; initialPage?: number } | null;
  setSelectedBookForSample: (data: { book: Book; initialPage?: number } | null) => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  isCheckoutModalOpen: boolean;
  setIsCheckoutModalOpen: (open: boolean) => void;
  selectedOrderForInvoice: Order | null;
  setSelectedOrderForInvoice: (order: Order | null) => void;
  selectedOrderForTracking: Order | null;
  setSelectedOrderForTracking: (order: Order | null) => void;
  isBulkModalOpen: boolean;
  setIsBulkModalOpen: (open: boolean) => void;
  
  // Orders
  orders: Order[];
  createOrder: (orderData: Partial<Order>) => Order;
  updateOrderStatus: (orderId: string, status: Order['orderStatus'], trackingNumber?: string, courierPartner?: Order['courierPartner']) => void;
  cancelOrder: (orderId: string, reason?: string) => void;
  requestReturn: (orderId: string, reason: string) => void;
  
  // Digital Library & Watermarking
  downloadDigitalPdf: (bookId: string, licenseKey: string) => { success: boolean; remainingDownloads: number; watermark: string };
  
  // Reviews
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'date' | 'likes'>) => void;
  
  // Bulk Inquiries
  bulkInquiries: BulkInquiry[];
  submitBulkInquiry: (inquiry: Omit<BulkInquiry, 'id' | 'createdAt' | 'status'>) => void;
  updateBulkInquiryStatus: (id: string, status: BulkInquiry['status']) => void;
  
  // Admin Book Management
  addBook: (book: Omit<Book, 'id' | 'createdAt' | 'rating' | 'reviewCount'>) => void;
  addNewBook: (bookData: any) => void;
  updateBook: (id: string, updates: Partial<Book>) => void;
  updateBookStock: (bookId: string, newStock: number) => void;
  deleteBook: (id: string) => void;
  importBooksCSV: (csvData: any[]) => number;
  
  // Toasts
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
  removeToast: (id: string) => void;
  
  // Piracy Hash Inspector
  inspectPiracyHash: (hash: string) => { found: boolean; license?: DigitalLicense; owner?: { name: string; email: string; orderNumber: string } } | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation
  const [activeView, setActiveView] = useState<'catalog' | 'my_library' | 'orders' | 'admin'>('catalog');
  
  // User
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('modi_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  // Books
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem('modi_books');
    return saved ? JSON.parse(saved) : INITIAL_BOOKS;
  });

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('modi_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  // Reviews
  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('modi_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  // Coupons
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('modi_coupons');
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });

  // Bulk Inquiries
  const [bulkInquiries, setBulkInquiries] = useState<BulkInquiry[]>(() => {
    const saved = localStorage.getItem('modi_bulk');
    return saved ? JSON.parse(saved) : INITIAL_BULK_INQUIRIES;
  });

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('modi_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Users List
  const [usersList, setUsersList] = useState<User[]>(() => {
    const saved = localStorage.getItem('modi_users_list');
    return saved ? JSON.parse(saved) : INITIAL_USERS_LIST;
  });

  // Applied Coupon
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExam, setSelectedExam] = useState<ExamCategory>('All Exams');
  const [selectedSubject, setSelectedSubject] = useState<SubjectCategory>('All Subjects');
  const [selectedFormat, setSelectedFormat] = useState<'all' | BookFormat>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<'all' | string>('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [batchOnlyFilter, setBatchOnlyFilter] = useState(false);
  const [sortBy, setSortBy] = useState<'popularity' | 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'price_low' | 'price_high'>('popularity');

  // Computed Filtered Books
  const filteredBooks = React.useMemo(() => {
    return (books || []).filter((book) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = book.title?.toLowerCase().includes(q);
        const matchesAuthor = book.author?.toLowerCase().includes(q);
        const matchesSubject = book.subject?.toLowerCase().includes(q);
        const matchesExam = book.exam?.toLowerCase().includes(q);
        const matchesHighlights = book.highlights?.some((h) => h.toLowerCase().includes(q));
        if (!matchesTitle && !matchesAuthor && !matchesSubject && !matchesExam && !matchesHighlights) {
          return false;
        }
      }

      // Exam category
      if (selectedExam !== 'All Exams' && book.exam !== selectedExam) {
        return false;
      }

      // Subject category
      if (selectedSubject !== 'All Subjects' && book.subject !== selectedSubject) {
        return false;
      }

      // Format filter
      if (selectedFormat !== 'all') {
        if (!book.formatAvailable?.includes(selectedFormat)) {
          return false;
        }
      }

      // Language filter
      if (selectedLanguage !== 'all') {
        if (book.language !== selectedLanguage) {
          return false;
        }
      }

      // In stock only
      if (inStockOnly && book.stockQuantity <= 0) {
        return false;
      }

      // Batch discount only
      if (batchOnlyFilter) {
        const hasBatchDiscount = (book.batchDiscountPercent && book.batchDiscountPercent > 0) || 
          book.linkedBatches?.some((b) => currentUser?.enrolledBatches?.includes(b));
        if (!hasBatchDiscount) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc' || sortBy === 'price_low') {
        return a.discountPricePdf - b.discountPricePdf;
      }
      if (sortBy === 'price_desc' || sortBy === 'price_high') {
        return b.discountPricePdf - a.discountPricePdf;
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      // default: popularity / bestselling
      return (b.reviewCount * b.rating) - (a.reviewCount * a.rating);
    });
  }, [books, searchQuery, selectedExam, selectedSubject, selectedFormat, selectedLanguage, inStockOnly, batchOnlyFilter, sortBy, currentUser?.enrolledBatches]);

  // Delivery
  const [deliveryPincode, setDeliveryPincode] = useState('110009');
  const [pincodeDeliveryEstimate, setPincodeDeliveryEstimate] = useState<{ serviceable: boolean; days: string; courier: string } | null>({
    serviceable: true,
    days: '1-2 Days (Express Dispatch)',
    courier: 'Delhivery Express Direct'
  });

  // Modals
  const [selectedBookForDetail, setSelectedBookForDetail] = useState<Book | null>(null);
  const [selectedBookForSample, setSelectedBookForSample] = useState<{ book: Book; initialPage?: number } | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'otp'>('login');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const isLoggedIn = Boolean(currentUser);

  const openLoginModal = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const openSignupModal = () => {
    setAuthModalMode('signup');
    setIsAuthModalOpen(true);
  };

  // Auth Operations
  const login = async (identifier: string, _passwordOrOtp?: string): Promise<{ success: boolean; error?: string }> => {
    const clean = identifier.trim().toLowerCase();
    if (!clean) {
      return { success: false, error: 'Please enter a valid Mobile number or Email.' };
    }

    // Try finding existing user
    const found = usersList.find((u) => {
      const uEmail = u.email?.toLowerCase().trim();
      const uPhone = u.phone?.replace(/[^0-9]/g, '');
      const inputDigits = clean.replace(/[^0-9]/g, '');
      if (uEmail && uEmail === clean) return true;
      if (inputDigits && inputDigits.length >= 10 && uPhone && uPhone.includes(inputDigits.slice(-10))) return true;
      return false;
    });

    if (found) {
      setCurrentUser(found);
      localStorage.setItem('modi_user', JSON.stringify(found));
      setIsAuthModalOpen(false);
      addToast('success', `Welcome back, ${found.name.split(' ')[0]}!`, 'Logged in successfully.');
      return { success: true };
    }

    // If new mobile/email on quick login, create a new registered customer record automatically
    const isEmail = clean.includes('@');
    const newName = isEmail 
      ? clean.split('@')[0].replace(/[^a-zA-Z]/g, ' ').trim() || 'Railway Aspirant'
      : `Aspirant ${clean.slice(-4)}`;
    
    const newUser: User = {
      id: 'usr-' + Date.now(),
      name: newName.charAt(0).toUpperCase() + newName.slice(1),
      email: isEmail ? clean : `aspirant${clean.replace(/[^0-9]/g, '').slice(-6)}@modiclasses.in`,
      phone: isEmail ? '+91 98765 00000' : (clean.startsWith('+91') ? clean : `+91 ${clean.replace(/[^0-9]/g, '').slice(-10)}`),
      role: 'customer',
      studentRollNumber: `MC-ALP-2025-${Math.floor(1000 + Math.random() * 9000)}`,
      enrolledBatches: ['RRB ALP Psycho Special Batch 2025'],
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      savedAddresses: []
    };

    setUsersList((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    localStorage.setItem('modi_user', JSON.stringify(newUser));
    setIsAuthModalOpen(false);
    addToast('success', `Welcome to Modi Classes, ${newUser.name}!`, 'Account created & logged in successfully.');
    return { success: true };
  };

  const signup = async (data: { name: string; phone: string; email: string; password?: string }): Promise<{ success: boolean; error?: string }> => {
    if (!data.name.trim()) return { success: false, error: 'Full name is required.' };
    if (!data.phone.trim()) return { success: false, error: 'Mobile number is required.' };
    if (!data.email.trim() || !data.email.includes('@')) return { success: false, error: 'Valid email address is required.' };

    const formattedPhone = data.phone.trim().startsWith('+91') 
      ? data.phone.trim() 
      : `+91 ${data.phone.trim().replace(/^0+/, '').slice(-10)}`;

    const newUser: User = {
      id: 'usr-' + Date.now(),
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: formattedPhone,
      role: 'customer',
      studentRollNumber: `MC-ALP-2025-${Math.floor(1000 + Math.random() * 9000)}`,
      enrolledBatches: ['RRB ALP Psycho Special Batch 2025'],
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      savedAddresses: []
    };

    setUsersList((prev) => [newUser, ...prev.filter(u => u.email !== newUser.email && u.phone !== newUser.phone)]);
    setCurrentUser(newUser);
    localStorage.setItem('modi_user', JSON.stringify(newUser));
    setIsAuthModalOpen(false);
    addToast('success', 'Account Created Successfully!', `Welcome to Modi Railway Classes, ${newUser.name}`);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('modi_user');
    if (activeView === 'admin') {
      setActiveView('catalog');
    }
    addToast('info', 'Logged Out', 'You have been signed out safely.');
  };

  const quickLoginAs = (userId: string) => {
    const target = usersList.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      localStorage.setItem('modi_user', JSON.stringify(target));
      setIsAuthModalOpen(false);
      addToast('success', `Switched to ${target.name}`, `Logged in as ${target.role.toUpperCase()}`);
    }
  };

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('modi_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('modi_books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('modi_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('modi_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('modi_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('modi_bulk', JSON.stringify(bulkInquiries));
  }, [bulkInquiries]);

  useEffect(() => {
    localStorage.setItem('modi_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('modi_users_list', JSON.stringify(usersList));
  }, [usersList]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const switchUserRole = (role: 'customer' | 'admin' | 'staff' | 'delivery_manager') => {
    setCurrentUser((prev) => (prev ? { ...prev, role } : null));
    addToast('info', 'Role Switched', `Switched active role to: ${role.toUpperCase()}`);
  };

  const addAddress = (addressData: Omit<Address, 'id'>) => {
    const newAddress: Address = {
      ...addressData,
      id: 'addr-' + Date.now()
    };
    setCurrentUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        savedAddresses: [...(prev.savedAddresses || []), newAddress]
      };
    });
    addToast('success', 'Address Saved', `${newAddress.city}, ${newAddress.pincode} added.`);
  };

  const setDefaultAddress = (addressId: string) => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        savedAddresses: (prev.savedAddresses || []).map((a) => ({
          ...a,
          isDefault: a.id === addressId
        }))
      };
    });
  };

  const toggleBatchEnrollment = (batchName: string) => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const enrolled = prev.enrolledBatches || [];
      const exists = enrolled.includes(batchName);
      const updated = exists 
        ? enrolled.filter(b => b !== batchName)
        : [...enrolled, batchName];
      return { ...prev, enrolledBatches: updated };
    });
    addToast('success', 'Batch Updated', `Toggled enrollment in ${batchName}`);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedExam('All Exams');
    setSelectedSubject('All Subjects');
    setSelectedFormat('all');
    setSelectedLanguage('all');
    setInStockOnly(false);
    setBatchOnlyFilter(false);
    setSortBy('popularity');
  };

  // Helper to compute unit price according to format and batch discounts
  const getBookPriceForFormat = (book: Book, format: BookFormat, isUserInBatch: boolean) => {
    if (format === 'pdf') {
      if (isUserInBatch && book.batchDiscountPercent === 100) {
        return 0;
      }
      return book.discountPricePdf || book.pricePdf;
    }
    if (format === 'hardcopy') {
      return book.discountPriceHardcopy || book.priceHardcopy;
    }
    if (format === 'combo') {
      return book.discountPriceCombo || book.priceCombo;
    }
    return book.discountPricePdf;
  };

  const addToCart = (book: Book, format: BookFormat, quantity: number = 1) => {
    const isUserInBatch = book.linkedBatches?.some((b) => currentUser?.enrolledBatches?.includes(b)) || false;
    const unitPrice = getBookPriceForFormat(book, format, isUserInBatch);
    const isBatchFree = format === 'pdf' && isUserInBatch && book.batchDiscountPercent === 100;

    setCart((prev) => {
      const existing = prev.find((item) => item.bookId === book.id && item.format === format);
      if (existing) {
        // Digital PDF can only have quantity 1
        if (format === 'pdf') {
          addToast('info', 'Already in Cart', 'Digital PDFs only require 1 license.');
          return prev;
        }
        return prev.map((item) =>
          item.id === existing.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        bookId: book.id,
        book,
        format,
        quantity: format === 'pdf' ? 1 : quantity,
        price: unitPrice,
        isBatchFreeDiscountApplied: isBatchFree
      };
      return [...prev, newItem];
    });

    addToast(
      'success', 
      'Added to Cart', 
      `${book.title} (${format.toUpperCase()}) added to your cart.`
    );
  };

  const openCheckoutDirect = (book: Book, format: BookFormat, quantity: number = 1) => {
    // Set item directly and open checkout
    const isUserInBatch = book.linkedBatches?.some((b) => currentUser?.enrolledBatches?.includes(b)) || false;
    const unitPrice = getBookPriceForFormat(book, format, isUserInBatch);
    
    setCart([
      {
        id: `cart-${Date.now()}`,
        bookId: book.id,
        book,
        format,
        quantity,
        price: unitPrice,
        isBatchFreeDiscountApplied: false
      }
    ]);
    setIsCheckoutModalOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
    );
  };

  const updateCartItemFormat = (cartItemId: string, newFormat: BookFormat) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === cartItemId) {
          const isUserInBatch = item.book.linkedBatches?.some((b) => currentUser?.enrolledBatches?.includes(b)) || false;
          const unitPrice = getBookPriceForFormat(item.book, newFormat, isUserInBatch);
          const isBatchFree = newFormat === 'pdf' && isUserInBatch && item.book.batchDiscountPercent === 100;
          return {
            ...item,
            format: newFormat,
            quantity: newFormat === 'pdf' ? 1 : item.quantity,
            price: unitPrice,
            isBatchFreeDiscountApplied: isBatchFree
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Cart calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const hasPhysicalInCart = cart.some((item) => item.format === 'hardcopy' || item.format === 'combo');
  const hasDigitalInCart = cart.some((item) => item.format === 'pdf' || item.format === 'combo');

  // Shipping rules: Free shipping if hardcopy subtotal >= 499, else ₹50
  const physicalSubtotal = cart
    .filter((i) => i.format === 'hardcopy' || i.format === 'combo')
    .reduce((sum, i) => sum + i.price * i.quantity, 0);
  
  const shippingFee = hasPhysicalInCart ? (physicalSubtotal >= 499 ? 0 : 50) : 0;
  const codFee = 0; // standard 0 for online, will toggle during COD checkout
  
  // Tax (GST on Books is 0-5%, we calculate nominal 5% included or shown transparently)
  const taxAmount = Math.round(cartSubtotal * 0.05);

  let cartDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percent') {
      cartDiscount = Math.round((cartSubtotal * appliedCoupon.discountValue) / 100);
      if (appliedCoupon.maxDiscount && cartDiscount > appliedCoupon.maxDiscount) {
        cartDiscount = appliedCoupon.maxDiscount;
      }
    } else {
      cartDiscount = appliedCoupon.discountValue;
    }
  }
  if (cartDiscount > cartSubtotal) {
    cartDiscount = cartSubtotal;
  }

  const cartTotal = Math.max(0, cartSubtotal - cartDiscount + shippingFee);

  const applyCoupon = (code: string) => {
    const trimmed = code.trim().toUpperCase();
    const found = coupons.find((c) => c.code.toUpperCase() === trimmed && c.isActive);
    if (!found) {
      return { success: false, message: 'Invalid or expired coupon code.' };
    }
    if (cartSubtotal < found.minCartValue) {
      return { success: false, message: `Minimum cart value of ₹${found.minCartValue} required for this coupon.` };
    }
    if (found.batchCode) {
      const userEnrolled = currentUser?.enrolledBatches?.includes(found.batchCode);
      if (!userEnrolled) {
        return { success: false, message: `Coupon is exclusive to enrolled ${found.batchCode} students.` };
      }
    }
    setAppliedCoupon(found);
    addToast('success', 'Coupon Applied!', `${found.code} applied successfully.`);
    return { success: true, message: `Coupon ${found.code} applied!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    addToast('info', 'Coupon Removed', 'Discount removed from your cart.');
  };

  const checkPincodeDelivery = (pin: string) => {
    const clean = pin.trim();
    setDeliveryPincode(clean);
    if (clean.length === 6 && /^\d+$/.test(clean)) {
      let result = {
        serviceable: true,
        estimatedDays: '3-4',
        courier: 'Delhivery Air Express',
        city: 'India Region',
        state: 'All Zones'
      };
      if (clean.startsWith('11') || clean.startsWith('12') || clean.startsWith('20')) {
        result = {
          serviceable: true,
          estimatedDays: '1-2',
          courier: 'Delhivery Same-Day/Next-Day',
          city: 'Delhi NCR',
          state: 'North Zone'
        };
      } else if (clean.startsWith('80') || clean.startsWith('82') || clean.startsWith('84')) {
        result = {
          serviceable: true,
          estimatedDays: '2-3',
          courier: 'BlueDart Express Priority',
          city: 'Patna / Bihar / Jharkhand',
          state: 'East Central Zone'
        };
      } else if (clean.startsWith('22') || clean.startsWith('23') || clean.startsWith('21')) {
        result = {
          serviceable: true,
          estimatedDays: '2-3',
          courier: 'Delhivery Surface Express',
          city: 'Lucknow / Prayagraj / UP',
          state: 'Northern Railway'
        };
      }
      setPincodeDeliveryEstimate({
        serviceable: true,
        days: `${result.estimatedDays} Days (${result.city})`,
        courier: result.courier
      });
      return result;
    }
    return {
      serviceable: false,
      estimatedDays: 'N/A',
      courier: 'N/A',
      city: 'Unknown',
      state: 'Unknown'
    };
  };

  const createOrder = (orderData: Partial<Order>): Order => {
    const orderNum = `MC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const invoiceNum = `INV-MC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Generate digital licenses for any digital items
    const digitalLicenses: DigitalLicense[] = (orderData.items || [])
      .filter((i) => i.format === 'pdf' || i.format === 'combo')
      .map((i) => {
        const licKey = `MC-SEC-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
        return {
          bookId: i.bookId,
          bookTitle: i.bookTitle,
          downloadCount: 0,
          maxDownloads: 3,
          licenseKey: licKey,
          watermarkText: `Licensed to: ${orderData.customerName || currentUser?.name || 'Aspirant'} (${orderData.customerEmail || currentUser?.email || 'aspirant@modiclasses.in'} | ${orderData.customerPhone || currentUser?.phone || '+91 98765 00000'}) • Roll: ${currentUser?.studentRollNumber || 'MC-STUDENT-GEN'} • License: ${licKey} • Anti-Piracy Watermark Modi Classes`,
          issuedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        };
      });

    const hasPhysical = (orderData.items || []).some((i) => i.format === 'hardcopy' || i.format === 'combo');
    const hasDigital = (orderData.items || []).some((i) => i.format === 'pdf' || i.format === 'combo');

    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      orderNumber: orderNum,
      userId: currentUser?.id || 'usr-guest-' + Date.now(),
      customerName: orderData.customerName || currentUser?.name || 'Aspirant Student',
      customerEmail: orderData.customerEmail || currentUser?.email || 'aspirant@modiclasses.in',
      customerPhone: orderData.customerPhone || currentUser?.phone || '+91 98765 00000',
      items: orderData.items || [],
      itemsCount: (orderData.items || []).reduce((s, i) => s + i.quantity, 0),
      subtotal: orderData.subtotal ?? cartSubtotal,
      discount: orderData.discount ?? cartDiscount,
      couponCode: appliedCoupon?.code,
      shippingFee: orderData.shippingFee ?? shippingFee,
      codFee: orderData.codFee ?? 0,
      taxAmount: orderData.taxAmount ?? taxAmount,
      totalAmount: orderData.totalAmount ?? cartTotal,
      hasDigitalItems: hasDigital,
      hasPhysicalItems: hasPhysical,
      paymentMethod: orderData.paymentMethod || 'upi',
      paymentStatus: orderData.paymentStatus || 'paid',
      paymentTransactionId: orderData.paymentTransactionId || `UPI/${Date.now().toString().slice(-8)}`,
      orderStatus: hasPhysical ? 'processing' : 'delivered',
      courierPartner: hasPhysical ? 'Delhivery Express' : undefined,
      trackingNumber: hasPhysical ? `DEL-${Math.floor(10000000000 + Math.random() * 90000000000)}-IN` : undefined,
      estimatedDeliveryDate: hasPhysical ? 'In 2-3 Business Days' : undefined,
      trackingTimeline: [
        {
          status: 'ordered',
          title: 'Order Confirmed & Payment Received',
          description: hasDigital 
            ? 'Digital PDF material instantly unlocked in My Library.' 
            : 'Payment captured securely. Dispatched to fulfillment team.',
          location: 'Delhi Central Server',
          timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
          done: true
        },
        ...(hasPhysical ? [
          {
            status: 'packed' as const,
            title: 'Packing & Quality Check in Progress',
            description: 'Books allocated from Mukherjee Nagar warehouse.',
            location: 'Central Fulfillment Hub, Delhi',
            timestamp: 'In Progress',
            done: false
          },
          {
            status: 'shipped' as const,
            title: 'Courier Handover',
            description: 'Package ready for pickup by Delhivery Express.',
            location: 'Dispatch Center',
            timestamp: 'Pending',
            done: false
          },
          {
            status: 'out_for_delivery' as const,
            title: 'Out for Delivery',
            description: 'Delivery agent will contact via SMS/call.',
            location: 'Destination Hub',
            timestamp: 'Pending',
            done: false
          },
          {
            status: 'delivered' as const,
            title: 'Delivered',
            description: 'Delivered to shipping address.',
            location: 'Customer Address',
            timestamp: 'Pending',
            done: false
          }
        ] : [])
      ],
      shippingAddress: orderData.shippingAddress,
      digitalLicenses,
      invoiceNumber: invoiceNum,
      createdAt: new Date().toISOString()
    };

    // Deduct stock for physical items
    setBooks((prevBooks) =>
      prevBooks.map((b) => {
        const matchingItem = newOrder.items.find(
          (i) => i.bookId === b.id && (i.format === 'hardcopy' || i.format === 'combo')
        );
        if (matchingItem) {
          return {
            ...b,
            stockQuantity: Math.max(0, b.stockQuantity - matchingItem.quantity)
          };
        }
        return b;
      })
    );

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (
    orderId: string, 
    status: Order['orderStatus'], 
    trackingNumber?: string, 
    courierPartner?: Order['courierPartner']
  ) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updatedTimeline = order.trackingTimeline.map((step) => {
            if (step.status === status) {
              return {
                ...step,
                done: true,
                timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
              };
            }
            return step;
          });
          return {
            ...order,
            orderStatus: status,
            trackingNumber: trackingNumber || order.trackingNumber,
            courierPartner: courierPartner || order.courierPartner,
            trackingTimeline: updatedTimeline
          };
        }
        return order;
      })
    );
    addToast('success', 'Order Updated', `Order ${orderId} status set to ${status}.`);
  };

  const cancelOrder = (orderId: string, reason?: string) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, orderStatus: 'cancelled', notes: reason } : ord))
    );
    addToast('info', 'Order Cancelled', `Order has been marked cancelled.`);
  };

  const requestReturn = (orderId: string, reason: string) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, notes: `Return Requested: ${reason}` } : ord))
    );
    addToast('success', 'Return Request Submitted', 'Our logistics team will verify and initiate reverse pickup.');
  };

  const downloadDigitalPdf = (bookId: string, licenseKey: string) => {
    let result = { success: false, remainingDownloads: 0, watermark: '' };
    
    setOrders((prev) =>
      prev.map((ord) => {
        const updatedLicenses = ord.digitalLicenses.map((lic) => {
          if (lic.bookId === bookId && lic.licenseKey === licenseKey) {
            if (lic.downloadCount >= lic.maxDownloads) {
              result = { success: false, remainingDownloads: 0, watermark: lic.watermarkText };
              return lic;
            }
            const newCount = lic.downloadCount + 1;
            result = {
              success: true,
              remainingDownloads: lic.maxDownloads - newCount,
              watermark: lic.watermarkText
            };
            return {
              ...lic,
              downloadCount: newCount,
              lastDownloadedAt: new Date().toISOString()
            };
          }
          return lic;
        });
        return { ...ord, digitalLicenses: updatedLicenses };
      })
    );

    if (result.success) {
      addToast('success', 'Download Started', `Dynamic watermarked PDF generated. ${result.remainingDownloads} downloads remaining.`);
    } else {
      addToast('error', 'Download Limit Exceeded', 'Maximum download limit reached for this digital license. Please contact support.');
    }
    return result;
  };

  const addReview = (reviewData: Omit<Review, 'id' | 'date' | 'likes'>) => {
    const newReview: Review = {
      ...reviewData,
      id: 'rev-' + Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      likes: 0
    };
    setReviews((prev) => [newReview, ...prev]);

    // Recalculate book average rating
    const bookRevs = [newReview, ...reviews.filter((r) => r.bookId === reviewData.bookId)];
    const avg = Number((bookRevs.reduce((s, r) => s + r.rating, 0) / bookRevs.length).toFixed(1));
    setBooks((prev) =>
      prev.map((b) => (b.id === reviewData.bookId ? { ...b, rating: avg, reviewCount: b.reviewCount + 1 } : b))
    );
    addToast('success', 'Review Published', 'Thank you for your valuable feedback!');
  };

  const submitBulkInquiry = (inquiryData: Omit<BulkInquiry, 'id' | 'createdAt' | 'status'>) => {
    const newInquiry: BulkInquiry = {
      ...inquiryData,
      id: 'blk-' + Date.now(),
      status: 'new',
      createdAt: new Date().toISOString()
    };
    setBulkInquiries((prev) => [newInquiry, ...prev]);
    addToast('success', 'Bulk Inquiry Submitted', 'Our institutional sales team will contact you with a customized discount quote within 4 hours.');
  };

  const updateBulkInquiryStatus = (id: string, status: BulkInquiry['status']) => {
    setBulkInquiries((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
    addToast('info', 'Status Updated', `Inquiry status changed to ${status}.`);
  };

  const addBook = (bookData: Omit<Book, 'id' | 'createdAt' | 'rating' | 'reviewCount'>) => {
    const newBook: Book = {
      ...bookData,
      id: 'book-' + Date.now(),
      rating: 5.0,
      reviewCount: 1,
      createdAt: new Date().toISOString()
    };
    setBooks((prev) => [newBook, ...prev]);
    addToast('success', 'Book Published', `${newBook.title} is now active in catalog.`);
  };

  const updateBook = (id: string, updates: Partial<Book>) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
    addToast('success', 'Book Updated', 'Changes saved successfully.');
  };

  const deleteBook = (id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
    addToast('info', 'Book Deleted', 'Book removed from catalog.');
  };

  const importBooksCSV = (csvRows: any[]) => {
    let count = 0;
    const importedBooks: Book[] = csvRows.map((row, idx) => {
      count++;
      return {
        id: 'book-csv-' + Date.now() + '-' + idx,
        title: row.title || 'Untitled Material',
        subtitle: row.subtitle || 'Competitive Exam Reference Guide',
        slug: (row.title || 'book').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        author: row.author || 'Dr. A. K. Modi',
        authorDesignation: row.authorDesignation || 'Senior Faculty, Modi Classes',
        coverImage: row.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
        formatAvailable: (row.formats ? row.formats.split(',') : ['pdf', 'hardcopy', 'combo']) as BookFormat[],
        pricePdf: Number(row.pricePdf) || 199,
        discountPricePdf: Number(row.discountPricePdf) || 149,
        priceHardcopy: Number(row.priceHardcopy) || 499,
        discountPriceHardcopy: Number(row.discountPriceHardcopy) || 399,
        priceCombo: Number(row.priceCombo) || 599,
        discountPriceCombo: Number(row.discountPriceCombo) || 449,
        stockQuantity: Number(row.stockQuantity) || 50,
        lowStockThreshold: 10,
        exam: (row.exam || 'UPSC Civil Services') as ExamCategory,
        subject: (row.subject || 'Polity & Constitution') as SubjectCategory,
        targetYear: row.targetYear || '2025-2026',
        language: (row.language || 'English') as any,
        pages: Number(row.pages) || 400,
        edition: row.edition || '2025 Edition',
        isbn: row.isbn || `978-93-8921-${Math.floor(100 + Math.random() * 900)}-0`,
        rating: 4.8,
        reviewCount: 15,
        isBestseller: row.isBestseller === 'true' || false,
        description: row.description || 'Comprehensive competitive study material with previous year solved questions.',
        highlights: ['High-yield concepts', 'PYQ Trends', 'Exam-oriented summary'],
        tableOfContents: [
          { chapter: 1, title: 'Fundamental Concepts & Core Theories', pageRange: 'pp. 1-80', isSampleAvailable: true },
          { chapter: 2, title: 'Advanced Solved Questions & Answer Writing', pageRange: 'pp. 81-180', isSampleAvailable: true }
        ],
        samplePages: [
          { pageNumber: 1, title: 'Core Concepts Overview', content: 'Comprehensive notes and formula cheat sheet for quick exam revision.' }
        ],
        weightGrams: 750,
        publisher: 'Modi Classes Academic Publications',
        isActive: true,
        createdAt: new Date().toISOString()
      };
    });
    setBooks((prev) => [...importedBooks, ...prev]);
    addToast('success', 'CSV Import Completed', `${count} books added to catalog.`);
    return count;
  };

  const inspectPiracyHash = (hash: string) => {
    const clean = hash.trim();
    for (const ord of orders) {
      for (const lic of ord.digitalLicenses) {
        if (lic.licenseKey.toLowerCase().includes(clean.toLowerCase()) || clean.toLowerCase().includes(lic.licenseKey.toLowerCase())) {
          return {
            found: true,
            license: lic,
            owner: {
              name: ord.customerName,
              email: ord.customerEmail,
              orderNumber: ord.orderNumber
            }
          };
        }
      }
    }
    return { found: false };
  };

  const updateUserBatch = (userId: string, batches: string[]) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, enrolledBatches: batches } : u))
    );
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, enrolledBatches: batches }));
    }
    addToast('success', 'Batch Assigned', 'Student batch permissions updated.');
  };

  const updateBookStock = (bookId: string, newStock: number) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, stockQuantity: Math.max(0, newStock) } : b))
    );
    addToast('info', 'Stock Updated', 'Inventory level updated.');
  };

  const addNewBook = (bookData: any) => {
    addBook(bookData);
  };

  const addCoupon = (couponData: any) => {
    const newCoupon: Coupon = {
      id: 'c-' + Date.now(),
      code: (couponData.code || 'SAVE10').toUpperCase().trim(),
      discountType: couponData.discountPercent ? 'percent' : (couponData.type === 'percentage' ? 'percent' : (couponData.discountType || 'flat')),
      discountValue: couponData.discountPercent || couponData.discountFlat || couponData.discountValue || 15,
      minCartValue: couponData.minOrderValue || couponData.minCartValue || 199,
      validTill: couponData.validTill || '2026-12-31',
      description: couponData.description || 'Special Coaching Promo Code',
      usageCount: 0,
      usageLimit: 1000,
      isActive: true
    };
    setCoupons((prev) => [newCoupon, ...prev]);
    addToast('success', 'Coupon Created', `Code ${newCoupon.code} created successfully.`);
  };

  const toggleCouponStatus = (couponId: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === couponId ? { ...c, isActive: !c.isActive } : c))
    );
    addToast('info', 'Coupon Updated', 'Coupon visibility status changed.');
  };

  return (
    <AppContext.Provider
      value={{
        activeView,
        setActiveView,
        currentUser,
        setCurrentUser,
        isLoggedIn,
        usersList,
        login,
        signup,
        logout,
        quickLoginAs,
        updateUserBatch,
        switchUserRole,
        addAddress,
        setDefaultAddress,
        toggleBatchEnrollment,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openLoginModal,
        openSignupModal,
        isProfileModalOpen,
        setIsProfileModalOpen,
        books,
        setBooks,
        filteredBooks,
        searchQuery,
        setSearchQuery,
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
        sortBy,
        setSortBy,
        batchOnlyFilter,
        setBatchOnlyFilter,
        resetFilters,
        cart,
        addToCart,
        openCheckoutDirect,
        removeFromCart,
        updateCartQuantity,
        updateCartItemFormat,
        clearCart,
        coupons,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        addCoupon,
        toggleCouponStatus,
        cartSubtotal,
        cartDiscount,
        shippingFee,
        codFee,
        taxAmount,
        cartTotal,
        hasPhysicalInCart,
        hasDigitalInCart,
        deliveryPincode,
        setDeliveryPincode,
        pincodeDeliveryEstimate,
        checkPincode: (pin: string) => { checkPincodeDelivery(pin); },
        checkPincodeDelivery,
        selectedBookForDetail,
        setSelectedBookForDetail,
        selectedBookForSample,
        setSelectedBookForSample,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        isCheckoutModalOpen,
        setIsCheckoutModalOpen,
        selectedOrderForInvoice,
        setSelectedOrderForInvoice,
        selectedOrderForTracking,
        setSelectedOrderForTracking,
        isBulkModalOpen,
        setIsBulkModalOpen,
        orders,
        createOrder,
        updateOrderStatus,
        cancelOrder,
        requestReturn,
        downloadDigitalPdf,
        reviews,
        addReview,
        bulkInquiries,
        submitBulkInquiry,
        updateBulkInquiryStatus,
        addBook,
        addNewBook,
        updateBook,
        updateBookStock,
        deleteBook,
        importBooksCSV,
        toasts,
        addToast,
        removeToast,
        inspectPiracyHash
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
