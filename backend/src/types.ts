export type BookFormat = 'pdf' | 'hardcopy' | 'combo';

export type ExamCategory = 
  | 'All Exams'
  | 'Railway RRB (ALP & Technician)'
  | 'UPSC Civil Services'
  | 'SSC CGL & CHSL'
  | 'NEET UG (Medical)'
  | 'JEE Main & Advanced'
  | 'State PSC (BPSC/UPPSC/MPPSC)'
  | 'Banking & Insurance'
  | 'Foundation (Class 9-12)';

export type SubjectCategory =
  | 'All Subjects'
  | 'Psychological Aptitude & CBAT'
  | 'Polity & Constitution'
  | 'History & Art-Culture'
  | 'Economy & Budget'
  | 'Geography & Environment'
  | 'Physics'
  | 'Chemistry'
  | 'Biology'
  | 'Quantitative Aptitude'
  | 'Reasoning & Mental Ability'
  | 'General Studies & GK';

export type BookLanguage = 'Hindi' | 'English' | 'Bilingual (Hindi + English)';

export interface TableOfContentItem {
  chapter: number;
  title: string;
  pageRange: string;
  isSampleAvailable?: boolean;
}

export interface SamplePage {
  pageNumber: number;
  title: string;
  content: string;
  notes?: string;
  hasDiagram?: boolean;
}

export interface Book {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  author: string;
  authorDesignation: string;
  coverImage: string;
  formatAvailable: BookFormat[];
  
  // Pricing (in INR ₹)
  pricePdf: number;
  discountPricePdf: number;
  
  priceHardcopy: number;
  discountPriceHardcopy: number;
  
  priceCombo: number;
  discountPriceCombo: number;
  
  stockQuantity: number;
  lowStockThreshold: number;
  
  exam: ExamCategory;
  subject: SubjectCategory;
  targetYear: string;
  language: BookLanguage;
  pages: number;
  edition: string;
  isbn: string;
  
  rating: number;
  reviewCount: number;
  
  isBestseller?: boolean;
  isNewArrival?: boolean;
  isBatchExclusive?: boolean;
  
  // Coaching Batch Linkage
  linkedBatches?: string[];
  batchDiscountPercent?: number;
  
  description: string;
  highlights: string[];
  tableOfContents: TableOfContentItem[];
  samplePages: SamplePage[];
  
  weightGrams: number;
  publisher: string;
  isActive: boolean;
  createdAt: string;
}

export interface CartItem {
  id: string;
  bookId: string;
  book: Book;
  format: BookFormat;
  quantity: number;
  price: number;
  isBatchFreeDiscountApplied?: boolean;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  alternatePhone?: string;
  pincode: string;
  line1?: string;
  street?: string;
  line2?: string;
  city: string;
  district?: string;
  state: string;
  landmark?: string;
  addressType?: 'home' | 'work' | 'coaching_hostel' | 'other';
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin' | 'staff' | 'delivery_manager';
  enrolledBatches: string[];
  savedAddresses: Address[];
  studentRollNumber?: string;
  avatarUrl?: string;
  password_hash?: string;
}

export interface DigitalLicense {
  bookId: string;
  bookTitle: string;
  downloadCount: number;
  maxDownloads: number;
  licenseKey: string;
  watermarkText: string;
  issuedAt: string;
  expiresAt: string;
  lastDownloadedAt?: string;
}

export interface OrderItem {
  bookId: string;
  bookTitle: string;
  author: string;
  format: BookFormat;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  coverImage: string;
  digitalLicenseKey?: string;
}

export interface TrackingStep {
  status: 'ordered' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered';
  title: string;
  description: string;
  location: string;
  timestamp: string;
  done: boolean;
}

export type OrderStatus = 'processing' | 'printed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'in_transit' | 'dispatched' | 'confirmed' | 'pending';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  
  items: OrderItem[];
  itemsCount: number;
  
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingFee: number;
  codFee: number;
  taxAmount: number;
  totalAmount: number;
  
  hasDigitalItems: boolean;
  hasPhysicalItems: boolean;
  
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'cod';
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  paymentTransactionId?: string;
  
  orderStatus: OrderStatus;
  courierPartner?: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
  trackingTimeline: TrackingStep[];
  
  shippingAddress?: Address;
  digitalLicenses: DigitalLicense[];
  
  invoiceNumber: string;
  createdAt: string;
  notes?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percent' | 'flat';
  discountValue: number;
  minCartValue: number;
  maxDiscount?: number;
  validTill: string;
  description: string;
  applicableExam?: ExamCategory;
  batchCode?: string;
  usageCount: number;
  usageLimit: number;
  isActive: boolean;
}

export interface Review {
  id: string;
  bookId: string;
  userName: string;
  userBatch?: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
  formatPurchased: BookFormat;
  likes: number;
  conceptRating: number;
  printRating: number;
  questionsRating: number;
}

export interface BulkInquiry {
  id: string;
  institutionName: string;
  contactPerson: string;
  email: string;
  phone: string;
  targetExam: string;
  bookTitles: string[];
  estimatedCopies: number;
  city: string;
  state: string;
  notes: string;
  status: 'new' | 'contacted' | 'quoted' | 'confirmed';
  createdAt: string;
}
