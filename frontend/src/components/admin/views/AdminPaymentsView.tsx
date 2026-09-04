import React, { useState, useEffect } from 'react';
import { AdminPaymentRecord } from '../adminTypes';
import { getApiUrl } from '../../../services/api';
import { 
  CreditCard, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RotateCcw, 
  IndianRupee, 
  RefreshCw,
  ArrowUpRight
} from 'lucide-react';

export const AdminPaymentsView: React.FC = () => {
  const [payments, setPayments] = useState<AdminPaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPayments = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('modi_admin_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const params = new URLSearchParams();
      if (selectedFilter !== 'all') params.append('status', selectedFilter);

      const res = await fetch(getApiUrl(`/api/admin/payments?${params.toString()}`), {
        headers,
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [selectedFilter]);

  const filteredPayments = payments.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.paymentTransactionId?.toLowerCase().includes(q) ||
      p.orderNumber?.toLowerCase().includes(q) ||
      p.customerName?.toLowerCase().includes(q) ||
      p.customerEmail?.toLowerCase().includes(q)
    );
  });

  const totalSettledRevenue = payments
    .filter((p) => p.paymentStatus === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const filters = [
    { id: 'all', label: 'All Transactions' },
    { id: 'paid', label: 'Paid & Settled' },
    { id: 'pending', label: 'Pending / COD' },
    { id: 'failed', label: 'Failed' },
    { id: 'refunded', label: 'Refunded' }
  ];

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      {/* Top Banner with Total Settled Revenue */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Settled Revenue (Database Confirmed)
          </span>
          <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
            ₹{totalSettledRevenue.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Aggregated from authentic paid single-book purchases. Excludes pending, failed, or cancelled attempts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchPayments}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title="Refresh Transactions"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            id="admin-payment-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Transaction ID, Order #, or Customer..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === f.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <span className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
            <p>Loading ledger payments...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No payments found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase text-[10px] tracking-wider text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Transaction ID</th>
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium font-mono text-[11px]">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                      {p.paymentTransactionId || 'TXN-PENDING'}
                    </td>
                    <td className="py-3.5 px-4 text-blue-400 font-bold whitespace-nowrap">
                      {p.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <div className="font-bold text-slate-200">{p.customerName}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[160px] font-mono">{p.customerEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 uppercase text-slate-300 font-bold whitespace-nowrap">
                      {p.paymentMethod}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                      ₹{p.amount}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-sans">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        p.paymentStatus === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : p.paymentStatus === 'pending'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(p.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
