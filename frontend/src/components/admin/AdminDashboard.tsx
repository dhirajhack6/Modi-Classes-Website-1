import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  TrendingUp, 
  Package, 
  Users, 
  ShieldCheck, 
  Tag, 
  Plus, 
  Edit3, 
  Trash2, 
  Truck, 
  FileText, 
  Check, 
  AlertTriangle, 
  Search, 
  Upload, 
  Key, 
  DollarSign, 
  BarChart3, 
  GraduationCap,
  Layers,
  ArrowUpRight,
  BookOpen
} from 'lucide-react';
import { Book, Coupon, Order, OrderStatus } from '../../types';

export const AdminDashboard: React.FC = () => {
  const { 
    books, 
    orders, 
    coupons, 
    updateOrderStatus, 
    updateBookStock, 
    addNewBook, 
    addCoupon, 
    toggleCouponStatus,
    usersList,
    updateUserBatch,
    addToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'catalog' | 'orders' | 'students' | 'coupons' | 'piracy'>('overview');
  
  // Book creation modal state
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('Modi Classes Senior Faculty');
  const [newExam, setNewExam] = useState<'UPSC CSE' | 'SSC CGL' | 'NEET' | 'State PSC'>('UPSC CSE');
  const [newSubject, setNewSubject] = useState('Polity & Constitution');
  const [newPricePdf, setNewPricePdf] = useState(199);
  const [newPriceHardcopy, setNewPriceHardcopy] = useState(499);
  const [newPriceCombo, setNewPriceCombo] = useState(549);
  const [newStock, setNewStock] = useState(150);
  const [newBatchDiscount, setNewBatchDiscount] = useState(100);

  // Coupon creation
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState(20);
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'flat'>('percentage');
  const [newCouponMinOrder, setNewCouponMinOrder] = useState(299);

  // Tracking AWB Assignment state
  const [editingOrderAwb, setEditingOrderAwb] = useState<string | null>(null);
  const [awbInput, setAwbInput] = useState('');
  const [courierInput, setCourierInput] = useState('Delhivery Express');

  // Analytics Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.totalAmount : 0), 0);
  const totalHardcopySales = orders.reduce((sum, o) => sum + o.items.filter(i => i.format === 'hardcopy' || i.format === 'combo').reduce((s, i) => s + i.quantity, 0), 0);
  const totalPdfDownloads = orders.reduce((sum, o) => sum + o.digitalLicenses.reduce((s, l) => s + l.downloadCount, 0), 0);
  const pendingShipments = orders.filter(o => o.orderStatus === 'processing' || o.orderStatus === 'dispatched').length;

  const handleCreateBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addNewBook({
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || 'Comprehensive Classroom Study Module with Solved PYQs',
      author: newAuthor.trim(),
      exam: newExam,
      subject: newSubject,
      pricePdf: Math.round(newPricePdf * 1.5),
      discountPricePdf: newPricePdf,
      priceHardcopy: Math.round(newPriceHardcopy * 1.4),
      discountPriceHardcopy: newPriceHardcopy,
      priceCombo: Math.round(newPriceCombo * 1.35),
      discountPriceCombo: newPriceCombo,
      stockQuantity: newStock,
      pages: 420,
      edition: '2026 First Edition',
      language: 'English & Hindi (Bilingual)',
      isbn: `978-81-${Math.floor(1000000 + Math.random() * 9000000)}`,
      weightGrams: 580,
      description: 'Official Classroom Reference text created by premier subject mentors with chapter-wise solved pyqs and visual flowcharts.',
      highlights: [
        'Aligned with latest 2025-26 official examination syllabus',
        'Chapter-wise Mindmaps & Trend Analysis',
        'Includes 10 Full-Length Practice Test Papers with Model Answers'
      ],
      tableOfContents: [
        { chapter: 1, title: 'Foundational Overview & Conceptual Framework', pageRange: 'pp. 1-45', isSampleAvailable: true },
        { chapter: 2, title: 'In-Depth Analytical Study & Case Laws', pageRange: 'pp. 46-120', isSampleAvailable: true },
        { chapter: 3, title: 'Previous 10 Years Question Bank with Model Answers', pageRange: 'pp. 121-280', isSampleAvailable: false }
      ],
      samplePages: [
        {
          pageNumber: 1,
          title: 'Chapter 1: Foundational Framework',
          content: 'This chapter provides structural clarity on fundamental core concepts demanded in the examination.'
        }
      ],
      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=700',
      pdfAssetUrl: '/assets/sample-book.pdf',
      rating: 4.9,
      reviewCount: 1,
      linkedBatches: ['IAS Foundation 2026', 'State PSC Masters 2025'],
      batchDiscountPercent: newBatchDiscount,
      isBestSeller: true
    });

    setShowAddBookModal(false);
    setNewTitle('');
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    addCoupon({
      code: newCouponCode.trim().toUpperCase(),
      discountPercent: newCouponType === 'percentage' ? newCouponDiscount : undefined,
      discountFlat: newCouponType === 'flat' ? newCouponDiscount : undefined,
      type: newCouponType,
      minOrderValue: newCouponMinOrder,
      isActive: true,
      description: `Special ${newCouponDiscount}% Discount for Exam Aspirants`,
      validTill: '2026-12-31'
    });
    setShowAddCouponModal(false);
    setNewCouponCode('');
  };

  const handleSaveAwb = (orderId: string) => {
    if (!awbInput.trim()) return;
    updateOrderStatus(orderId, 'in_transit', awbInput.trim(), courierInput.trim());
    setEditingOrderAwb(null);
    setAwbInput('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-slate-900 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-serif">
              Modi Classes • Coaching Admin Portal
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Catalog inventory, order fulfillment, Delhivery courier dispatch, student batch discounts, and anti-piracy oversight
          </p>
        </div>

        {/* Tab navigation buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'catalog', label: 'Book Catalog', icon: BookOpen },
            { id: 'orders', label: 'Orders & Dispatch', icon: Package },
            { id: 'students', label: 'Students & Batches', icon: GraduationCap },
            { id: 'coupons', label: 'Coupons', icon: Tag },
            { id: 'piracy', label: 'Anti-Piracy Logs', icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-700 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Total Gross Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-serif">₹{totalRevenue.toLocaleString('en-IN')}</div>
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                <span>+24.8% during batch admissions</span>
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Pending Courier Shipments</span>
                <Truck className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-serif">{pendingShipments} Orders</div>
              <p className="text-[11px] text-amber-700 font-semibold">
                Ready for Delhivery AWB pickup
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Hardcopy Books Dispatched</span>
                <Package className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-serif">{totalHardcopySales} Copies</div>
              <p className="text-[11px] text-indigo-700 font-semibold">
                Central Warehouse Mukherjee Nagar
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Dynamic Watermarked PDFs</span>
                <ShieldCheck className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-serif">{totalPdfDownloads} Generated</div>
              <p className="text-[11px] text-purple-700 font-semibold">
                Zero copyright leaks recorded
              </p>
            </div>

          </div>

          {/* Quick Fulfillment Action Board */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-serif">
                  Urgent Fulfillment Queue (Next Courier Dispatch)
                </h3>
                <p className="text-xs text-slate-500">Orders placed by aspirants awaiting courier tracking number</p>
              </div>

              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                View All {orders.length} Orders →
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {orders.filter(o => o.orderStatus === 'processing').slice(0, 3).map((ord) => (
                <div key={ord.id} className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{ord.orderNumber}</span>
                      <span className="text-slate-500">by {ord.customerName} ({ord.customerPhone})</span>
                    </div>
                    <p className="text-slate-600 mt-0.5">
                      {ord.items.map(i => `${i.quantity}x ${i.bookTitle} (${i.format.toUpperCase()})`).join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900">₹{ord.totalAmount}</span>
                    <button
                      onClick={() => {
                        setActiveTab('orders');
                        setEditingOrderAwb(ord.id);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer"
                    >
                      Assign Tracking AWB
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CATALOG MANAGEMENT */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-serif">
                Manage Books & Study Material Catalog ({books.length} Titles)
              </h3>
              <p className="text-xs text-slate-500">Update stock inventory, digital PDF pricing, and linked batch discounts</p>
            </div>

            <button
              onClick={() => setShowAddBookModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Publication Book</span>
            </button>
          </div>

          {/* Book Catalog Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Book Title & Exam</th>
                  <th className="py-3 px-3 text-center">PDF Price</th>
                  <th className="py-3 px-3 text-center">Hardcopy Price</th>
                  <th className="py-3 px-3 text-center">Stock</th>
                  <th className="py-3 px-3">Enrolled Batch Benefit</th>
                  <th className="py-3 px-4 text-right">Quick Stock Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {books.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={b.coverImage}
                          alt={b.title}
                          className="w-10 h-14 object-cover rounded-md border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 font-serif leading-snug">{b.title}</h4>
                          <p className="text-[11px] text-indigo-700 font-semibold">{b.exam} • {b.subject}</p>
                          <p className="text-[10px] text-slate-400">By {b.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-slate-900">
                      ₹{b.discountPricePdf}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-slate-900">
                      ₹{b.discountPriceHardcopy}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        b.stockQuantity < 30 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {b.stockQuantity} in stock
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                        {b.batchDiscountPercent}% Free PDF for {b.linkedBatches?.[0] || 'Enrolled Batch'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1 border border-slate-200 rounded-lg p-1">
                        <button
                          onClick={() => updateBookStock(b.id, Math.max(0, b.stockQuantity - 10))}
                          className="px-2 py-0.5 text-xs font-bold hover:bg-slate-100 rounded-sm cursor-pointer"
                        >
                          -10
                        </button>
                        <span className="px-1 font-bold text-slate-800">{b.stockQuantity}</span>
                        <button
                          onClick={() => updateBookStock(b.id, b.stockQuantity + 25)}
                          className="px-2 py-0.5 text-xs font-bold hover:bg-slate-100 rounded-sm cursor-pointer"
                        >
                          +25
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS & DISPATCH MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-serif">
                All Student Orders & Courier Pipeline ({orders.length})
              </h3>
              <p className="text-xs text-slate-500">Live order fulfillment and Delhivery tracking AWB issuance</p>
            </div>
          </div>

          <div className="space-y-4">
            {orders.map((ord) => (
              <div key={ord.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900 text-sm">{ord.orderNumber}</span>
                    <span className="text-slate-500">{ord.customerName} ({ord.customerEmail} • {ord.customerPhone})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-black text-indigo-700 text-sm">₹{ord.totalAmount}</span>
                    <select
                      value={ord.orderStatus}
                      onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                      className="px-2.5 py-1 rounded-lg border border-slate-300 font-bold text-xs bg-slate-50 text-slate-800"
                    >
                      <option value="processing">Processing</option>
                      <option value="dispatched">Dispatched</option>
                      <option value="in_transit">In Transit</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Items strip */}
                <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1 text-slate-700">
                  {ord.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{it.quantity}x {it.bookTitle} (<strong>{it.format.toUpperCase()}</strong>)</span>
                      <span className="font-bold">₹{it.totalPrice}</span>
                    </div>
                  ))}
                </div>

                {/* Shipping & AWB Assignment Row */}
                {ord.hasPhysicalItems && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs border-t border-slate-100">
                    <div className="text-slate-600">
                      Destination: {ord.shippingAddress?.line1}, {ord.shippingAddress?.city} - <strong>{ord.shippingAddress?.pincode}</strong>
                    </div>

                    {editingOrderAwb === ord.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={courierInput}
                          onChange={(e) => setCourierInput(e.target.value)}
                          placeholder="Courier Partner"
                          className="px-2 py-1 rounded-lg border border-slate-300 text-xs w-36"
                        />
                        <input
                          type="text"
                          value={awbInput}
                          onChange={(e) => setAwbInput(e.target.value)}
                          placeholder="Enter AWB Tracking #"
                          className="px-2 py-1 rounded-lg border border-slate-300 text-xs w-48"
                        />
                        <button
                          onClick={() => handleSaveAwb(ord.id)}
                          className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs cursor-pointer"
                        >
                          Save AWB
                        </button>
                        <button
                          onClick={() => setEditingOrderAwb(null)}
                          className="px-2 py-1 text-slate-500 hover:text-slate-800"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-mono">
                          {ord.courierPartner ? `${ord.courierPartner}: ${ord.trackingNumber}` : 'AWB Not Assigned'}
                        </span>
                        <button
                          onClick={() => {
                            setEditingOrderAwb(ord.id);
                            setAwbInput(ord.trackingNumber || '');
                          }}
                          className="text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                        >
                          {ord.trackingNumber ? 'Edit AWB' : '+ Assign AWB'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: STUDENTS & BATCHES */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-serif">
                Classroom Batches & Student Entitlements
              </h3>
              <p className="text-xs text-slate-500">Assign enrolled batches to automatically unlock 100% free digital PDFs</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Student Name & Email</th>
                  <th className="py-3 px-3">Roll Number</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Enrolled Batches</th>
                  <th className="py-3 px-4 text-right">Assign / Change Batch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-slate-500 text-[11px]">{u.email} • {u.phone}</div>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-indigo-700">
                      {u.studentRollNumber || '—'}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-[10px] uppercase bg-slate-100 px-2 py-0.5 rounded-sm">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {u.enrolledBatches.map((b) => (
                          <span key={b} className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                            {b}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <select
                        onChange={(e) => {
                          if (e.target.value) updateUserBatch(u.id, [e.target.value]);
                        }}
                        defaultValue={u.enrolledBatches[0] || ''}
                        className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-semibold bg-slate-50 text-slate-800"
                      >
                        <option value="IAS Foundation 2026">IAS Foundation 2026</option>
                        <option value="State PSC Masters 2025">State PSC Masters 2025</option>
                        <option value="SSC CGL Rankers">SSC CGL Rankers</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: COUPONS MANAGEMENT */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-serif">
                Promo Coupons & Exam Discounts ({coupons.length})
              </h3>
              <p className="text-xs text-slate-500">Configure batch coupons, festival offers, and minimum cart triggers</p>
            </div>

            <button
              onClick={() => setShowAddCouponModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Coupon Code</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((c) => (
              <div
                key={c.id}
                className={`p-5 rounded-2xl border transition-all ${
                  c.isActive ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-black text-sm text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
                    {c.code}
                  </span>
                  <button
                    onClick={() => toggleCouponStatus(c.id)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase cursor-pointer ${
                      c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {c.isActive ? 'Active' : 'Disabled'}
                  </button>
                </div>

                <p className="text-xs text-slate-700 font-semibold">{c.description}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Benefit: <strong>{c.type === 'percentage' ? `${c.discountPercent}% OFF` : `₹${c.discountFlat} FLAT OFF`}</strong>
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Min Order: ₹{c.minOrderValue} • Valid Till: {c.validTill}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: ANTI-PIRACY LOGS */}
      {activeTab === 'piracy' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-indigo-950 text-indigo-100 border border-indigo-800 space-y-2">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Dynamic Anti-Piracy Watermarking Security Audit Trail
            </h3>
            <p className="text-xs text-indigo-300">
              Modi Classes watermarking engine renders the student's name, verified mobile, IP address, and unique license hash diagonally across every page.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">License Identifier</th>
                  <th className="py-3 px-3">Student & Contact</th>
                  <th className="py-3 px-3">Material Title</th>
                  <th className="py-3 px-3">IP Address / Device</th>
                  <th className="py-3 px-4 text-right">Downloads Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.flatMap(o => o.digitalLicenses.map(lic => ({ ...lic, order: o }))).map((lic) => {
                  const book = books.find(b => b.id === lic.bookId);
                  return (
                    <tr key={lic.licenseKey} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                        {lic.licenseKey}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900">{lic.order.customerName}</div>
                        <div className="text-slate-500 text-[11px]">{lic.order.customerEmail}</div>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-800">
                        {book?.title || 'Study Material PDF'}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[11px] text-slate-600">
                        103.24.12.98 (Delhi / ACT Fibernet)
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {lic.downloadCount} / {lic.maxDownloads} Downloads
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE BOOK MODAL */}
      {showAddBookModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900">Add New Publication Book</h3>
              <button onClick={() => setShowAddBookModal(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBook} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Book Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. UPSC Indian Economy Core Concepts & Budget"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Exam Category</label>
                  <select
                    value={newExam}
                    onChange={(e) => setNewExam(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="UPSC CSE">UPSC CSE</option>
                    <option value="SSC CGL">SSC CGL</option>
                    <option value="NEET">NEET</option>
                    <option value="State PSC">State PSC</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">PDF Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newPricePdf}
                    onChange={(e) => setNewPricePdf(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hardcopy Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newPriceHardcopy}
                    onChange={(e) => setNewPriceHardcopy(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Combo Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newPriceCombo}
                    onChange={(e) => setNewPriceCombo(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Enrolled Batch Discount (%)</label>
                  <input
                    type="number"
                    required
                    value={newBatchDiscount}
                    onChange={(e) => setNewBatchDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddBookModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                >
                  Publish Book to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE COUPON MODAL */}
      {showAddCouponModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900">Create New Promo Coupon</h3>
              <button onClick={() => setShowAddCouponModal(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Coupon Code (UPPERCASE)</label>
                <input
                  type="text"
                  required
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. TOPPER50"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 uppercase font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={newCouponType}
                    onChange={(e) => setNewCouponType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={newCouponDiscount}
                    onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Minimum Cart Value (₹)</label>
                <input
                  type="number"
                  required
                  value={newCouponMinOrder}
                  onChange={(e) => setNewCouponMinOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddCouponModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                >
                  Activate Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
