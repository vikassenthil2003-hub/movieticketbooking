import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Building2, Calendar, QrCode, Ticket, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const TheatreDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get('/theatre/dashboard');
        const raw = res?.data !== undefined ? res.data : res;
        const dataObj = raw?.theatre ? raw : (raw?.data?.theatre ? raw.data : (raw?.data || raw));
        setData(dataObj);
      } catch (err) {
        setError(err.message || err.response?.data?.message || 'Failed to fetch theatre dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-accent-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-sm">
        {error}
      </div>
    );
  }

  const { theatre, shows, stats } = data || {};

  return (
    <div className="space-y-8">
      {/* Complex Header */}
      <div className="bg-navy-900/60 border border-navy-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-accent-secondary text-xs font-semibold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Assigned Complex</span>
          </div>
          <h1 className="text-2xl font-black text-white">{theatre?.name || 'CineVerse Theatre Complex'}</h1>
          <p className="text-xs text-navy-400 mt-1">
            {theatre?.addressLine}, {theatre?.city} ({theatre?.pincode})
          </p>
        </div>

        <Link
          to="/theatre/verify-ticket"
          className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-accent-secondary text-navy-950 font-bold text-xs shadow-lg shadow-accent-secondary/20 hover:bg-teal-400 transition"
        >
          <QrCode className="w-4 h-4" />
          <span>Launch Gate Ticket Scanner</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-navy-900/60 border border-navy-800 rounded-2xl p-5">
          <p className="text-xs text-navy-400">Total Shows Scheduled</p>
          <p className="text-2xl font-black text-white mt-1">{shows?.length || 0}</p>
        </div>
        <div className="bg-navy-900/60 border border-navy-800 rounded-2xl p-5">
          <p className="text-xs text-navy-400">Admitted / Checked-In</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">{stats?.verifiedTickets || 0}</p>
        </div>
        <div className="bg-navy-900/60 border border-navy-800 rounded-2xl p-5">
          <p className="text-xs text-navy-400">Active Screens</p>
          <p className="text-2xl font-black text-accent-secondary mt-1">{stats?.screenCount || 2}</p>
        </div>
      </div>

      {/* Shows List */}
      <div className="bg-navy-900/60 border border-navy-800 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-accent-primary" />
          Today's Scheduled Shows
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-navy-800 text-navy-400 font-semibold">
                <th className="pb-3 px-3">Movie</th>
                <th className="pb-3 px-3">Screen</th>
                <th className="pb-3 px-3">Showtime</th>
                <th className="pb-3 px-3">Format</th>
                <th className="pb-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60 text-navy-200">
              {(shows || []).map((s) => (
                <tr key={s._id} className="hover:bg-navy-800/30">
                  <td className="py-3 px-3 font-semibold text-white">
                    {s.movie?.title || 'Movie'}
                  </td>
                  <td className="py-3 px-3">{s.screen?.name || 'Screen 1'}</td>
                  <td className="py-3 px-3 font-mono text-accent-secondary">
                    {s.startTime} - {s.endTime}
                  </td>
                  <td className="py-3 px-3">{s.format} ({s.language})</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 uppercase">
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
              {(!shows || shows.length === 0) && (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-navy-500">
                    No shows scheduled for today.
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

export default TheatreDashboardPage;
