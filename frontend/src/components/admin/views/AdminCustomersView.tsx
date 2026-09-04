import React, { useState, useEffect } from 'react';
import { AdminCustomerSummary } from '../adminTypes';
import { Order } from '../../../types';
import { getApiUrl } from '../../../services/api';
import { 
  Search, 
  Users, 
  ShoppingBag, 
  IndianRupee, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Eye, 
  X, 
  Clock, 
  CheckCircle2, 
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export const AdminCustomersView: React.FC = () => {
  const [customers, setCustomers] = useState<AdminCustomerSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerDetail, setCustomerDetail] = useState<{ customer: any; orders: Order[] } | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const fetchCustomers = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('modi_admin_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const url = searchQuery.trim() 
        ? getApiUrl(`/api/admin/customers?search=${encodeURIComponent(searchQuery.trim())}`)
        : getApiUrl('/api/admin/customers');

      const res = await fetch(url, { headers, credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleViewCustomer = async (id: string) => {
    setSelectedCustomerId(id);
    setIsLoadingDetail(true);
    const token = localStorage.getItem('modi_admin_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(getApiUrl(`/api/admin/customers/${id}`), { headers, credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        setCustomerDetail(json);
      }
    } catch (err) {
      console.error('Error loading customer details:', err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedCustomerId(null);
    setCustomerDetail(null);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            id="admin-customer-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customers by Name, Email, or Phone..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCustomers}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title="Refresh Customers"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className="text-xs font-mono font-bold text-slate-400 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
            Registered Customers: <span className="text-white">{customers.length}</span>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <span className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
            <p>Loading registered exam students...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No customers found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase text-[10px] tracking-wider text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Customer Name</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4 text-center">Orders Placed</th>
                  <th className="py-3.5 px-4">Total Spent</th>
                  <th className="py-3.5 px-4">Last Order</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-[10px]">
                          {c.name.charAt(0)}
                        </div>
                        <span>{c.name}</span>
                      </div>
                      {c.studentRollNumber && (
                        <div className="text-[10px] font-mono text-amber-400/90 pl-8">
                          Roll: {c.studentRollNumber}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-300 truncate max-w-[200px]">{c.email}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{c.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-white">
                      {c.ordersCount}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-emerald-400">
                      ₹{c.totalSpent.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {c.lastOrderDate ? (
                        new Date(c.lastOrderDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })
                      ) : (
                        <span className="text-slate-600">No orders yet</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        ● Active Student
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleViewCustomer(c.id)}
                        className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Profile</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Details Drawer / Modal */}
      {selectedCustomerId && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
            
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                  {customerDetail?.customer?.name?.charAt(0) || 'C'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {customerDetail?.customer?.name || 'Customer Details'}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    ID: {selectedCustomerId} • Role: Customer
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseDetail}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {isLoadingDetail || !customerDetail ? (
                <div className="py-12 text-center text-slate-500">
                  <span className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
                  <p>Fetching customer records...</p>
                </div>
              ) : (
                <>
                  {/* Contact Details Card */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                      <h4 className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                        Communication Details
                      </h4>
                      <p className="text-white font-bold text-sm">{customerDetail.customer.name}</p>
                      <p className="flex items-center gap-2 text-slate-300">
                        <Mail className="w-3.5 h-3.5 text-slate-500" /> {customerDetail.customer.email}
                      </p>
                      <p className="flex items-center gap-2 font-mono text-slate-300">
                        <Phone className="w-3.5 h-3.5 text-slate-500" /> {customerDetail.customer.phone}
                      </p>
                      {customerDetail.customer.studentRollNumber && (
                        <p className="font-mono text-amber-400 pt-1">
                          Roll: {customerDetail.customer.studentRollNumber}
                        </p>
                      )}
                    </div>

                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                      <h4 className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                        Account Lifetime Summary
                      </h4>
                      <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                        <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-500 block">Total Orders</span>
                          <span className="text-base font-bold text-white">{customerDetail.orders.length}</span>
                        </div>
                        <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-500 block">Total Paid</span>
                          <span className="text-base font-bold text-emerald-400">
                            ₹{customerDetail.orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.totalAmount, 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Saved Addresses */}
                  {customerDetail.customer.savedAddresses && customerDetail.customer.savedAddresses.length > 0 && (
                    <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl space-y-3">
                      <h4 className="font-bold text-slate-400 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-400" />
                        <span>Saved Delivery Addresses</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {customerDetail.customer.savedAddresses.map((addr: any, idx: number) => (
                          <div key={idx} className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-300 space-y-1">
                            <span className="px-2 py-0.5 bg-slate-800 rounded text-[9px] font-bold uppercase text-slate-400">
                              {addr.addressType || 'Home'}
                            </span>
                            <p className="font-bold text-white mt-1">{addr.fullName}</p>
                            <p>{addr.line1 || addr.street}</p>
                            <p>{addr.city}, {addr.state} - <strong className="font-mono text-white">{addr.pincode}</strong></p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order History */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                      <span>Complete Order History ({customerDetail.orders.length})</span>
                    </h4>

                    {customerDetail.orders.length === 0 ? (
                      <p className="text-slate-500 text-xs py-4 text-center">No past orders placed by this student.</p>
                    ) : (
                      <div className="space-y-2">
                        {customerDetail.orders.map((ord) => (
                          <div
                            key={ord.id}
                            className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between gap-4 font-mono text-xs"
                          >
                            <div>
                              <p className="font-bold text-white">{ord.orderNumber}</p>
                              <p className="text-[10px] text-slate-500">
                                {new Date(ord.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-white">₹{ord.totalAmount}</p>
                              <span className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                ord.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                              }`}>
                                {ord.paymentStatus}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
              <button
                onClick={handleCloseDetail}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close Customer Profile
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
