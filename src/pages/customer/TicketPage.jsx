import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import {
  CheckCircle2,
  Printer,
  MapPin,
  Calendar,
  Clock,
  Ticket as TicketIcon,
  XCircle,
  Share2,
  ShieldCheck,
  Building2,
  ArrowLeft,
  ShieldAlert,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TicketPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await api.get(`/tickets/${bookingId}`);
        setTicket(res.data);

        // Generate QR code data URL from verification payload
        if (res.data?.qrVerificationPayload) {
          const url = await QRCode.toDataURL(res.data.qrVerificationPayload, {
            width: 240,
            margin: 2,
            color: {
              dark: '#070A12',
              light: '#FFFFFF',
            },
          });
          setQrCodeDataUrl(url);
        }
      } catch (err) {
        console.error('[Ticket Fetch Error]:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicket();
  }, [bookingId]);

  const handlePrint = () => {
    window.print();
  };

  const handleCancelBooking = async () => {
    setIsCancelling(true);
    try {
      await api.post(`/bookings/${ticket.bookingId}/cancel`, {
        reason: 'Customer initiated cancellation from ticket view',
      });
      alert('Booking cancelled successfully. Simulated refund processed.');
      window.location.reload();
    } catch (err) {
      alert(err.message || 'Failed to cancel booking');
    } finally {
      setIsCancelling(false);
      setCancelModalOpen(false);
    }
  };

  if (isLoading || !ticket) {
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
            <h2 className="text-2xl font-bold font-display text-white">Tickets Restricted</h2>
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

  const isConfirmed = ticket.bookingStatus === 'confirmed';
  const isCancelled = ticket.bookingStatus === 'cancelled';
  const isAdmitted = ticket.isAdmitted;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Top Controls */}
      <div className="flex items-center justify-between no-print">
        <Link
          to="/my-bookings"
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>My Bookings</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-cine-800 hover:bg-cine-700 border border-white/10 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
          >
            <Printer className="w-4 h-4 text-teal-400" />
            <span>Print Ticket</span>
          </button>
        </div>
      </div>

      {/* Confirmation Banner */}
      {isConfirmed && !isAdmitted && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-3 no-print">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <div>
            <span className="font-extrabold uppercase">Booking Confirmed!</span> Show this digital QR pass at the theatre entry gate.
          </div>
        </div>
      )}

      {isAdmitted && (
        <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs sm:text-sm flex items-center gap-3 no-print">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-teal-400" />
          <div>
            <span className="font-extrabold uppercase">Ticket Admitted</span> Verified on {new Date(ticket.admittedAt).toLocaleTimeString()}. Enjoy the movie!
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center gap-3 no-print">
          <XCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <div>
            <span className="font-extrabold uppercase">Booking Cancelled</span> This reservation is void and cannot be used for admission.
          </div>
        </div>
      )}

      {/* Digital Boarding-Pass Style Ticket */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-white/15 shadow-2xl bg-cine-850">
        {/* Ticket Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-violet-900/50 via-cine-800 to-teal-950/50 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-teal-400">
              CineVerse Digital Pass
            </span>
            <h2 className="text-2xl font-black font-display text-white">{ticket.movie?.title}</h2>
            <p className="text-xs text-slate-300">
              {ticket.movie?.language} • {ticket.movie?.format} • {ticket.movie?.certification}
            </p>
          </div>

          <div className="sm:text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Booking Ref</span>
            <div className="text-xl font-mono font-black text-violet-300">
              {ticket.bookingReference}
            </div>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Details Column */}
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 uppercase font-bold tracking-wider text-[10px]">Cinema Hall</span>
                <p className="font-bold text-white mt-1 text-sm">{ticket.theatre?.name}</p>
                <p className="text-slate-400 text-[11px] mt-0.5">{ticket.theatre?.address}</p>
              </div>

              <div>
                <span className="text-slate-400 uppercase font-bold tracking-wider text-[10px]">Screen & Audio</span>
                <p className="font-bold text-white mt-1 text-sm">{ticket.screen?.name}</p>
                <p className="text-teal-400 text-[11px] mt-0.5">{ticket.screen?.soundSystem}</p>
              </div>

              <div>
                <span className="text-slate-400 uppercase font-bold tracking-wider text-[10px]">Date & Time</span>
                <p className="font-bold text-white mt-1 text-sm">{ticket.showtime?.date}</p>
                <p className="text-amber-400 font-bold text-xs mt-0.5">{ticket.showtime?.startTime}</p>
              </div>

              <div>
                <span className="text-slate-400 uppercase font-bold tracking-wider text-[10px]">Total Paid (Demo)</span>
                <p className="font-black text-emerald-400 mt-1 text-base">
                  ₹{ticket.pricingDetails?.totalAmount}
                </p>
                <p className="text-[10px] text-slate-500">
                  {ticket.pricingDetails?.snacksSubtotal > 0
                    ? `Incl. ₹${ticket.pricingDetails.snacksSubtotal} Snacks`
                    : 'Simulated Payment'}
                </p>
              </div>
            </div>

            {/* Reserved Seats Pills */}
            <div className="p-4 rounded-2xl bg-cine-800/80 border border-white/5 space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Confirmed Seat Numbers ({ticket.seats?.length})
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {ticket.seats?.map((seat) => (
                  <span
                    key={seat.seatNumber}
                    className="px-3 py-1.5 rounded-lg bg-violet-600/30 border border-violet-500/40 text-violet-200 font-mono font-black text-sm"
                  >
                    {seat.seatNumber} ({seat.category})
                  </span>
                ))}
              </div>
            </div>

            {/* Food & Concessions Voucher */}
            {ticket.snacks && ticket.snacks.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <span className="text-base">🍿</span>
                    <span>Cinema Concessions Voucher ({ticket.snacks.reduce((sum, item) => sum + item.quantity, 0)} Items)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px]">
                    ₹{ticket.pricingDetails?.snacksSubtotal || ticket.snacks.reduce((sum, item) => sum + (item.totalPrice || item.unitPrice * item.quantity), 0)} PAID
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {ticket.snacks.map((item, idx) => (
                    <div
                      key={item.snackId || idx}
                      className="flex items-center justify-between p-2 rounded-xl bg-cine-900/80 border border-white/5 text-xs"
                    >
                      <div className="truncate mr-2">
                        <span className="font-bold text-white block truncate">{item.name}</span>
                        <span className="text-[10px] text-slate-400">{item.variant}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-amber-400 font-mono">Qty: {item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-[10px] text-amber-200/80 flex items-center gap-1.5 pt-1 border-t border-amber-500/15">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Present this voucher at the cinema snack counter for instant order pickup.</span>
                </div>
              </div>
            )}

            {/* Customer info */}
            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2">
              <span>Customer: {ticket.customer?.name} ({ticket.customer?.email})</span>
              <span className="text-teal-400 font-bold">Status: {ticket.bookingStatus.toUpperCase()}</span>
            </div>
          </div>

          {/* QR Code Column */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white text-slate-900 text-center space-y-3 shadow-xl">
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt="Ticket QR Code"
                className="w-44 h-44 object-contain mx-auto"
              />
            ) : (
              <div className="w-44 h-44 bg-slate-100 flex items-center justify-center font-mono text-xs">
                QR Loading...
              </div>
            )}
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700">Scan at Gate</p>
              <p className="text-[9px] font-mono text-slate-500">Token: {ticket.ticketToken.slice(0, 16)}...</p>
            </div>
          </div>
        </div>

        {/* Ticket Footer Tear-Off Line */}
        <div className="p-4 bg-cine-900 border-t border-dashed border-white/15 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Verified CineVerse Digital Admission Pass</span>
          </div>

          {isConfirmed && !isAdmitted && (
            <button
              onClick={() => setCancelModalOpen(true)}
              className="text-xs text-rose-400 hover:text-rose-300 font-bold hover:underline no-print"
            >
              Cancel Booking
            </button>
          )}
        </div>
      </div>

      {/* Cancellation Confirmation Dialog */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="p-6 rounded-2xl glass-panel border border-white/15 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white">Cancel This Booking?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to cancel booking <span className="font-mono font-bold text-violet-300">{ticket.bookingReference}</span>? Your seats will be immediately released back to other customers and simulated refund of ₹{ticket.pricingDetails?.totalAmount} will be processed.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-cine-800 text-slate-300 text-xs font-semibold"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={isCancelling}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketPage;
