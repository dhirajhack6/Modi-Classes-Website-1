import { Book, Coupon, Order, Review, User, BulkInquiry } from '../types';

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'book-alp-psycho',
    title: 'RAILWAY Psychological/Aptitude Test For Asst. Loco Pilot (Diesel/Electrical)',
    subtitle: 'मनोवैज्ञानिक/अभिरुचि परीक्षण सहायक लोको पायलट (डीज़ल/इलेक्ट्रिकल) • Based on Latest Guidelines of RDSO For Online Exam 2026 • Previous Year ALP (2014-2025) भर्ती परीक्षाओं के प्रश्न-पत्र हल सहित • According to CBAT New Pattern Memory Figure Test',
    slug: 'railway-psychological-aptitude-test-asst-loco-pilot-vidyasagar-2026',
    author: 'Sandeep Kumar (Vidyasagar Publication)',
    authorDesignation: 'Senior Faculty & RDSO Aptitude Specialist, Vidyasagar Publication',
    coverImage: '/assets/book.jpg',
    formatAvailable: ['hardcopy'],
    pricePdf: 499,
    discountPricePdf: 499,
    priceHardcopy: 899,
    discountPriceHardcopy: 499,
    priceCombo: 899,
    discountPriceCombo: 499,
    stockQuantity: 120,
    lowStockThreshold: 20,
    exam: 'Railway RRB (ALP & Technician)',
    subject: 'Psychological Aptitude & CBAT',
    targetYear: '2026 Recruitment Edition',
    language: 'Bilingual (Hindi + English)',
    pages: 524,
    edition: '2026 RDSO Revised Edition (According to CBAT 2025 Exam)',
    isbn: '978-93-8921-990-1',
    rating: 4.98,
    reviewCount: 2150,
    isBestseller: true,
    isNewArrival: true,
    isBatchExclusive: false,
    linkedBatches: ['RRB ALP Psycho Special Batch 2025', 'Railway Loco Pilot Super-60'],
    batchDiscountPercent: 0,
    description: 'The authoritative 2026 edition for Indian Railways Assistant Loco Pilot (ALP Diesel/Electrical) and Technician Computer-Based Aptitude Test (CBAT). Authored by Sandeep Kumar (Vidyasagar Publication) strictly based on the latest RDSO guidelines for online examination. Covers complete 10+ years Previous Year Papers (2014-2025) with detailed solutions, all 5 Psycho Batteries, New Pattern Memory Figure Tests, 50 full-length practice sets with 50 physical OMR practice sheets, and complimentary online exam simulator access key.',
    highlights: [
      'Based on Latest Guidelines of RDSO For Online Exam (2026 Edition)',
      'Previous Year ALP (2014-2025) भर्ती परीक्षाओं के प्रश्न-पत्र 100% विस्तृत हल सहित',
      'According to CBAT 2025 Exam: New Pattern Memory Figure Test Decoded',
      'All 5 Psycho Batteries Decoded: Memory Test, Direction/Table Test, 3D Depth Perception/Brick Test, Concentration Test, Perceptual Speed Test',
      '50 Full-Length Timed Practice Sets with 50 Physical OMR Bubble Sheets Included',
      'Free Scratch Card Online Access Key to CBAT Computer Exam Simulator',
      'Bilingual Format (Hindi-English) for Railway Aspirants across All RRB Zones',
      '48-Hour Dispatch via Express Courier with Real-Time Tracking across all Indian Pincodes'
    ],
    tableOfContents: [
      { chapter: 1, title: 'Battery 1: Memory Test (Building / House Memory, Railway Track Memory, Figure & Object-Number)', pageRange: 'pp. 1-84', isSampleAvailable: true },
      { chapter: 2, title: 'Battery 2: Following Direction Test & Table Test (Speed Clock Matrix & Row-Column Hacks)', pageRange: 'pp. 85-160', isSampleAvailable: true },
      { chapter: 3, title: 'Battery 3: Depth Perception & 3D Brick Test (Hidden Cube Visualization & Contacting Face Formula)', pageRange: 'pp. 161-240', isSampleAvailable: true },
      { chapter: 4, title: 'Battery 4: Concentration & Yes-No Test (Find Digit 6 & 9 Drills, Split-Second Scanning)', pageRange: 'pp. 241-310', isSampleAvailable: true },
      { chapter: 5, title: 'Battery 5: Perceptual Speed & Hexagon / Similarity Test (Instant Optical Pattern Matching)', pageRange: 'pp. 311-370', isSampleAvailable: true },
      { chapter: 6, title: 'RDSO Official T-Score Formula & Zone-wise Minimum Cutoff Analysis', pageRange: 'pp. 371-395', isSampleAvailable: true },
      { chapter: 7, title: '50 Full-Length Timed CBAT Mock Test Sets with 50 Physical OMR Sheets & Solutions', pageRange: 'pp. 396-524', isSampleAvailable: false }
    ],
    samplePages: [
      {
        pageNumber: 1,
        title: 'Battery 1 (Memory Test): Building & House Map Memorization Hacks',
        content: `RDSO Memory Test Rule:
You are given a Study Page with 12 landmarks / buildings for 2 minutes. Then a Test Page appears with blank positions for 2 minutes.

⭐ Modi Classes Secret Technique: "Clockwise Story Association"
1. Divide the layout into 4 quadrants (North-West, North-East, South-West, South-East).
2. Connect symbols in a clockwise narrative: "The Hospital (NW) sends an Ambulance to the Railway Station (NE), which then refuels at the Petrol Pump (SE) near the School (SW)."
3. Practice with 12 symbols: Focus on relative corner anchors rather than absolute coordinates.

Speed Metric:
• Target Score: 11-12 correct in under 90 seconds.
• Common Trap: Distractor buildings with slight roof shape changes. Always look at the door/window geometry!`,
        notes: 'RDSO Cutoff Tip: Memory test has the highest elimination rate. Consistent 10+ score guarantees T-Score > 48.',
        hasDiagram: true
      },
      {
        pageNumber: 2,
        title: 'Battery 3 (Depth Perception): 3D Brick Test Contacting Face Formula',
        content: `RDSO Brick Test Rule:
A stack of 10 labeled bricks (A, B, C, D, E...) is shown. You must find how many other bricks are in DIRECT CONTACT with a target brick.

⭐ Modi Classes 3-Step Touchdown Formula:
1. Horizontal Contact (Left & Right faces of the target brick).
2. Vertical Top Contact (Bricks resting directly on top).
3. Vertical Bottom Contact (Bricks supporting from below).
4. Note: Corner touches (point or line contact without full surface touch) do NOT count as contact!

Example Practice Problem:
Brick 'A' has:
• Left: Brick B (1 touch)
• Right: None
• Top: Bricks C & D resting on top (2 touches)
• Bottom: Brick E underneath (1 touch)
=> Total Contacting Bricks for A = 1 + 2 + 1 = 4 Bricks. (Calculated in 4 seconds!)`,
        notes: 'Time Limit: 50 Questions in 5 Minutes (6 seconds per brick question). Zero calculation trick saves 3 minutes!',
        hasDiagram: true
      },
      {
        pageNumber: 3,
        title: 'Battery 2 (Following Direction): Clock / Compass Direction Matrix',
        content: `RDSO Clock & Table Test Rule:
A 5x5 letter matrix or circular 12-hour clock dial with letters at each hour marker is presented.

⭐ Rapid 90° & 180° Angular Offset Formula:
• Opposite = +6 Hours / 180°
• Right Turn (Clockwise) = +3 Hours / 90°
• Left Turn (Anti-Clockwise) = -3 Hours / 270°

Fast Track Rule for Table Test:
"Move from Row 2 Column 4 diagonally to the left, then two steps down..."
Rule: Never trace on screen with a finger (forbidden in CBAT center). Train your eyes to jump directly using coordinate arithmetic (X-2, Y+2).`,
        notes: 'Exam Warning: In CBAT, mouse cursor tracking can be slow. Master peripheral vision scanning.'
      }
    ],
    weightGrams: 980,
    publisher: 'Modi Railway Psychotest Classes Publications (New Delhi)',
    isActive: true,
    createdAt: '2025-01-10T10:00:00Z'
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'c-alp-1',
    code: 'ALPSPECIAL',
    discountType: 'flat',
    discountValue: 100,
    minCartValue: 450,
    validTill: '2026-12-31',
    description: 'Flat ₹100 OFF on RRB ALP Psycho Test Book (Hardcopy / Combo)',
    usageCount: 1420,
    usageLimit: 5000,
    isActive: true
  },
  {
    id: 'c-alp-2',
    code: 'LOCOPILOT50',
    discountType: 'flat',
    discountValue: 50,
    minCartValue: 190,
    validTill: '2026-12-31',
    description: 'Flat ₹50 OFF for all Railway ALP Aspirants on any format',
    usageCount: 890,
    usageLimit: 3000,
    isActive: true
  },
  {
    id: 'c-alp-3',
    code: 'BATCHFREE',
    discountType: 'percent',
    discountValue: 100,
    minCartValue: 0,
    batchCode: 'RRB ALP Psycho Special Batch 2025',
    validTill: '2026-12-31',
    description: '100% Free Digital PDF for Enrolled Modi Classes Batch Students',
    usageCount: 620,
    usageLimit: 2000,
    isActive: true
  }
];

export const INITIAL_USER: User = {
  id: 'usr-101',
  name: 'Aman Deep Verma',
  email: 'k07417805@gmail.com',
  phone: '+91 98765 43210',
  role: 'customer',
  studentRollNumber: 'MC-ALP-2025-0842',
  enrolledBatches: ['RRB ALP Psycho Special Batch 2025', 'Railway Loco Pilot Super-60'],
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  savedAddresses: [
    {
      id: 'addr-1',
      fullName: 'Aman Deep Verma',
      phone: '+91 98765 43210',
      alternatePhone: '+91 94150 12345',
      pincode: '110009',
      line1: 'Flat 402, Mukherjee Nagar Academic Enclave',
      street: 'Flat 402, Mukherjee Nagar Academic Enclave',
      line2: 'Near Batra Cinema & Modi Classes Study Center',
      city: 'North Delhi',
      district: 'North Delhi',
      state: 'Delhi (NCT)',
      landmark: 'Near Batra Commercial Complex',
      addressType: 'coaching_hostel',
      isDefault: true
    },
    {
      id: 'addr-2',
      fullName: 'Aman Deep Verma (Home)',
      phone: '+91 98765 43210',
      alternatePhone: '+91 98390 54321',
      pincode: '800001',
      line1: 'House 14, Boring Road, Anandpuri',
      street: 'House 14, Boring Road, Anandpuri',
      city: 'Patna',
      district: 'Patna',
      state: 'Bihar',
      landmark: 'Behind Krishna Apartment',
      addressType: 'home',
      isDefault: false
    }
  ]
};

export const INITIAL_USERS_LIST: User[] = [
  INITIAL_USER,
  {
    id: 'usr-102',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '+91 98112 34567',
    role: 'customer',
    studentRollNumber: 'MC-ALP-2025-1102',
    enrolledBatches: ['RRB ALP Psycho Special Batch 2025'],
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    savedAddresses: []
  },
  {
    id: 'usr-103',
    name: 'Rohan Gupta',
    email: 'rohan.railway@example.com',
    phone: '+91 97188 99120',
    role: 'customer',
    studentRollNumber: 'MC-ALP-2025-3491',
    enrolledBatches: ['Railway Loco Pilot Super-60'],
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    savedAddresses: []
  },
  {
    id: 'usr-104',
    name: 'Er. Alok Modi',
    email: 'admin@modiclasses.in',
    phone: '+91 98100 88221',
    role: 'admin',
    studentRollNumber: 'MC-FACULTY-001',
    enrolledBatches: ['RRB ALP Psycho Special Batch 2025', 'Railway Loco Pilot Super-60', 'ALP Foundation 2026'],
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    savedAddresses: []
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-alp-901',
    orderNumber: 'MC-ALP-2025-78901',
    userId: 'usr-101',
    customerName: 'Aman Deep Verma',
    customerEmail: 'k07417805@gmail.com',
    customerPhone: '+91 98765 43210',
    items: [
      {
        bookId: 'book-alp-psycho',
        bookTitle: 'RRB ALP Psychological Aptitude Test (CBAT) Master Guide & Practice Book',
        author: 'Er. Alok Modi & Ex-Chief Loco Inspector R. K. Yadav',
        format: 'combo',
        quantity: 1,
        unitPrice: 549,
        totalPrice: 549,
        coverImage: '/assets/book.jpg',
        digitalLicenseKey: 'MC-LIC-ALP-9821-X9'
      }
    ],
    itemsCount: 1,
    subtotal: 549,
    discount: 50,
    couponCode: 'LOCOPILOT50',
    shippingFee: 0,
    codFee: 0,
    taxAmount: 25,
    totalAmount: 499,
    hasDigitalItems: true,
    hasPhysicalItems: true,
    paymentMethod: 'upi',
    paymentStatus: 'paid',
    paymentTransactionId: 'UPI/20250813/981273918239',
    orderStatus: 'shipped',
    courierPartner: 'Delhivery Express',
    trackingNumber: 'DEL-98421098234-IN',
    estimatedDeliveryDate: 'Aug 21, 2026',
    trackingTimeline: [
      {
        status: 'ordered',
        title: 'Order Confirmed & Paid via UPI',
        description: 'Payment verified. Digital PDF unlocked instantly in My Library with dynamic anti-piracy watermark.',
        location: 'Delhi Central Server',
        timestamp: 'Aug 18, 2026 - 10:14 AM',
        done: true
      },
      {
        status: 'packed',
        title: 'Hardcopy Book Packed & Quality Checked',
        description: 'ALP Psycho Guide + 50 OMR Sheets verified, shrink-wrapped, and tax invoice attached.',
        location: 'Modi Classes Central Warehouse (Mukherjee Nagar, Delhi)',
        timestamp: 'Aug 18, 2026 - 02:30 PM',
        done: true
      },
      {
        status: 'shipped',
        title: 'Handed over to Courier (Delhivery Express)',
        description: 'Package picked up. In transit to North Delhi Hub for express delivery.',
        location: 'Delhi Hub',
        timestamp: 'Aug 18, 2026 - 06:15 PM',
        done: true
      },
      {
        status: 'out_for_delivery',
        title: 'Out for Delivery',
        description: 'Assigned to delivery executive. Expected delivery by 4 PM.',
        location: 'Destination Hub',
        timestamp: 'Pending',
        done: false
      },
      {
        status: 'delivered',
        title: 'Delivered to Customer',
        description: 'Package handed over with OTP verification.',
        location: 'Delivery Address',
        timestamp: 'Pending',
        done: false
      }
    ],
    shippingAddress: INITIAL_USER.savedAddresses[0],
    digitalLicenses: [
      {
        bookId: 'book-alp-psycho',
        bookTitle: 'RRB ALP Psychological Aptitude Test (CBAT) Master Guide & Practice Book',
        downloadCount: 1,
        maxDownloads: 3,
        licenseKey: 'MC-SEC-ALP-7829-9182',
        watermarkText: 'Licensed to: Aman Deep Verma (k07417805@gmail.com | +91 98765 43210) • Modi Classes Roll: MC-ALP-2025-0842 • IP: 103.24.12.98 • Resale/Sharing Strictly Prohibited Under Copyright Act 1957',
        issuedAt: '2026-08-18T10:14:00Z',
        expiresAt: '2027-08-18T10:14:00Z',
        lastDownloadedAt: '2026-08-18T10:18:00Z'
      }
    ],
    invoiceNumber: 'INV-MC-ALP-2026-0981',
    createdAt: '2026-08-18T10:14:00Z'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-alp-1',
    bookId: 'book-alp-psycho',
    userName: 'Vikash Kumar Choudhary',
    userBatch: 'Selected as RRB ALP (Northern Railway - New Delhi Division)',
    rating: 5,
    date: 'August 04, 2025',
    comment: 'Scored 64.2 T-Score in CBAT! Modi Sir’s 3D Brick touchdown formula and Memory Clockwise Story technique are unmatched. In the actual RDSO exam, I finished the Memory test 35 seconds early and scored 100% in Depth Perception. The online simulator interface in this book is an exact replica of the TCS test screen.',
    verifiedPurchase: true,
    formatPurchased: 'combo',
    likes: 194,
    conceptRating: 5,
    printRating: 5,
    questionsRating: 5
  },
  {
    id: 'rev-alp-2',
    bookId: 'book-alp-psycho',
    userName: 'Deepak Meena',
    userBatch: 'Selected as RRB ALP (Western Railway - Mumbai Central)',
    rating: 5,
    date: 'July 22, 2025',
    comment: 'Must-have book for every railway aspirant. I had failed the psycho test in the 2018 recruitment by just 1.5 marks in the Table Test. This book taught me the coordinate eye-jumping technique. Cleared with 58+ T-Score in all 5 batteries! Hardcopy delivery was super fast (received in 36 hours in Kota).',
    verifiedPurchase: true,
    formatPurchased: 'hardcopy',
    likes: 142,
    conceptRating: 5,
    printRating: 5,
    questionsRating: 5
  },
  {
    id: 'rev-alp-3',
    bookId: 'book-alp-psycho',
    userName: 'Saurabh Raj',
    userBatch: 'RRB ALP Psycho Special Batch 2025',
    rating: 5,
    date: 'August 12, 2025',
    comment: 'The digital PDF watermarking is crystal clear on my iPad. 50 full mock tests with actual RDSO timing give real exam simulation. Best investment for ALP CBAT.',
    verifiedPurchase: true,
    formatPurchased: 'pdf',
    likes: 88,
    conceptRating: 5,
    printRating: 5,
    questionsRating: 5
  }
];

export const INITIAL_BULK_INQUIRIES: BulkInquiry[] = [
  {
    id: 'blk-alp-1',
    institutionName: 'Railway Aspirants Coaching Hub (Patna)',
    contactPerson: 'Er. S. N. Pandey',
    email: 'railwayhub.patna@gmail.com',
    phone: '+91 94310 98765',
    targetExam: 'Railway RRB (ALP & Technician)',
    bookTitles: ['RRB ALP Psychological Aptitude Test (CBAT) Master Guide'],
    estimatedCopies: 150,
    city: 'Patna',
    state: 'Bihar',
    notes: 'Require 150 hardcopies for our specialized ALP CBAT classroom batches before next month.',
    status: 'quoted',
    createdAt: '2025-08-14T14:30:00Z'
  }
];
