import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../../../services/api';
import { AdminDashboardData } from '../adminTypes';
import { Order } from '../../../types';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  IndianRupee, 
  Users, 
  BookOpen, 
  AlertCircle, 
  Truck,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  Eye,
  Calendar
} from 'lucide-react';

interface AdminDashboardViewProps {
  onSelectOrder: (order: Order) => void;
  onNavigateToOrders: () => void;
  onNavigateToBook: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ 
  onSelectOrder, 
  onNavigateToOrders,
  onNavigateToBook
}) => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('modi_admin_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(getApiUrl('/api/admin/dashboard'), {
        headers,
        credentials: 'include'
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error('Failed to load dashboard:', err);
      setError(err.message || 'Failed to fetch dashboard metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-800/60 rounded-2xl border border-slate-800" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-slate-800/60 rounded-2xl border border-slate-800" />
          <div className="h-72 bg-slate-800/60 rounded-2xl border border-slate-800" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-base font-bold text-white">Could not load dashboard data</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">{error || 'Unknown error occurred.'}</p>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 cursor-pointer transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const { metrics, recentOrders, statusCounts, paymentCounts } = data;

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${metrics.totalRevenue.toLocaleString('en-IN')}`,
      subtitle: 'From paid customer orders',
      icon: IndianRupee,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      title: 'Total Orders',
      value: metrics.totalOrders,
      subtitle: 'All customer transactions',
      icon: ShoppingBag,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      title: 'Books Sold',
      value: metrics.booksSold,
      subtitle: 'Physical master books dispatched',
      icon: BookOpen,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20'
    },
    {
      title: 'Total Customers',
      value: metrics.totalCustomers,
      subtitle: 'Registered exam aspirants',
      icon: Users,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20'
    },
    {
      title: 'Orders in Delivery',
      value: metrics.ordersInDelivery,
      subtitle: 'In transit / Out for delivery',
      icon: Truck,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10 border-sky-500/20'
    },
    {
      title: 'Completed Orders',
      value: metrics.completedOrders,
      subtitle: 'Successfully delivered',
      icon: CheckCircle2,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10 border-teal-500/20'
    },
    {
      title: 'Pending Fulfillment',
      value: metrics.pendingOrders,
      subtitle: 'Requires packing / courier handover',
      icon: Clock,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10 border-yellow-500/20'
    },
    {
      title: 'Pending Payments',
      value: metrics.pendingPayments,
      subtitle: 'COD / Pending verification',
      icon: AlertCircle,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Action & Single-Book Notification Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/70 border border-blue-900/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
              Single-Book Business Model Active
            </span>
          </div>
          <h2 className="text-sm sm:text-base font-bold text-white mt-1">
            Railway Psychological / Aptitude Test for Asst. Loco Pilot (CBAT 2026)
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchDashboard}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title="Refresh metrics from database"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onNavigateToBook}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Manage Book & Price</span>
          </button>
        </div>
      </div>

      {/* 8 Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="p-3 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
                  {card.title}
                </span>
                <div className={`p-1.5 sm:p-2 rounded-xl border shrink-0 ${card.bg}`}>
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${card.color}`} />
                </div>
              </div>
              <div className="mt-2 sm:mt-4">
                <div className="text-lg sm:text-2xl lg:text-3xl font-black text-white font-mono truncate">
                  {card.value}
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 sm:mt-1 font-medium truncate">
                  {card.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts & Status Breakdowns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Order Status Distribution */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Order Status Overview</h3>
            <span className="text-[10px] text-slate-400 font-mono">Total: {metrics.totalOrders}</span>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { label: 'Delivered', count: statusCounts.delivered || 0, color: 'bg-emerald-500' },
              { label: 'Shipped / In Transit', count: statusCounts.shipped || 0, color: 'bg-sky-500' },
              { label: 'Processing', count: statusCounts.processing || 0, color: 'bg-indigo-500' },
              { label: 'Pending', count: statusCounts.pending || 0, color: 'bg-yellow-500' },
              { label: 'Cancelled', count: statusCounts.cancelled || 0, color: 'bg-rose-500' }
            ].map((st, i) => {
              const pct = metrics.totalOrders > 0 ? Math.round((st.count / metrics.totalOrders) * 100) : 0;
              return (
                <div key={i} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-300">{st.label}</span>
                    <span className="font-mono text-slate-400">{st.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${st.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Health Overview */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Payment Health Overview</h3>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="space-y-3 pt-2">
            {[
              { label: 'Paid & Settled', count: paymentCounts?.paid || 0, color: 'bg-emerald-500' },
              { label: 'Pending / COD Unpaid', count: paymentCounts?.pending || 0, color: 'bg-amber-500' },
              { label: 'Failed Transactions', count: paymentCounts?.failed || 0, color: 'bg-rose-500' },
              { label: 'Refunded Orders', count: paymentCounts?.refunded || 0, color: 'bg-purple-500' }
            ].map((p, i) => {
              const pct = metrics.totalOrders > 0 ? Math.round((p.count / metrics.totalOrders) * 100) : 0;
              return (
                <div key={i} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-300">{p.label}</span>
                    <span className="font-mono text-slate-400">{p.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${p.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400">
            <span className="text-emerald-400 font-bold">Revenue Rule:</span> Cancelled, failed, and unpaid transactions are strictly excluded from gross revenue.
          </div>
        </div>

        {/* Rapid Actions */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Quick Administration Actions</h3>
            <p className="text-xs text-slate-400 mt-1">Frequently accessed dispatch and fulfillment shortcuts.</p>
          </div>

          <div className="space-y-2">
            <button
              onClick={onNavigateToOrders}
              className="w-full p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left flex items-center justify-between text-xs font-bold text-white transition-all cursor-pointer"
            >
              <span>View & Dispatch Pending Orders</span>
              <ArrowUpRight className="w-4 h-4 text-blue-400" />
            </button>

            <button
              onClick={onNavigateToBook}
              className="w-full p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left flex items-center justify-between text-xs font-bold text-white transition-all cursor-pointer"
            >
              <span>Update Book Price / Inventory Stock</span>
              <ArrowUpRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>

          <div className="p-3 bg-blue-950/40 border border-blue-900/40 rounded-xl text-[11px] text-blue-300">
            Current Single-Book Price: <strong className="text-white">Authoritative database price sync active.</strong>
          </div>
        </div>

      </div>

      {/* Recent Orders Section */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Recent Customer Orders</h3>
            <p className="text-xs text-slate-400">Latest customer purchases across India</p>
          </div>

          <button
            onClick={onNavigateToOrders}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View All Orders</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No orders found in database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 uppercase text-[10px] tracking-wider text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Qty</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4">Order Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-200">{ord.customerName}</div>
                      <div className="text-[10px] text-slate-500">{ord.customerPhone}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">
                      {ord.itemsCount || 1}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      ₹{ord.totalAmount}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        ord.paymentStatus === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : ord.paymentStatus === 'pending'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        ord.orderStatus === 'delivered'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : ord.orderStatus === 'shipped' || ord.orderStatus === 'in_transit'
                          ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                          : ord.orderStatus === 'cancelled'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectOrder(ord)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold text-slate-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
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
