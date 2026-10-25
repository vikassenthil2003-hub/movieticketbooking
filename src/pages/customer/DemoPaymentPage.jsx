import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  QrCode,
  Wallet,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCcw,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DemoPaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [booking, setBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'wallet'
  const [upiId, setUpiId] = useState('demo.customer@okhdfcbank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null); // 'success' | 'failed'
  const [errorDetails, setErrorDetails] = useState('');

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await api.get(`/bookings/${bookingId}`);
        setBooking(res.data);
      } catch (err) {
        console.error('[Payment Booking Error]:', err);
        navigate('/');
      }
    };
    fetchBooking();
  }, [bookingId, navigate]);

  // Execute Simulated Payment
  const executePayment = async (outcome = 'success') => {
    if (isAdmin) {
      setErrorDetails('Admins are not allowed to book movie tickets. Please use a customer account.');
      return;
    }

    setIsProcessing(true);
    setErrorDetails('');

    try {
      const payload = {
        method: paymentMethod,
        simulatedOutcome: outcome,
        upiVpa: upiId,
        cardLast4: '4242',
        cardNetwork: 'Mastercard',
        walletProvider: 'CineVerse Pay',
      };

      const res = await api.post(`/payments/${bookingId}/simulate`, payload);

      setPaymentResult('success');
      // Briefly show success state, then redirect to Confirmed Digital Ticket
      setTimeout(() => {
        navigate(`/ticket/${res.data?.bookingReference || booking?.bookingReference}`);
      }, 1500);
    } catch (err) {
      setPaymentResult('failed');
      setErrorDetails(err.message || 'Simulated payment failed as requested.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full p-8 rounded-3xl glass-panel border border-amber-500/30 text-center space-y-5 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-display text-white">Payment Restricted</h2>
            <p className="text-sm text-slate-300 mt-2">
              Admins are not allowed to book movie tickets. Please use a customer account.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <Link
              to="/admin/dashboard"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-glow-violet transition-all"
            >
              Go to Admin Dashboard
            </Link>
            <Link
              to="/"
              className="w-full py-2.5 rounded-xl bg-cine-800 hover:bg-cine-700 text-slate-300 hover:text-white text-xs font-semibold transition-all"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Prominent Demo Sandbox Notice */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm flex items-center gap-3">
        <ShieldAlert className="w-6 h-6 flex-shrink-0 text-amber-400" />
        <div>
          <span className="font-extrabold uppercase tracking-wide">
            DEMO PAYMENT SANDBOX — NO REAL MONEY CHARGED
          </span>
          <p className="text-xs text-amber-200/80 mt-0.5">
            This checkout simulates a real bank transaction for evaluation purposes. No financial details are stored or charged.
          </p>
        </div>
      </div>

      {/* Main Payment Container */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-8 shadow-2xl">
        {/* Header & Total Amount */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
              Ref: {booking.bookingReference}
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-display text-white mt-0.5">
              Choose Payment Method
            </h2>
            <p className="text-xs text-slate-400">{booking.movieId?.title} • {booking.seats?.length} Seats</p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Amount Due</span>
            <div className="text-3xl font-black text-emerald-400">
              ₹{booking.pricingDetails?.totalAmount}
            </div>
          </div>
        </div>

        {/* Payment Tabs: UPI, Card, Wallet */}
        <div className="grid grid-cols-3 gap-2.5 p-1.5 rounded-2xl bg-cine-800 border border-white/10">
          <button
            onClick={() => {
              setPaymentMethod('upi');
              setPaymentResult(null);
            }}
            className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-2 rounded-xl text-xs font-bold transition-all ${
              paymentMethod === 'upi'
                ? 'bg-violet-600 text-white shadow-glow-violet'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>UPI Demo</span>
          </button>

          <button
            onClick={() => {
              setPaymentMethod('card');
              setPaymentResult(null);
            }}
            className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-2 rounded-xl text-xs font-bold transition-all ${
              paymentMethod === 'card'
                ? 'bg-violet-600 text-white shadow-glow-violet'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Card Demo</span>
          </button>

          <button
            onClick={() => {
              setPaymentMethod('wallet');
              setPaymentResult(null);
            }}
            className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-2 rounded-xl text-xs font-bold transition-all ${
              paymentMethod === 'wallet'
                ? 'bg-violet-600 text-white shadow-glow-violet'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Wallet Demo</span>
          </button>
        </div>

        {/* Tab Specific Content */}
        {paymentMethod === 'upi' && (
          <div className="p-6 rounded-2xl bg-cine-800/60 border border-white/5 space-y-4 text-center">
            <div className="w-44 h-44 mx-auto p-3 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center">
              {/* Simulated QR Pattern */}
              <div className="w-full h-full bg-slate-900 rounded-lg p-2 flex items-center justify-center text-white text-center">
                <div className="space-y-1">
                  <QrCode className="w-20 h-20 mx-auto text-teal-400" />
                  <span className="text-[10px] text-slate-300 font-mono">DEMO UPI QR</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Simulated scan for ₹{booking.pricingDetails?.totalAmount} or enter test VPA below:
            </p>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="max-w-sm mx-auto w-full px-4 py-2.5 rounded-xl glass-input text-xs text-center font-mono"
            />
          </div>
        )}

        {paymentMethod === 'card' && (
          <div className="p-6 rounded-2xl bg-cine-800/60 border border-white/5 space-y-4 max-w-md mx-auto">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Demo Card Number</label>
              <input
                type="text"
                disabled
                value="4242 •••• •••• 4242"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-mono tracking-wider opacity-90"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase">Expiry</label>
                <input
                  type="text"
                  disabled
                  value="12/28"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-mono opacity-90"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase">CVV</label>
                <input
                  type="text"
                  disabled
                  value="888"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-mono opacity-90"
                />
              </div>
            </div>
            <p className="text-[10px] text-teal-400 text-center">
              Pre-filled test card parameters (No real card required).
            </p>
          </div>
        )}

        {paymentMethod === 'wallet' && (
          <div className="p-6 rounded-2xl bg-cine-800/60 border border-white/5 space-y-3 text-center">
            <Wallet className="w-10 h-10 text-teal-400 mx-auto" />
            <h4 className="font-bold text-white text-base">CineVerse Instant Wallet</h4>
            <p className="text-xs text-slate-400">
              Demo sandbox balance available: <span className="text-emerald-400 font-bold">₹10,000.00</span>
            </p>
          </div>
        )}

        {/* Result Status Cards */}
        {paymentResult === 'success' && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            <div>
              <span className="font-bold">Simulated Payment Successful!</span> Generating digital ticket...
            </div>
          </div>
        )}

        {paymentResult === 'failed' && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <XCircle className="w-6 h-6 text-rose-400 flex-shrink-0" />
              <div>
                <span className="font-bold">Payment Simulation Failed</span>
                <p className="text-xs text-rose-200/80 mt-0.5">{errorDetails}</p>
              </div>
            </div>
            <button
              onClick={() => executePayment('success')}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Simulation Controls */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <div className="text-xs font-semibold text-slate-400 text-center uppercase tracking-wider mb-2">
            Simulate Gateway Action
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => executePayment('success')}
              disabled={isProcessing}
              className="py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isProcessing ? 'Processing...' : 'Simulate Success (Pay ₹' + booking.pricingDetails?.totalAmount + ')'}</span>
            </button>

            <button
              onClick={() => executePayment('failure')}
              disabled={isProcessing}
              className="py-3.5 px-6 rounded-xl bg-rose-600/30 hover:bg-rose-600/40 border border-rose-500/40 text-rose-300 font-bold text-sm flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all"
            >
              <XCircle className="w-4 h-4" />
              <span>Simulate Payment Failure</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoPaymentPage;
