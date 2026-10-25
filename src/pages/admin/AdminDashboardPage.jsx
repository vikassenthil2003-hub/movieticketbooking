import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Film,
  Ticket,
  DollarSign,
  Users,
  Building2,
  Calendar,
  TrendingUp,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const AdminDashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchAnalytics = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');
    try {
      const res = await api.get('/admin/analytics');
      // Safely unpack both unwrapped (via axios interceptor) and wrapped responses
      const raw = res?.data !== undefined ? res.data : res;
      const data = raw?.overview ? raw : (raw?.data?.overview ? raw.data : (raw?.data || raw));
      setAnalytics(data);
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-navy-400 font-medium">Loading CineVerse Analytics & Statistics...</p>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="p-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />
          <div>
            <p className="font-semibold text-rose-200">Unable to load admin dashboard analytics</p>
            <p className="text-xs text-rose-300/80 mt-0.5">{error}</p>
          </div>
        </div>
        <button
          onClick={() => fetchAnalytics(false)}
          className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-100 rounded-xl text-xs font-semibold transition shrink-0"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { overview, topMovies, recentBookings, statusBreakdown } = analytics || {};

  const statCards = [
    { label: 'Total Bookings', value: overview?.totalBookings || 0, icon: Ticket, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Demo Volume', value: `₹${(overview?.demoRevenue || 0).toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10', sub: 'Simulated Demo' },
    { label: 'Active Movies', value: overview?.totalMovies || 0, icon: Film, color: 'text-accent-primary', bg: 'bg-accent-primary/10' },
    { label: 'Partner Theatres', value: overview?.totalTheatres || 0, icon: Building2, color: 'text-teal-400', bg: 'bg-teal-500/10' },
    { label: 'Registered Users', value: overview?.totalUsers || 0, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Active Shows', value: overview?.totalShows || 0, icon: Calendar, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  const pieColors = ['#8b5cf6', '#14b8a6', '#f59e0b', '#ef4444'];
  const pieData = (statusBreakdown || []).map((s) => ({
    name: s._id ? s._id.charAt(0).toUpperCase() + s._id.slice(1) : 'Unknown',
    value: s.count,
  }));

  const barData = (topMovies || []).map((m) => ({
    name: m.movieTitle ? (m.movieTitle.length > 14 ? m.movieTitle.slice(0, 14) + '...' : m.movieTitle) : 'Movie',
    bookings: m.bookingsCount,
  }));

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">System Analytics & Overview</h1>
          <p className="text-xs text-navy-400 mt-0.5">Real-time aggregate data computed directly from MongoDB</p>
        </div>
        <button
          onClick={() => fetchAnalytics(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-xs font-semibold text-white border border-navy-700 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-accent-secondary ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="bg-navy-900/60 border border-navy-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-medium text-navy-400">{c.label}</span>
                <div className={`w-8 h-8 rounded-xl ${c.bg} flex items-center justify-center ${c.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-bold text-white">{c.value}</div>
              {c.sub && <span className="text-[10px] text-amber-400/80 font-mono">{c.sub}</span>}
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Movies Bar Chart */}
        <div className="lg:col-span-2 bg-navy-900/60 border border-navy-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent-primary" />
              Most Booked Movies
            </h2>
            <span className="text-[11px] text-navy-400">By tickets issued</span>
          </div>

          <div className="h-64">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="bookings" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-navy-500">
                No booking records yet.
              </div>
            )}
          </div>
        </div>

        {/* Status Breakdown Pie */}
        <div className="bg-navy-900/60 border border-navy-800 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
            <Ticket className="w-4 h-4 text-accent-secondary" />
            Booking Status Distribution
          </h2>

          <div className="h-64">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-navy-500">
                No status data available.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-navy-900/60 border border-navy-800 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Ticket className="w-4 h-4 text-accent-primary" />
          Recent Booking Transactions
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-navy-800 text-navy-400 font-semibold">
                <th className="pb-3 px-3">Reference</th>
                <th className="pb-3 px-3">Customer</th>
                <th className="pb-3 px-3">Movie</th>
                <th className="pb-3 px-3">Seats</th>
                <th className="pb-3 px-3">Amount</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60 text-navy-200">
              {(recentBookings || []).map((b) => (
                <tr key={b._id} className="hover:bg-navy-800/30">
                  <td className="py-3 px-3 font-mono font-bold text-accent-secondary">
                    {b.bookingReference || b._id.slice(-8)}
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-medium text-white">{b.user?.name || 'Customer'}</p>
                    <p className="text-[10px] text-navy-500">{b.user?.email}</p>
                  </td>
                  <td className="py-3 px-3 text-white font-medium">
                    {b.show?.movie?.title || 'Movie'}
                  </td>
                  <td className="py-3 px-3">
                    {(b.seats || []).map((s) => s.seatNumber).join(', ')}
                  </td>
                  <td className="py-3 px-3 font-semibold text-emerald-400">
                    ₹{b.pricing?.finalPayable || 0}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        b.status === 'confirmed'
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                          : b.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-navy-400">
                    {new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
              {(!recentBookings || recentBookings.length === 0) && (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-navy-500">
                    No transactions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
