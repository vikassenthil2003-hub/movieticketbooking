import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Ticket,
  MapPin,
  Clock,
  Tag,
  Award,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  ShoppingBag,
  Utensils,
  Edit3,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CheckoutPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [booking, setBooking] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await api.get(`/bookings/${bookingId}`);
        setBooking(res.data);
      } catch (err) {
        console.error('[Checkout Booking Error]:', err);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId, navigate]);

  // Apply Coupon
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponError('');

    try {
      const res = await api.post('/coupons/validate', {
        code: couponCode.trim(),
        amount: booking?.pricingDetails?.subtotal,
      });
      setAppliedCoupon(res.data);
    } catch (err) {
      setCouponError(err.message || 'Invalid promo code');
      setAppliedCoupon(null);
    }
  };

  // Recalculate Final Bill with Snacks
  const snacks = booking?.snacks || [];
  const ticketsSubtotal =
    booking?.pricingDetails?.ticketsSubtotal ??
    (booking?.seats?.reduce((sum, s) => sum + (s.price || 0), 0) || 0);
  const snacksSubtotal =
    booking?.pricingDetails?.snacksSubtotal ??
    (snacks.reduce((sum, item) => sum + (item.totalPrice || item.unitPrice * item.quantity), 0) || 0);
  const subtotal = booking?.pricingDetails?.subtotal || ticketsSubtotal + snacksSubtotal;
  const convenienceFee = booking?.pricingDetails?.convenienceFee || 0;
  const tax = booking?.pricingDetails?.tax || 0;
  const couponDiscount = appliedCoupon?.discount || 0;
  const maxPointsAllowed = Math.min(user?.rewardPoints || 0, Math.floor(subtotal * 0.4));
  const pointsDiscount = Math.min(redeemPoints, maxPointsAllowed);

  const totalDiscount = couponDiscount + pointsDiscount;
  const finalPayable = Math.max(1, subtotal + convenienceFee + tax - totalDiscount);

  if (isLoading || !booking) {
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
            <h2 className="text-2xl font-bold font-display text-white">Checkout Restricted</h2>
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-black font-display text-white">Booking Summary</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review your movie seats, snacks and order details before simulated demo checkout
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Movie & Ticket Card */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-6 shadow-xl">
            {/* Movie Info */}
            <div className="flex gap-4 items-start">
              <img
                src={booking.movieId?.posterUrl}
                alt={booking.movieId?.title}
                className="w-24 sm:w-28 aspect-[2/3] object-cover rounded-xl shadow-lg border border-white/10 flex-shrink-0"
              />

              <div className="space-y-1.5 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                  {booking.showId?.format} • {booking.showId?.language}
                </span>
                <h3 className="text-xl font-bold font-display text-white">{booking.movieId?.title}</h3>
                <p className="text-xs text-slate-400">{booking.theatreId?.name}</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-300 pt-1">
                  <Clock className="w-3.5 h-3.5 text-violet-400" />
                  <span>
                    {booking.showId?.date} at {booking.showId?.startTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Selected Seats Details */}
            <div className="p-4 rounded-2xl bg-cine-800/80 border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
                <span>Reserved Seats ({booking.seats?.length})</span>
                <span>{booking.screenId?.name}</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {booking.seats?.map((seat) => (
                  <span
                    key={seat.seatNumber}
                    className="px-3 py-1.5 rounded-lg bg-cine-700/80 border border-white/10 text-white font-mono font-bold text-xs"
                  >
                    {seat.seatNumber} ({seat.category})
                  </span>
                ))}
              </div>
            </div>

            {/* Food & Concessions Section */}
            <div className="p-4 rounded-2xl bg-cine-800/80 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <span>Food & Concessions ({snacks.length > 0 ? snacks.reduce((sum, i) => sum + i.quantity, 0) : 0} items)</span>
                </div>
                <Link
                  to={`/booking/${bookingId}/snacks`}
                  className="text-xs text-violet-400 hover:text-violet-300 font-bold flex items-center gap-1 hover:underline"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{snacks.length > 0 ? 'Edit Snacks' : 'Add Snacks'}</span>
                </Link>
              </div>

              {snacks.length > 0 ? (
                <div className="space-y-2 pt-1">
                  {snacks.map((item, idx) => (
                    <div
                      key={item.snackId || idx}
                      className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-cine-900/60 border border-white/5"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-300 flex items-center justify-center text-xs">
                          🍿
                        </span>
                        <div>
                          <span className="font-semibold text-white">{item.name}</span>
                          <span className="text-[10px] text-slate-400 ml-1.5">
                            ({item.variant}) × {item.quantity}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-emerald-400">
                        ₹{item.totalPrice || item.unitPrice * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-cine-900/40 border border-dashed border-white/10 flex items-center justify-between text-xs">
                  <span className="text-slate-400">No snacks selected for this movie.</span>
                  <Link
                    to={`/booking/${bookingId}/snacks`}
                    className="text-violet-400 hover:underline font-bold"
                  >
                    Grab Popcorn & Drinks →
                  </Link>
                </div>
              )}
            </div>

            {/* Promo Coupon Section */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Tag className="w-4 h-4 text-violet-400" />
                <span>Apply Promo Coupon</span>
              </div>

              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Try CINEVERSE50 or WEEKEND100"
                  className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs font-mono font-bold uppercase"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-glow-violet transition-all"
                >
                  Apply
                </button>
              </form>

              {appliedCoupon && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    Coupon '{appliedCoupon.code}' applied: ₹{appliedCoupon.discount} OFF!
                  </span>
                  <button
                    onClick={() => {
                      setAppliedCoupon(null);
                      setCouponCode('');
                    }}
                    className="text-xs text-emerald-400 hover:underline font-bold"
                  >
                    Remove
                  </button>
                </div>
              )}

              {couponError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>{couponError}</span>
                </div>
              )}
            </div>

            {/* Reward Points Section */}
            {user && (user.rewardPoints || 0) > 0 && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <Award className="w-4 h-4" />
                    <span>Redeem Reward Points</span>
                  </div>
                  <span className="text-xs font-bold text-slate-300">
                    Available: {user.rewardPoints} pts
                  </span>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="range"
                    min="0"
                    max={maxPointsAllowed}
                    step="10"
                    value={redeemPoints}
                    onChange={(e) => setRedeemPoints(Number(e.target.value))}
                    className="flex-1 accent-amber-500"
                  />
                  <span className="text-xs font-mono font-bold text-amber-300 min-w-[50px] text-right">
                    -₹{pointsDiscount}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  1 Point = ₹1 Discount (Max 40% of subtotal can be redeemed)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Itemized Bill & Checkout Action */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-5 shadow-xl">
            <h3 className="font-bold text-base text-white font-display pb-3 border-b border-white/10">
              Payment Breakdown
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Tickets Subtotal</span>
                <span>₹{ticketsSubtotal}</span>
              </div>
              {snacksSubtotal > 0 && (
                <div className="flex justify-between text-amber-300 font-semibold">
                  <span className="flex items-center gap-1">
                    <span>🍿 Snacks Subtotal</span>
                  </span>
                  <span>₹{snacksSubtotal}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-300">
                <span>Convenience Fee</span>
                <span>₹{convenienceFee}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Integrated GST (18%)</span>
                <span>₹{tax}</span>
              </div>

              {totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold pt-1 border-t border-white/5">
                  <span>Total Discount</span>
                  <span>-₹{totalDiscount}</span>
                </div>
              )}

              <div className="pt-4 border-t border-white/15 flex justify-between items-baseline text-white">
                <span className="text-sm font-bold">Payable Amount</span>
                <span className="text-2xl font-black text-emerald-400">₹{finalPayable}</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-teal-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>CineVerse Sandbox: Simulated Demo Payment</span>
            </div>

            <button
              onClick={() => navigate(`/payment/${bookingId}`)}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-teal-500 hover:from-violet-500 hover:to-teal-400 text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-glow-violet transition-all active:scale-95"
            >
              <span>Proceed to Demo Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
