import React, { useState } from 'react';
import api from '../../services/api';
import {
  QrCode,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Ticket,
  Clock,
  Film,
  User,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

const TicketScannerPage = () => {
  const [inputCode, setInputCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [recentScans, setRecentScans] = useState([]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    setLoading(true);
    setVerificationResult(null);

    try {
      // The code could be a JSON QR payload or a raw bookingReference string
      let bookingReference = inputCode.trim();
      let verificationSecret = '';

      try {
        const parsed = JSON.parse(inputCode);
        if (parsed.bookingReference || parsed.ref) {
          bookingReference = parsed.bookingReference || parsed.ref;
          verificationSecret = parsed.verificationSecret || parsed.tok || parsed.ticketToken || '';
        }
      } catch (ignored) {
        // Raw string format
      }

      const res = await api.post('/tickets/verify', {
        bookingReference,
        ticketToken: verificationSecret,
        verificationSecret,
      });

      const outcomeData = res?.data?.data || res?.data || res;

      const outcome = {
        success: true,
        data: outcomeData,
        timestamp: new Date().toLocaleTimeString(),
      };

      setVerificationResult(outcome);
      setRecentScans((prev) => [outcome, ...prev.slice(0, 9)]);
      setInputCode('');
    } catch (err) {
      const outcome = {
        success: false,
        error: err.message || err.response?.data?.message || 'Verification failed. Invalid ticket.',
        data: err.response?.data?.data || err.data || null,
        timestamp: new Date().toLocaleTimeString(),
      };
      setVerificationResult(outcome);
      setRecentScans((prev) => [outcome, ...prev.slice(0, 9)]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-accent-secondary text-xs font-semibold uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Access Control Gate</span>
        </div>
        <h1 className="text-2xl font-black text-white">Digital QR Ticket Gate Verification</h1>
        <p className="text-xs text-navy-400 mt-1">
          Scan QR barcode or enter booking reference to authenticate ticket admission and prevent duplicate entries
        </p>
      </div>

      {/* Input Verification Form */}
      <div className="bg-navy-900/60 border border-navy-800 rounded-2xl p-6 backdrop-blur-md">
        <form onSubmit={handleVerify} className="space-y-4">
          <label className="block text-xs font-semibold text-navy-200">
            Booking Reference or QR Token
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <QrCode className="absolute left-3.5 top-3 w-5 h-5 text-accent-secondary" />
              <input
                type="text"
                required
                placeholder="Scan QR or paste CVB-XXXXX reference..."
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="w-full bg-navy-950/80 border border-navy-800 rounded-xl pl-11 pr-4 py-2.5 text-sm font-mono text-white placeholder-navy-500 focus:outline-none focus:border-accent-primary"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-accent-secondary hover:bg-teal-400 text-navy-950 font-bold text-xs shadow-md transition disabled:opacity-50 shrink-0"
            >
              {loading ? 'Verifying...' : 'Verify Ticket Admission'}
            </button>
          </div>
          <p className="text-[11px] text-navy-500">
            Supports raw string references (e.g., CVB-12345678) or full encrypted JSON QR tokens.
          </p>
        </form>
      </div>

      {/* Active Verification Result Card */}
      {verificationResult && (
        <div
          className={`rounded-2xl p-6 border transition-all ${
            verificationResult.success
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              : verificationResult.error?.includes('Already used') || verificationResult.error?.includes('already')
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
              : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="shrink-0 mt-0.5">
              {verificationResult.success ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              ) : verificationResult.error?.includes('Already') ? (
                <AlertTriangle className="w-8 h-8 text-amber-400" />
              ) : (
                <XCircle className="w-8 h-8 text-rose-400" />
              )}
            </div>

            <div className="space-y-3 flex-1">
              <div>
                <h2 className="text-lg font-black tracking-wide">
                  {verificationResult.success
                    ? 'ADMISSION GRANTED — VALID TICKET'
                    : verificationResult.error?.includes('Already')
                    ? 'DUPLICATE ENTRY BLOCKED — TICKET ALREADY USED'
                    : 'ENTRY DENIED — INVALID / CANCELLED TICKET'}
                </h2>
                <p className="text-xs mt-0.5">
                  {verificationResult.success
                    ? 'Ticket verified in database. Customer admission recorded.'
                    : verificationResult.error}
                </p>
              </div>

              {verificationResult.data && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-navy-950/70 p-3.5 rounded-xl border border-navy-800 text-xs">
                  <div>
                    <span className="text-navy-400 block text-[10px]">Reference</span>
                    <strong className="text-white font-mono">{verificationResult.data.bookingReference}</strong>
                  </div>
                  <div>
                    <span className="text-navy-400 block text-[10px]">Movie</span>
                    <strong className="text-white">{verificationResult.data.movieTitle || 'Movie'}</strong>
                  </div>
                  <div>
                    <span className="text-navy-400 block text-[10px]">Seats</span>
                    <strong className="text-accent-secondary font-bold">
                      {(verificationResult.data.seats || []).join(', ')}
                    </strong>
                  </div>
                  <div>
                    <span className="text-navy-400 block text-[10px]">Screen / Time</span>
                    <strong className="text-white">
                      {verificationResult.data.screenName} ({verificationResult.data.startTime})
                    </strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Scans Session Log */}
      <div className="bg-navy-900/60 border border-navy-800 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-accent-secondary" />
          Recent Gate Admissions Log
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-navy-800 text-navy-400 font-semibold">
                <th className="pb-3 px-3">Time</th>
                <th className="pb-3 px-3">Reference</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Seats</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60 text-navy-200">
              {recentScans.map((scan, i) => (
                <tr key={i} className="hover:bg-navy-800/20">
                  <td className="py-2.5 px-3 font-mono text-navy-400">{scan.timestamp}</td>
                  <td className="py-2.5 px-3 font-mono text-white">
                    {scan.data?.bookingReference || 'Unknown'}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        scan.success
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {scan.success ? 'ADMITTED' : 'DENIED'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-accent-secondary">
                    {(scan.data?.seats || []).join(', ') || '-'}
                  </td>
                </tr>
              ))}
              {recentScans.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-6 text-center text-navy-500">
                    No scans performed this session.
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

export default TicketScannerPage;
