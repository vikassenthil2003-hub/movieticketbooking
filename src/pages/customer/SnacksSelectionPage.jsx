import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Clock,
  MapPin,
  Ticket,
  Search,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Check,
  ChevronRight,
  X,
  ShieldAlert,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// Reliable SVG food placeholder fallback if an image fails to load
const FALLBACK_FOOD_IMG =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300" fill="%23161F33"><rect width="400" height="300" fill="%23161F33"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="%23A78BFA" font-size="48">🍿</text><text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" fill="%2394A3B8" font-family="sans-serif" font-size="14" font-weight="600">Cinema Concession</text></svg>';

const SnacksSelectionPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [booking, setBooking] = useState(null);
  const [snacksList, setSnacksList] = useState([]);
  const [categories, setCategories] = useState([
    'All',
    'Popcorn',
    'Combos',
    'Beverages',
    'Burgers & Sandwiches',
    'Nachos',
    'Other Snacks',
  ]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);

  // Cart state: map of snackId -> { snackId, name, variant, price, quantity, imageUrl, isVeg }
  const [cart, setCart] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // 1. Fetch Booking and Available Snacks
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');

        // 1. Fetch booking details to get movie, theatre, showtime, and seats
        const bookingRes = await api.get(`/bookings/${bookingId}`);
        const currentBooking = bookingRes.data;

        if (!isMounted) return;
        setBooking(currentBooking);

        // Pre-populate cart if this booking already has snacks saved
        if (currentBooking?.snacks && currentBooking.snacks.length > 0) {
          const initialCart = {};
          currentBooking.snacks.forEach((item) => {
            const sid = item.snackId?._id || item.snackId || item._id;
            initialCart[sid] = {
              snackId: sid,
              name: item.name,
              variant: item.variant,
              price: item.unitPrice,
              quantity: item.quantity,
              imageUrl: item.imageUrl,
              isVeg: true,
            };
          });
          setCart(initialCart);
        }

        // 2. Fetch snacks for the booking's theatre
        const theatreId = currentBooking?.theatreId?._id || currentBooking?.theatreId;
        const snacksRes = await api.get('/snacks', {
          params: { theatreId },
        });

        if (!isMounted) return;
        const fetchedSnacks = snacksRes.data?.snacks || [];
        setSnacksList(fetchedSnacks);

        if (snacksRes.data?.categories?.length) {
          setCategories(snacksRes.data.categories);
        }
      } catch (err) {
        console.error('[SnacksSelectionPage Load Error]:', err);
        if (isMounted) {
          setErrorMessage(err.message || 'Failed to load snacks menu. You can continue directly to checkout.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [bookingId]);

  // 2. Cart Operations
  const handleAddToCart = (snack) => {
    setCart((prev) => {
      const existing = prev[snack._id];
      const newQty = existing ? existing.quantity + 1 : 1;
      return {
        ...prev,
        [snack._id]: {
          snackId: snack._id,
          name: snack.name,
          variant: snack.variant || 'Regular',
          price: snack.price,
          quantity: newQty,
          imageUrl: snack.imageUrl || '',
          isVeg: snack.isVeg !== false,
        },
      };
    });
  };

  const handleUpdateQuantity = (snackId, delta) => {
    setCart((prev) => {
      const existing = prev[snackId];
      if (!existing) return prev;
      const nextQty = existing.quantity + delta;
      if (nextQty <= 0) {
        const copy = { ...prev };
        delete copy[snackId];
        return copy;
      }
      return {
        ...prev,
        [snackId]: {
          ...existing,
          quantity: nextQty,
        },
      };
    });
  };

  const handleRemoveFromCart = (snackId) => {
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[snackId];
      return copy;
    });
  };

  const handleClearCart = () => {
    setCart({});
  };

  // 3. Totals Calculations
  const cartItems = useMemo(() => Object.values(cart), [cart]);

  const totalSnackItemsCount = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [cartItems]
  );

  const snacksSubtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cartItems]
  );

  const ticketsSubtotal = useMemo(() => {
    if (!booking) return 0;
    return (
      booking.pricingDetails?.ticketsSubtotal ||
      booking.seats?.reduce((sum, s) => sum + (s.price || 0), 0) ||
      booking.pricingDetails?.subtotal ||
      0
    );
  }, [booking]);

  const convenienceFee = useMemo(() => {
    if (!booking) return 0;
    return booking.pricingDetails?.convenienceFee || (booking.seats?.length || 1) * 30;
  }, [booking]);

  const tax = useMemo(() => {
    if (!booking) return 0;
    return booking.pricingDetails?.tax || Math.round(convenienceFee * 0.18);
  }, [booking, convenienceFee]);

  const totalPayable = useMemo(() => {
    const combined = ticketsSubtotal + snacksSubtotal;
    const discount = booking?.pricingDetails?.discount || 0;
    return Math.max(1, Math.round(combined + convenienceFee + tax - discount));
  }, [ticketsSubtotal, snacksSubtotal, convenienceFee, tax, booking]);

  // 4. Save Snacks and Proceed to Checkout
  const handleProceedToCheckout = async () => {
    try {
      setIsSaving(true);
      setErrorMessage('');

      const payload = {
        snacks: cartItems.map((item) => ({
          snackId: item.snackId,
          quantity: item.quantity,
        })),
      };

      await api.put(`/bookings/${bookingId}/snacks`, payload);
      navigate(`/checkout/${bookingId}`);
    } catch (err) {
      console.error('[Update Snacks Error]:', err);
      setErrorMessage(err.message || 'Failed to update snacks for your booking. Please retry.');
      setIsSaving(false);
    }
  };

  // 5. Skip Snacks and Proceed to Checkout
  const handleSkipSnacks = async () => {
    try {
      setIsSaving(true);
      setErrorMessage('');

      // Clear any previously saved snacks on the booking
      await api.put(`/bookings/${bookingId}/snacks`, { snacks: [] });
      navigate(`/checkout/${bookingId}`);
    } catch (err) {
      console.error('[Skip Snacks Error]:', err);
      // Fallback: navigate directly to checkout
      navigate(`/checkout/${bookingId}`);
    }
  };

  // 6. Filter Snacks List
  const filteredSnacks = useMemo(() => {
    return snacksList.filter((item) => {
      // Category match
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      // Veg filter
      if (vegOnly && !item.isVeg) {
        return false;
      }
      // Search query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        const matchesVariant = item.variant?.toLowerCase().includes(q);
        return matchesName || matchesDesc || matchesVariant;
      }
      return true;
    });
  }, [snacksList, selectedCategory, vegOnly, searchQuery]);

  // Admin access guard
  if (isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full p-8 rounded-3xl glass-panel border border-amber-500/30 text-center space-y-5 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-display text-white">Food Ordering Restricted</h2>
            <p className="text-sm text-slate-300 mt-2">
              Admins are not allowed to book tickets or purchase snacks. Please use a customer account.
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-400 font-medium animate-pulse">Loading Cinema Concessions Menu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28 lg:pb-16 text-slate-100">
      {/* Top Breadcrumb & Booking Context Banner */}
      <div className="bg-cine-900/90 border-b border-white/10 sticky top-16 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to={`/booking/${booking?.showId?._id || ''}/seats`}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-violet-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Seats</span>
            </Link>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-300 font-bold">
                Step 2 of 3
              </span>
              <span className="font-semibold text-white truncate max-w-[200px] sm:max-w-xs">
                {booking?.movieId?.title}
              </span>
            </div>
          </div>

          {/* Quick summary pill */}
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <span className="hidden sm:inline-flex items-center gap-1 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              {booking?.theatreId?.name}
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              {booking?.showId?.date} • {booking?.showId?.startTime}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-cine-800 border border-white/10 font-mono font-bold text-white">
              {booking?.seats?.length} Seats (₹{ticketsSubtotal})
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>Cinema Food & Beverage Add-On</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-display text-white tracking-tight">
              Grab Your Movie Snacks
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Pre-book hot buttery popcorn, refreshing drinks, and combos for fast express counter pickup.
              <span className="text-amber-400/90 ml-1 font-semibold">(Configured with Demo Prices)</span>
            </p>
          </div>

          {/* Quick Skip button */}
          <button
            onClick={handleSkipSnacks}
            disabled={isSaving}
            className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-cine-800/80 hover:bg-cine-700/80 border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <span>Continue Without Snacks</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage('')}
              className="text-rose-400 hover:text-white text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Grid: Catalog (Left) + Cart Sidebar (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Menu (8 cols on lg) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Filter and Search Bar */}
            <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search popcorn, beverages, nachos, combos..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs sm:text-sm placeholder:text-slate-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Veg Only Toggle */}
                <button
                  type="button"
                  onClick={() => setVegOnly(!vegOnly)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all ${
                    vegOnly
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-sm'
                      : 'bg-cine-800/80 border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-sm border border-emerald-500 flex items-center justify-center p-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 block" />
                  </span>
                  <span>Veg Only</span>
                  {vegOnly && <Check className="w-3.5 h-3.5 text-emerald-400 ml-0.5" />}
                </button>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10">
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-glow-violet'
                          : 'bg-cine-800/70 hover:bg-cine-700/70 text-slate-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Snacks Product Cards Grid */}
            {filteredSnacks.length === 0 ? (
              <div className="p-12 text-center rounded-3xl glass-panel border border-white/10 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-cine-800 border border-white/10 flex items-center justify-center mx-auto text-3xl">
                  🍿
                </div>
                <h3 className="text-lg font-bold text-white font-display">No Snacks Found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  We couldn't find any snack matching your current filter. Try clearing the search or switching categories.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                    setVegOnly(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {filteredSnacks.map((snack) => {
                  const currentCartItem = cart[snack._id];
                  const inCartQty = currentCartItem ? currentCartItem.quantity : 0;

                  return (
                    <div
                      key={snack._id}
                      className="group relative rounded-2xl glass-panel border border-white/10 hover:border-violet-500/30 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-violet-950/20"
                    >
                      {/* Card Image and Badges */}
                      <div className="relative aspect-[16/10] bg-cine-800 overflow-hidden">
                        <img
                          src={snack.imageUrl || FALLBACK_FOOD_IMG}
                          alt={snack.name}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = FALLBACK_FOOD_IMG;
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-cine-950 via-cine-950/20 to-transparent opacity-80" />

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          {/* Veg / Non-Veg Icon */}
                          <span
                            className={`w-4 h-4 rounded-sm border flex items-center justify-center p-0.5 bg-cine-900/80 backdrop-blur-sm ${
                              snack.isVeg !== false
                                ? 'border-emerald-500 text-emerald-400'
                                : 'border-rose-500 text-rose-400'
                            }`}
                            title={snack.isVeg !== false ? 'Vegetarian' : 'Non-Vegetarian'}
                          >
                            <span
                              className={`w-2 h-2 rounded-full block ${
                                snack.isVeg !== false ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                            />
                          </span>

                          {/* Variant Badge */}
                          {snack.variant && (
                            <span className="px-2 py-0.5 rounded-md bg-cine-900/80 backdrop-blur-sm border border-white/10 text-[10px] font-bold text-slate-300">
                              {snack.variant}
                            </span>
                          )}
                        </div>

                        {/* Category Badge */}
                        <div className="absolute top-2.5 right-2.5">
                          <span className="px-2 py-0.5 rounded-md bg-violet-600/80 backdrop-blur-sm text-[10px] font-bold text-white uppercase tracking-wider">
                            {snack.category}
                          </span>
                        </div>

                        {/* Theatre Exclusive Badge if any */}
                        {snack.theatreId && (
                          <div className="absolute bottom-2.5 left-2.5">
                            <span className="px-2 py-0.5 rounded-md bg-teal-500/20 backdrop-blur-sm border border-teal-500/30 text-[10px] font-bold text-teal-300">
                              ★ Theatre Special
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Card Body */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1">
                          <h3 className="font-bold text-white text-base leading-snug group-hover:text-violet-300 transition-colors line-clamp-1">
                            {snack.name}
                          </h3>
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {snack.description || 'Freshly prepared cinema concession item.'}
                          </p>
                        </div>

                        {/* Price and Add / Quantity Stepper */}
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-3">
                          <div>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-lg font-black font-display text-emerald-400">
                                ₹{snack.price}
                              </span>
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Demo
                              </span>
                            </div>
                            {inCartQty > 0 && (
                              <span className="text-[10px] text-violet-400 font-semibold block">
                                Subtotal: ₹{snack.price * inCartQty}
                              </span>
                            )}
                          </div>

                          {/* Quantity Action Controls */}
                          {inCartQty === 0 ? (
                            <button
                              type="button"
                              onClick={() => handleAddToCart(snack)}
                              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold tracking-wide flex items-center gap-1.5 shadow-md shadow-violet-600/20 active:scale-95 transition-all"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>ADD</span>
                            </button>
                          ) : (
                            <div className="flex items-center gap-1 p-1 rounded-xl bg-cine-800 border border-violet-500/40 shadow-inner">
                              <button
                                type="button"
                                onClick={() => handleUpdateQuantity(snack._id, -1)}
                                className="w-7 h-7 rounded-lg bg-cine-700 hover:bg-rose-600/30 hover:text-rose-300 text-slate-300 flex items-center justify-center transition-colors active:scale-90"
                                title="Decrease quantity"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-7 text-center font-mono font-black text-sm text-white">
                                {inCartQty}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateQuantity(snack._id, 1)}
                                className="w-7 h-7 rounded-lg bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center transition-colors active:scale-90"
                                title="Increase quantity"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Sticky Cart Summary Sidebar (4 cols on lg) */}
          <div className="hidden lg:block lg:col-span-4 sticky top-36">
            <div className="rounded-3xl glass-panel border border-white/10 p-6 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-violet-400" />
                  <h3 className="font-bold text-white text-base font-display">Snacks Summary</h3>
                </div>
                {totalSnackItemsCount > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>

              {/* Selected Snacks List */}
              {cartItems.length === 0 ? (
                <div className="py-8 text-center space-y-2 border border-dashed border-white/10 rounded-2xl bg-cine-900/40">
                  <p className="text-2xl">🍿</p>
                  <p className="text-xs font-semibold text-slate-300">No snacks selected yet</p>
                  <p className="text-[11px] text-slate-500 px-4">
                    Explore popcorn, drinks and combos to enjoy during the movie.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                  {cartItems.map((item) => (
                    <div
                      key={item.snackId}
                      className="p-3 rounded-xl bg-cine-800/80 border border-white/5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white truncate">{item.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {item.variant} • ₹{item.price} each
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Stepper */}
                        <div className="flex items-center gap-1 bg-cine-900 rounded-lg p-0.5 border border-white/10">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.snackId, -1)}
                            className="w-5 h-5 rounded flex items-center justify-center text-slate-300 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-4 text-center font-mono font-bold text-white text-xs">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.snackId, 1)}
                            className="w-5 h-5 rounded flex items-center justify-center text-slate-300 hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <span className="font-bold font-mono text-emerald-400 w-12 text-right">
                          ₹{item.price * item.quantity}
                        </span>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleRemoveFromCart(item.snackId)}
                          className="text-slate-500 hover:text-rose-400 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Price Calculation Breakdown */}
              <div className="pt-4 border-t border-white/10 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Movie Tickets ({booking?.seats?.length || 0} seats)</span>
                  <span className="font-mono">₹{ticketsSubtotal}</span>
                </div>

                <div className="flex justify-between text-slate-300">
                  <span>Snacks Subtotal ({totalSnackItemsCount} items)</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    ₹{snacksSubtotal}
                  </span>
                </div>

                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Convenience Fee & Taxes</span>
                  <span className="font-mono">₹{convenienceFee + tax}</span>
                </div>

                <div className="pt-3 border-t border-white/15 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-white">Estimated Total</span>
                  <span className="text-2xl font-black text-emerald-400 font-display">
                    ₹{totalPayable}
                  </span>
                </div>
              </div>

              {/* CTA Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  disabled={isSaving}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-teal-500 hover:from-violet-500 hover:to-teal-400 text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-glow-violet active:scale-95 transition-all disabled:opacity-50"
                >
                  <span>{isSaving ? 'Updating Booking...' : 'Continue to Payment'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleSkipSnacks}
                  disabled={isSaving}
                  className="w-full py-2.5 rounded-xl bg-cine-800/80 hover:bg-cine-700/80 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all disabled:opacity-50"
                >
                  Continue Without Snacks
                </button>
              </div>

              <div className="pt-2 text-[10px] text-slate-500 flex items-center gap-1.5 justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                <span>Express pickup voucher included on digital ticket</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar & Drawer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-cine-900/95 border-t border-white/10 backdrop-blur-lg px-4 py-3 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
            className="flex items-center gap-2 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 font-bold text-sm relative">
              <ShoppingBag className="w-5 h-5" />
              {totalSnackItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center shadow">
                  {totalSnackItemsCount}
                </span>
              )}
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Total Payable</div>
              <div className="text-lg font-black text-emerald-400">₹{totalPayable}</div>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSkipSnacks}
              disabled={isSaving}
              className="px-3 py-2.5 rounded-xl bg-cine-800 border border-white/10 text-slate-300 text-xs font-bold"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={handleProceedToCheckout}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow-violet active:scale-95"
            >
              <span>{isSaving ? 'Saving...' : 'Checkout'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Expandable Mobile Cart Drawer */}
        {isMobileDrawerOpen && (
          <div className="mt-3 pt-3 border-t border-white/10 space-y-3 max-h-60 overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>Your Selected Snacks</span>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
            {cartItems.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">No snacks selected yet.</p>
            ) : (
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div
                    key={item.snackId}
                    className="flex items-center justify-between text-xs p-2 rounded-lg bg-cine-800"
                  >
                    <span className="font-medium text-white truncate max-w-[150px]">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-cine-900 rounded p-0.5">
                        <button
                          onClick={() => handleUpdateQuantity(item.snackId, -1)}
                          className="w-5 h-5 flex items-center justify-center text-slate-300"
                        >
                          -
                        </button>
                        <span className="w-4 text-center font-mono font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.snackId, 1)}
                          className="w-5 h-5 flex items-center justify-center text-slate-300"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-bold text-emerald-400">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SnacksSelectionPage;
