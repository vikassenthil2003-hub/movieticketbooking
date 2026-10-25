import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Clock,
  Play,
  Bookmark,
  Share2,
  Calendar,
  Building2,
  Ticket,
  MapPin,
  Check,
  X,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLocationContext } from '../../context/LocationContext';
import { getLocalDateString, getDynamicDateTabs, formatDisplayDate, DEFAULT_TIMEZONE, isDateInPast } from '../../utils/dateUtils';
import TrailerModal from '../../components/trailers/TrailerModal';

const MovieDetailsPage = () => {
  const { movieId } = useParams();
  const { isAuthenticated, isAdmin } = useAuth();
  const { selectedCity, setSelectedCity } = useLocationContext();

  const [movie, setMovie] = useState(null);
  const [theatresWithShows, setTheatresWithShows] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString(0));
  const [isSavedInWatchlist, setIsSavedInWatchlist] = useState(false);
  const [trailerModalOpen, setTrailerModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showsLoading, setShowsLoading] = useState(false);

  const [todayShowsEnded, setTodayShowsEnded] = useState(false);
  const [nextAvailableDate, setNextAvailableDate] = useState(null);
  const [serverDate, setServerDate] = useState(() => getLocalDateString(0));

  // Dynamic date tabs: Today, Tomorrow, Day After Tomorrow, and subsequent days
  const baseTabs = getDynamicDateTabs(7);
  const baseDateStrs = new Set(baseTabs.map((t) => t.dateStr));
  const additionalTabs = (availableDates || [])
    .filter((d) => !baseDateStrs.has(d) && !isDateInPast(d))
    .slice(0, 5)
    .map((dateStr) => {
      const [y, m, day] = dateStr.split('-').map(Number);
      const dt = new Date(Date.UTC(y, m - 1, day, 12, 0, 0));
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: DEFAULT_TIMEZONE,
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }).formatToParts(dt);
      const map = {};
      parts.forEach((p) => {
        map[p.type] = p.value;
      });
      return {
        dateStr,
        dayName: map.weekday ? map.weekday.toUpperCase() : 'DAY',
        shortDayName: map.weekday ? map.weekday.toUpperCase() : 'DAY',
        dayNum: map.day,
        monthName: map.month,
        formattedDate: `${map.day} ${map.month}`,
        isToday: false,
        isTomorrow: false,
        isDayAfter: false,
      };
    });
  const allDateTabs = [...baseTabs, ...additionalTabs];

  // Fetch movie details
  useEffect(() => {
    const fetchMovie = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/movies/${movieId}`);
        const movieData = res.data?.data || res.data;
        setMovie(movieData);

        // Check watchlist if authenticated
        if (isAuthenticated) {
          try {
            const watchRes = await api.get('/users/watchlist');
            const watchList = watchRes.data?.data || (Array.isArray(watchRes.data) ? watchRes.data : []);
            const found = watchList.some((m) => (m._id || m) === movieData?._id);
            setIsSavedInWatchlist(found);
          } catch {}
        }
      } catch (err) {
        console.error('[Movie Details Error]:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovie();
  }, [movieId, isAuthenticated]);

  // Fetch shows grouped by theatre for selected date
  useEffect(() => {
    const fetchShows = async () => {
      // Prevent past dates
      const currentToday = getLocalDateString(0);
      if (selectedDate < currentToday) {
        setSelectedDate(currentToday);
        return;
      }

      setShowsLoading(true);
      try {
        const res = await api.get(
          `/shows/movie/${movieId}?date=${selectedDate}&city=${selectedCity}`
        );
        const data = res.data?.data || res.data || {};
        setTheatresWithShows(data.theatres || []);
        setAvailableDates(data.availableDates || []);
        setAvailableCities(data.availableCities || []);
        setTodayShowsEnded(Boolean(data.todayShowsEnded));
        setNextAvailableDate(data.nextAvailableDate || null);
        if (data.serverDate) {
          setServerDate(data.serverDate);
        }
      } catch (err) {
        console.error('[Shows Fetch Error]:', err);
        setTheatresWithShows([]);
      } finally {
        setShowsLoading(false);
      }
    };
    if (movie) {
      fetchShows();
    }
  }, [movieId, selectedDate, selectedCity, movie]);

  const handleToggleWatchlist = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to save movies to your watchlist.');
      return;
    }
    try {
      const res = await api.post('/users/watchlist/toggle', { movieId: movie._id });
      setIsSavedInWatchlist(res.data?.isSaved);
    } catch (err) {
      alert(err.message || 'Failed to update watchlist');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
          <Ticket className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Movie Not Found</h2>
        <p className="text-slate-400 text-sm max-w-md">
          The movie you are looking for does not exist or has been removed from the CineVerse catalogue.
        </p>
        <Link
          to="/movies"
          className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm shadow-glow-violet transition"
        >
          Back to Movies Catalogue
        </Link>
      </div>
    );
  }

  const ratingDisplay = typeof movie.rating === 'object'
    ? movie.rating?.average?.toFixed(1) || '8.8'
    : Number(movie.rating || 8.8).toFixed(1);

  const isToday = selectedDate === serverDate;
  const tomorrowStr = getLocalDateString(1);
  const isTodayShowsOver = isToday && (todayShowsEnded || theatresWithShows.length === 0);

  return (
    <div className="space-y-12 pb-16">
      {/* Cinematic Hero Header */}
      <div className="relative w-full overflow-hidden bg-cine-950 border-b border-white/10">
        <div className="absolute inset-0">
          <img
            src={movie.bannerUrl || movie.posterUrl || '/images/movies/fallback-poster.svg'}
            alt={`${movie.title} backdrop`}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/images/movies/fallback-poster.svg';
            }}
            className="w-full h-full object-cover object-center filter blur-xl opacity-20 transform scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cine-950 via-cine-950/80 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-8 items-start">
          {/* Movie Poster */}
          <div className="relative aspect-[2/3] w-56 sm:w-64 rounded-2xl overflow-hidden glass-card shadow-2xl flex-shrink-0 border border-white/15 mx-auto md:mx-0">
            <img
              src={movie.posterUrl || '/images/movies/fallback-poster.svg'}
              alt={`${movie.title} official poster`}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/images/movies/fallback-poster.svg';
              }}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-xs font-bold text-white uppercase border border-white/10">
              {movie.certification || 'UA'}
            </span>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 rounded-full bg-violet-600/30 border border-violet-400/40 text-violet-300 text-xs font-bold uppercase tracking-wider">
                {movie.status === 'now_showing' ? 'Now Showing' : 'Coming Soon'}
              </span>
              {movie.formats?.map((fmt) => (
                <span
                  key={fmt}
                  className="px-2.5 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold"
                >
                  {fmt}
                </span>
              ))}
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-display text-white tracking-tight">
              {movie.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs sm:text-sm font-semibold text-slate-300">
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{ratingDisplay}/10</span>
                <span className="text-slate-500 font-normal">({movie.reviewCount || 120} reviews)</span>
              </div>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {movie.duration} mins
              </span>
              <span>•</span>
              <span>{movie.language?.join(', ')}</span>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-1">
              {movie.genre?.map((g) => (
                <span
                  key={g}
                  className="text-xs px-3 py-1 rounded-full bg-cine-800 text-slate-200 border border-white/10 font-semibold"
                >
                  {g}
                </span>
              ))}
            </div>

            {/* Synopsis */}
            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl pt-2">
              {movie.synopsis}
            </p>

            {/* Cast & Director */}
            <div className="pt-2 text-xs text-slate-400 space-y-1">
              <div>
                <span className="font-bold text-slate-200">Director:</span> {movie.director}
              </div>
              {movie.cast && movie.cast.length > 0 && (
                <div>
                  <span className="font-bold text-slate-200">Starring:</span>{' '}
                  {movie.cast.map((c) => c.name).join(', ')}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-4">
              <button
                onClick={() => setTrailerModalOpen(true)}
                className={`px-5 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 backdrop-blur-md transition-all shadow-md ${
                  movie.trailerUrl
                    ? 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
                    : 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-300'
                }`}
                title={movie.trailerUrl ? 'Play official theatrical trailer' : 'Official trailer not yet announced'}
              >
                <Play className={`w-4 h-4 ${movie.trailerUrl ? 'fill-white' : 'text-rose-400'}`} />
                <span>{movie.trailerUrl ? 'Watch Trailer' : 'Trailer Unavailable'}</span>
              </button>

              <button
                onClick={handleToggleWatchlist}
                className={`px-5 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                  isSavedInWatchlist
                    ? 'bg-violet-600/30 border-violet-500 text-violet-300'
                    : 'bg-cine-800/80 border-white/10 text-slate-300 hover:text-white'
                }`}
              >
                {isSavedInWatchlist ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                <span>{isSavedInWatchlist ? 'Saved in Watchlist' : 'Add to Watchlist'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Showtimes & Booking Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {movie.status === 'coming_soon' ? (
          <div className="p-10 md:p-14 text-center rounded-3xl glass-panel border border-violet-500/20 bg-gradient-to-b from-violet-950/20 via-cine-900/50 to-cine-950/80 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-violet-600/20 border border-violet-400/30 flex items-center justify-center text-violet-300 shadow-glow-violet">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-white">
              Coming Soon to Cinemas
            </h2>
            <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              Ticket advance bookings for <span className="text-white font-bold">{movie.title}</span> will open closer to the theatrical release date. Add this movie to your watchlist to receive real-time notifications when showtimes go live!
            </p>
            <div className="pt-2">
              <button
                onClick={handleToggleWatchlist}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-glow-violet transition-all transform hover:scale-105 active:scale-95"
              >
                {isSavedInWatchlist ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                <span>{isSavedInWatchlist ? 'Saved in Watchlist' : 'Notify Me When Bookings Open'}</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl font-black font-display text-white">Select Date & Showtimes</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Showing live schedules in <span className="text-teal-400 font-bold">{selectedCity}</span> (Timezone: Asia/Kolkata)
                </p>
              </div>
              {availableDates.length > 0 && (
                <div className="text-xs text-slate-400">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                  Shows available across {availableDates.length} upcoming dates
                </div>
              )}
            </div>

            {/* BookMyShow Style Dynamic Date Selector */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-thin">
              {allDateTabs.map((tab) => {
                const isSelected = selectedDate === tab.dateStr;
                const hasSchedules = availableDates.includes(tab.dateStr);

                return (
                  <button
                    key={tab.dateStr}
                    onClick={() => setSelectedDate(tab.dateStr)}
                    className={`relative flex flex-col items-center justify-center min-w-[92px] sm:min-w-[104px] py-3 px-3 rounded-2xl border transition-all select-none ${
                      isSelected
                        ? 'bg-gradient-to-b from-violet-600 to-indigo-700 border-violet-400 text-white shadow-glow-violet scale-105 z-10'
                        : 'bg-cine-800/80 border-white/10 text-slate-300 hover:text-white hover:bg-cine-700/80'
                    }`}
                  >
                    {/* Day Name / Label */}
                    <span
                      className={`text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider ${
                        isSelected ? 'text-violet-100' : 'text-slate-400'
                      }`}
                    >
                      {tab.shortDayName || tab.dayName}
                    </span>

                    {/* Day Number */}
                    <span className="text-lg sm:text-xl font-black leading-tight mt-0.5">
                      {tab.dayNum}
                    </span>

                    {/* Month Name */}
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        isSelected ? 'text-violet-200' : 'text-slate-400'
                      }`}
                    >
                      {tab.monthName}
                    </span>

                    {/* Schedule availability dot */}
                    {hasSchedules && !isSelected && (
                      <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Admin Restriction Banner */}
            {isAdmin && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0">
                    <ShieldAlert className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <span className="font-extrabold uppercase text-amber-300">Administrator Mode</span>
                    <p className="text-slate-300 mt-0.5">
                      Admins are not allowed to book movie tickets. Seat selection and booking are disabled for this account.
                    </p>
                  </div>
                </div>
                <Link
                  to="/admin/shows"
                  className="px-3.5 py-1.5 rounded-xl bg-cine-800 hover:bg-cine-700 border border-white/10 text-white font-bold text-xs shrink-0 transition-colors inline-block text-center"
                >
                  Manage Shows in Admin Console
                </Link>
              </div>
            )}

            {/* Theatres and Showtimes Grouped List */}
            {showsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-6 rounded-2xl glass-panel border border-white/10 animate-pulse space-y-4">
                    <div className="h-6 w-48 bg-white/10 rounded-lg"></div>
                    <div className="h-4 w-72 bg-white/5 rounded-lg"></div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <div key={j} className="h-14 bg-white/5 rounded-xl"></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : theatresWithShows.length > 0 ? (
              <div className="space-y-6">
                {theatresWithShows.map((group) => {
                  const hasDemoShows = group.shows.some((s) => s.isDemoData);
                  return (
                    <div
                      key={group.theatre._id}
                      className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4"
                    >
                      {/* Theatre Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/10">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg text-white font-display">
                              {group.theatre.name}
                            </h3>
                            {hasDemoShows && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
                                Demo Schedule
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-teal-400" />
                            {group.theatre.address}, {group.theatre.city}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {group.theatre.amenities?.slice(0, 3).map((a) => (
                            <span
                              key={a}
                              className="text-[10px] px-2 py-0.5 rounded bg-cine-700 text-slate-300 font-medium"
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Showtimes Pills Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
                        {group.shows.map((show) =>
                          isAdmin ? (
                            <div
                              key={show._id}
                              title="Admins are not allowed to book movie tickets. Please use a customer account."
                              className="p-3 rounded-xl bg-cine-850/60 border border-white/5 text-center flex flex-col justify-between shadow-sm opacity-60 cursor-not-allowed select-none"
                            >
                              <div className="font-bold text-sm text-slate-300">
                                {show.startTime}
                              </div>
                              <div className="text-[10px] text-teal-400/80 font-bold mt-1 uppercase">
                                {show.format} • {show.language}
                              </div>
                              <div className="text-[10px] font-semibold text-rose-400 mt-2 pt-1 border-t border-white/5">
                                Booking Disabled
                              </div>
                            </div>
                          ) : (
                            <Link
                              key={show._id}
                              to={`/booking/${show._id}/seats`}
                              className="group p-3 rounded-xl bg-cine-800/90 hover:bg-violet-600/30 border border-white/10 hover:border-violet-500 transition-all text-center flex flex-col justify-between shadow-sm"
                            >
                              <div className="font-bold text-sm text-white group-hover:text-violet-300 transition-colors">
                                {show.startTime}
                              </div>
                              <div className="text-[10px] text-teal-400 font-bold mt-1 uppercase">
                                {show.format} • {show.language}
                              </div>
                              <div className="text-[11px] font-semibold text-slate-400 mt-2 pt-1 border-t border-white/5">
                                Starts ₹{show.pricing?.standard || 160}
                              </div>
                            </Link>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : isTodayShowsOver ? (
              /* BookMyShow Style: Today's shows have ended */
              <div className="p-8 sm:p-12 text-center rounded-2xl glass-panel border border-amber-500/30 bg-amber-500/5 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
                  <Clock className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Today's shows have ended</h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto mt-1.5 leading-relaxed">
                    All scheduled screenings for today have finished. Advance ticket booking is open for tomorrow and upcoming dates.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => setSelectedDate(tomorrowStr)}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-glow-violet transition"
                  >
                    View Tomorrow's Shows ({formatDisplayDate(tomorrowStr)})
                  </button>

                  {nextAvailableDate && nextAvailableDate !== tomorrowStr && (
                    <button
                      onClick={() => setSelectedDate(nextAvailableDate)}
                      className="px-4 py-2.5 rounded-xl bg-cine-800 hover:bg-cine-700 border border-white/10 text-slate-200 text-xs font-semibold transition"
                    >
                      Next Show: {formatDisplayDate(nextAvailableDate)}
                    </button>
                  )}
                </div>

                {availableDates.length > 0 && (
                  <div className="pt-3 border-t border-white/10 max-w-lg mx-auto">
                    <p className="text-[11px] text-slate-400 font-bold uppercase mb-2">
                      Other Available Dates:
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {availableDates.filter((d) => d > serverDate).map((d) => (
                        <button
                          key={d}
                          onClick={() => setSelectedDate(d)}
                          className="px-3 py-1 rounded-lg bg-cine-800 hover:bg-violet-600/30 border border-white/10 hover:border-violet-500 text-slate-300 hover:text-white text-xs font-semibold transition"
                        >
                          {formatDisplayDate(d)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Future Date: Showtimes not yet available for this date */
              <div className="p-8 sm:p-12 text-center rounded-2xl glass-panel border border-white/10 space-y-4">
                <Calendar className="w-12 h-12 text-slate-500 mx-auto" />
                <div>
                  <h3 className="text-lg font-bold text-white">Showtimes not yet available for this date.</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                    There are no scheduled showtimes on <span className="text-white font-semibold">{formatDisplayDate(selectedDate)}</span> in <span className="text-teal-400 font-semibold">{selectedCity}</span>.
                  </p>
                </div>

                {/* Helpful suggestion: Switch to dates that DO have shows */}
                {availableDates.length > 0 && (
                  <div className="pt-2 max-w-lg mx-auto">
                    <p className="text-xs text-slate-300 font-bold mb-2">
                      Dates with scheduled shows for {movie.title}:
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {availableDates.map((dateStr) => (
                        <button
                          key={dateStr}
                          onClick={() => setSelectedDate(dateStr)}
                          className="px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600 border border-violet-500/40 text-violet-300 hover:text-white text-xs font-bold transition"
                        >
                          {formatDisplayDate(dateStr)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Helpful suggestion: Switch city if other cities have shows */}
                {selectedCity && selectedCity !== 'All' && availableCities.length > 0 && (
                  <div className="pt-2">
                    <button
                      onClick={() => setSelectedCity('All')}
                      className="px-4 py-2 rounded-xl bg-cine-800 hover:bg-cine-700 border border-white/10 text-white font-bold text-xs transition"
                    >
                      View Shows in All Tamil Nadu Theatres
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Universal Trailer Modal */}
      <TrailerModal
        isOpen={trailerModalOpen}
        onClose={() => setTrailerModalOpen(false)}
        movie={movie}
      />
    </div>
  );
};

export default MovieDetailsPage;
