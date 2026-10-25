import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Ticket, AlertCircle, Sparkles, CheckCircle2, ShieldAlert, Clock } from 'lucide-react';
import api from '../../services/api';
import socket from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import SeatMap from '../../components/seats/SeatMap';
import SeatCountdown from '../../components/seats/SeatCountdown';

const SeatBookingPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();

  const [showData, setShowData] = useState(null);
  const [layout, setLayout] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [lockedExpiresAt, setLockedExpiresAt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch Seat Layout
  const fetchLayout = useCallback(async () => {
    try {
      const res = await api.get(`/seats/${showId}/layout`);
      setShowData(res.data?.show);
      setLayout(res.data?.layout || []);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load seat layout.');
    } finally {
      setIsLoading(false);
    }
  }, [showId]);

  useEffect(() => {
    fetchLayout();

    // Socket.IO sync
    socket.emit('join_show', { showId });

    const handleSeatsLocked = (data) => {
      if (data.showId === showId) {
        // Refresh layout dynamically
        fetchLayout();
      }
    };

    const handleSeatsReleased = (data) => {
      if (data.showId === showId) {
        fetchLayout();
      }
    };

    const handleSeatsBooked = (data) => {
      if (data.showId === showId) {
        fetchLayout();
      }
    };

    socket.on('seats_locked', handleSeatsLocked);
    socket.on('seats_released', handleSeatsReleased);
    socket.on('seats_booked', handleSeatsBooked);

    return () => {
      socket.emit('leave_show', { showId });
      socket.off('seats_locked', handleSeatsLocked);
      socket.off('seats_released', handleSeatsReleased);
      socket.off('seats_booked', handleSeatsBooked);
    };
  }, [showId, fetchLayout]);

  // Toggle seat selection
  const handleToggleSeat = (seat) => {
    if (isAdmin) {
      setErrorMessage('Admins are not allowed to book movie tickets. Please use a customer account.');
      return;
    }
    if (showData?.isPastShow || (showData && !showData.canBook)) {
      setErrorMessage('This showtime has ended or started. Booking is closed.');
      return;
    }
    setErrorMessage('');
    const exists = selectedSeats.some((s) => s.seatNumber === seat.seatNumber);

    if (exists) {
      setSelectedSeats(selectedSeats.filter((s) => s.seatNumber !== seat.seatNumber));
    } else {
      if (selectedSeats.length >= 10) {
        setErrorMessage('You can select a maximum of 10 seats per booking.');
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  // Calculate Subtotal
  const subtotal = selectedSeats.reduce((sum, s) => sum + (s.price || 0), 0);

  // Lock seats & Proceed to Checkout
  const handleProceedToCheckout = async () => {
    if (isAdmin) {
      setErrorMessage('Admins are not allowed to book movie tickets. Please use a customer account.');
      return;
    }

    if (showData?.isPastShow || (showData && !showData.canBook)) {
      setErrorMessage('This showtime has ended or started. Booking is closed.');
      return;
    }

    if (!isAuthenticated) {
      // Redirect to unified login with return location
      navigate('/login', { state: { from: `/booking/${showId}/seats` } });
      return;
    }

    if (selectedSeats.length === 0) {
      setErrorMessage('Please select at least one seat to proceed.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // 1. Lock seats temporarily on server
      const lockRes = await api.post(`/seats/${showId}/lock`, {
        seats: selectedSeats.map((s) => ({
          seatNumber: s.seatNumber,
          rowLabel: s.rowLabel,
          category: s.category,
          price: s.price,
        })),
        socketId: socket.id,
      });

      setLockedExpiresAt(lockRes.data?.expiresAt);

      // 2. Initialize Booking
      const bookingRes = await api.post('/bookings', {
        showId,
        seatNumbers: selectedSeats.map((s) => s.seatNumber),
      });

      const bookingId = bookingRes.data?.bookingId;

      // 3. Navigate to snacks add-on page before checkout
      navigate(`/booking/${bookingId}/snacks`);
    } catch (err) {
      setErrorMessage(err.message || 'Seat reservation failed. Please choose different seats.');
      fetchLayout(); // Refresh on conflict
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
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
            <h2 className="text-2xl font-bold font-display text-white">Booking Restricted</h2>
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

  if (showData?.isPastShow || (showData && !showData.canBook)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full p-8 rounded-3xl glass-panel border border-rose-500/30 text-center space-y-5 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-display text-white">Booking Closed</h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              This showtime on <span className="text-white font-semibold">{showData?.date}</span> at{' '}
              <span className="text-white font-semibold">{showData?.startTime}</span> has already started or concluded. Seat bookings are closed.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-3">
            {showData?.movie?._id ? (
              <Link
                to={`/movies/${showData.movie._id}`}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-glow-violet transition-all"
              >
                View Upcoming Showtimes
              </Link>
            ) : (
              <Link
                to="/movies"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-glow-violet transition-all"
              >
                Browse All Movies
              </Link>
            )}
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 pb-32">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-cine-800 hover:bg-cine-700 text-slate-300 hover:text-white border border-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black font-display text-white">
              {showData?.movie?.title}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {showData?.theatre?.name} • {showData?.date} at {showData?.startTime} ({showData?.format})
            </p>
          </div>
        </div>

        {/* Temporary Lock Countdown */}
        {lockedExpiresAt && (
          <SeatCountdown
            expiresAt={lockedExpiresAt}
            onExpire={() => {
              setLockedExpiresAt(null);
              setSelectedSeats([]);
              setErrorMessage('Your seat reservation has expired. Please select your seats again.');
              fetchLayout();
            }}
          />
        )}
      </div>

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Interactive Seat Layout Grid */}
      <div className="rounded-3xl glass-panel p-4 sm:p-8 border border-white/10">
        <SeatMap
          layout={layout}
          selectedSeats={selectedSeats}
          onToggleSeat={handleToggleSeat}
        />
      </div>

      {/* Sticky Bottom Booking Summary Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 glass-panel border-t border-white/15 px-4 sm:px-8 py-4 shadow-2xl backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                Selected Seats ({selectedSeats.length})
              </div>
              <div className="text-sm font-bold text-white flex flex-wrap gap-1 mt-0.5">
                {selectedSeats.length > 0
                  ? selectedSeats.map((s) => s.seatNumber).join(', ')
                  : 'No seats chosen yet'}
              </div>
            </div>

            {selectedSeats.length > 0 && (
              <div className="border-l border-white/10 pl-6">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                  Estimated Total
                </div>
                <div className="text-lg font-black text-emerald-400">₹{subtotal}</div>
              </div>
            )}
          </div>

          <button
            onClick={handleProceedToCheckout}
            disabled={selectedSeats.length === 0 || isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-teal-500 hover:from-violet-500 hover:to-teal-400 disabled:opacity-40 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-glow-violet transition-all active:scale-95"
          >
            <Ticket className="w-4 h-4" />
            <span>{isSubmitting ? 'Locking Seats...' : 'Proceed to Checkout'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatBookingPage;
