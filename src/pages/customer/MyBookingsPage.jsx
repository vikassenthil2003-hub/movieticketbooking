import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Calendar, Clock, MapPin, ArrowRight, Frown, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MyBookingsPage = () => {
  const { isAdmin } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get('/bookings/my-bookings');
        setBookings(res.data || []);
      } catch (err) {
        console.error('[Bookings Fetch Error]:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookings();
  }, []);

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
            <h2 className="text-2xl font-bold font-display text-white">Access Restricted</h2>
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black font-display text-white">My Movie Bookings</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          View your confirmed digital tickets, past cinema visits, and admission history
        </p>
      </div>

      {bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((b) => {
            const isConfirmed = b.bookingStatus === 'confirmed';
            const isCancelled = b.bookingStatus === 'cancelled';
            const isAdmitted = b.isAdmitted;

            return (
              <div
                key={b._id}
                className="p-5 sm:p-6 rounded-2xl glass-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={b.movieId?.posterUrl}
                    alt={b.movieId?.title}
                    className="w-16 h-24 object-cover rounded-xl shadow-md border border-white/10 flex-shrink-0"
                  />

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-violet-400">
                        {b.bookingReference}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          isCancelled
                            ? 'bg-rose-500/20 text-rose-300'
                            : isAdmitted
                            ? 'bg-teal-500/20 text-teal-300'
                            : isConfirmed
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {isCancelled ? 'Cancelled' : isAdmitted ? 'Admitted' : isConfirmed ? 'Confirmed' : 'Pending'}
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-white font-display">{b.movieId?.title}</h3>
                    <p className="text-xs text-slate-400">{b.theatreId?.name}</p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-violet-400" />
                        {b.showId?.date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-teal-400" />
                        {b.showId?.startTime}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-300 pt-1 flex flex-wrap items-center gap-2">
                      <span>Seats: <span className="text-white font-mono">{b.seats?.map((s) => s.seatNumber).join(', ')}</span></span>
                      {b.snacks && b.snacks.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                          <span>🍿</span>
                          <span>{b.snacks.reduce((sum, item) => sum + item.quantity, 0)} Snacks</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Paid Amount (Demo)</div>
                    <div className="text-xl font-black text-emerald-400">
                      ₹{b.pricingDetails?.totalAmount}
                    </div>
                  </div>

                  <Link
                    to={`/ticket/${b.bookingReference}`}
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-glow-violet transition-all"
                  >
                    <span>View Ticket</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl glass-panel border border-white/10 space-y-4">
          <Ticket className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Bookings Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven't booked any movie tickets yet. Explore movies and book your first show!
          </p>
          <Link
            to="/movies"
            className="inline-block px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-glow-violet transition-all"
          >
            Explore Now Showing Movies
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
