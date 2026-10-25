import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, MapPin, Phone, Star, Navigation, Calendar, Ticket, Clock, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getLocalDateString, getDynamicDateTabs, formatDisplayDate, compareShowtimes } from '../../utils/dateUtils';

const TheatreDetailsPage = () => {
  const { theatreId } = useParams();
  const { isAdmin } = useAuth();
  const [theatre, setTheatre] = useState(null);
  const [shows, setShows] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString(0));
  const [todayShowsEnded, setTodayShowsEnded] = useState(false);
  const [serverDate, setServerDate] = useState(() => getLocalDateString(0));
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic Date Tabs for Today, Tomorrow, and subsequent dates
  const dateTabs = getDynamicDateTabs(7);

  useEffect(() => {
    const fetchTheatreData = async () => {
      // Prevent past dates
      const currentToday = getLocalDateString(0);
      if (selectedDate < currentToday) {
        setSelectedDate(currentToday);
        return;
      }

      setIsLoading(true);
      try {
        const [theatreRes, showsRes] = await Promise.all([
          api.get(`/theatres/${theatreId}`),
          api.get(`/shows?theatreId=${theatreId}&date=${selectedDate}`),
        ]);
        const thData = theatreRes.data?.data || theatreRes.data;
        const shData =
          showsRes.data?.data?.shows ||
          showsRes.data?.shows ||
          showsRes.data?.data ||
          (Array.isArray(showsRes.data) ? showsRes.data : []);

        setTheatre(thData);
        setShows(shData);
        setTodayShowsEnded(Boolean(showsRes.data?.data?.todayShowsEnded || showsRes.data?.todayShowsEnded));
        const serverDateVal = showsRes.data?.data?.serverDate || showsRes.data?.serverDate;
        if (serverDateVal) {
          setServerDate(serverDateVal);
        }
      } catch (err) {
        console.error('[Theatre Details Error]:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTheatreData();
  }, [theatreId, selectedDate]);

  if (isLoading || !theatre) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Group shows by Movie and sort chronologically
  const movieMap = new Map();
  shows.forEach((show) => {
    if (!show.movieId) return;
    const mid = show.movieId._id || show.movieId;
    if (!movieMap.has(mid)) {
      movieMap.set(mid, {
        movie: typeof show.movieId === 'object' ? show.movieId : { title: 'Featured Movie', _id: mid },
        shows: [],
      });
    }
    movieMap.get(mid).shows.push(show);
  });
  const groupedMovies = Array.from(movieMap.values()).map((g) => ({
    ...g,
    shows: g.shows.sort((a, b) => compareShowtimes(a.startTime, b.startTime)),
  }));

  const coordinates = theatre.location?.coordinates;
  const directionsUrl =
    coordinates && coordinates.length >= 2
      ? `https://www.google.com/maps/search/?api=1&query=${coordinates[1]},${coordinates[0]}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((theatre.name || '') + ' ' + (theatre.city || '') + ' Tamil Nadu')}`;

  const isVerified = theatre.verificationStatus === 'verified';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-9">
      {/* Theatre Card Hero */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                {theatre.brand || 'Cinema'} • {theatre.district ? `${theatre.district} District` : 'Tamil Nadu'}
              </span>

              {isVerified ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Verified Real Theatre</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  <AlertCircle className="w-3 h-3 text-amber-400" />
                  <span>Imported Directory Record</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black font-display text-white mt-1">
              {theatre.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2 mt-2">
              <MapPin className="w-4 h-4 text-violet-400 flex-shrink-0" />
              <span>
                {theatre.address}, {theatre.city}
                {theatre.pinCode ? ` — PIN: ${theatre.pinCode}` : ''}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-black/50 border border-amber-400/30 text-amber-400 text-sm font-bold">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{typeof theatre.rating === 'number' ? theatre.rating.toFixed(1) : '4.5'}</span>
            </div>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-glow-teal"
            >
              <Navigation className="w-4 h-4" />
              <span>Get Directions</span>
            </a>
          </div>
        </div>

        {/* Verification Note if available */}
        {theatre.verificationNotes && (
          <div className="p-3 rounded-xl bg-cine-800/60 border border-white/5 text-xs text-slate-300">
            <span className="font-semibold text-teal-300">Verification Notes: </span>
            {theatre.verificationNotes}
          </div>
        )}

        {/* Amenities */}
        <div className="pt-4 border-t border-white/10">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            Cinema Facilities & Amenities
          </div>
          <div className="flex flex-wrap gap-2">
            {theatre.amenities?.map((amenity) => (
              <span
                key={amenity}
                className="px-3 py-1 rounded-full bg-cine-800 text-xs text-slate-200 border border-white/10 font-medium"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Notice */}
      {isAdmin && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-200 text-xs">
          <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-amber-300">Admin Mode Active:</span>
            <p className="text-slate-300">
              Ticket booking and seat selection are disabled for administrator accounts. You can inspect theatre schedules, but customer booking requires a customer account.
            </p>
          </div>
        </div>
      )}

      {/* Date Selector */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold font-display text-white">Select Date</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Local theatre schedules in Asia/Kolkata
            </p>
          </div>
        </div>

        {/* BookMyShow Style Dynamic Date Tabs */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-thin">
          {dateTabs.map((tab) => {
            const isSelected = selectedDate === tab.dateStr;
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
                <span
                  className={`text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider ${
                    isSelected ? 'text-violet-100' : 'text-slate-400'
                  }`}
                >
                  {tab.shortDayName || tab.dayName}
                </span>

                <span className="text-lg sm:text-xl font-black leading-tight mt-0.5">
                  {tab.dayNum}
                </span>

                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    isSelected ? 'text-violet-200' : 'text-slate-400'
                  }`}
                >
                  {tab.monthName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Shows grouped by movie */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold font-display text-white">
          Now Playing on {formatDisplayDate(selectedDate)}
        </h2>

        {groupedMovies.length > 0 ? (
          <div className="space-y-6">
            {groupedMovies.map(({ movie, shows: movieShows }) => (
              <div
                key={movie._id}
                className="p-6 rounded-2xl glass-panel border border-white/10 flex flex-col md:flex-row gap-6 items-start"
              >
                {/* Movie Poster */}
                {movie.posterUrl && (
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-24 sm:w-28 aspect-[2/3] object-cover rounded-xl shadow-lg border border-white/10 flex-shrink-0"
                  />
                )}

                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-white font-display">{movie.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {Array.isArray(movie.language) ? movie.language.join(', ') : movie.language || 'Tamil'} • {movie.certification || 'UA'} • {movie.duration || '150'}m
                    </p>
                  </div>

                  {/* Showtimes Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5 pt-2">
                    {movieShows.map((show) =>
                      isAdmin ? (
                        <div
                          key={show._id}
                          title="Ticket booking is disabled for admin accounts. Please use a customer account."
                          className="p-2.5 rounded-xl bg-cine-800/40 border border-white/5 text-center cursor-not-allowed opacity-60 transition-all select-none"
                        >
                          <div className="text-sm font-bold text-slate-400">
                            {show.startTime}
                          </div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">
                            {show.format} • {show.language || 'Tamil'}
                          </div>
                        </div>
                      ) : (
                        <Link
                          key={show._id}
                          to={`/booking/${show._id}/seats`}
                          className="p-2.5 rounded-xl bg-cine-800/90 hover:bg-violet-600/30 border border-white/10 hover:border-violet-500 text-center transition-all shadow-sm group flex flex-col justify-between"
                        >
                          <div className="text-sm font-bold text-white group-hover:text-violet-300">
                            {show.startTime}
                          </div>
                          <div className="text-[10px] text-teal-400 font-bold uppercase mt-0.5">
                            {show.format} • {show.language || 'Tamil'}
                          </div>
                          {show.pricing?.standard && (
                            <div className="text-[10px] text-slate-400 font-medium mt-1 pt-1 border-t border-white/5">
                              Starts ₹{show.pricing.standard}
                            </div>
                          )}
                        </Link>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : selectedDate === serverDate && (todayShowsEnded || groupedMovies.length === 0) ? (
          /* BookMyShow Style: Today's shows have ended */
          <div className="p-8 sm:p-12 text-center rounded-2xl glass-panel border border-amber-500/30 bg-amber-500/5 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Today's shows have ended</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto mt-1.5 leading-relaxed">
                All scheduled screenings for today at <span className="text-white font-semibold">{theatre.name}</span> have concluded. Advance booking is available for tomorrow and future dates.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setSelectedDate(getLocalDateString(1))}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-glow-violet transition"
              >
                View Tomorrow's Shows ({formatDisplayDate(getLocalDateString(1))})
              </button>
              <Link
                to="/theatres"
                className="px-4 py-2.5 rounded-xl bg-cine-800 hover:bg-cine-700 border border-white/10 text-white font-bold text-xs transition"
              >
                Browse All {theatre.district} Theatres
              </Link>
            </div>
          </div>
        ) : (
          /* Future Date: Showtimes not yet available for this date */
          <div className="p-12 text-center rounded-2xl glass-panel border border-white/10 space-y-3">
            <Building2 className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">Showtimes not yet available for this date.</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              There are no live showtimes configured for {theatre.name} on {formatDisplayDate(selectedDate)}. Check back soon or select another date.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setSelectedDate(getLocalDateString(0))}
                className="px-4 py-2 rounded-xl bg-cine-800 hover:bg-cine-700 border border-white/10 text-white font-bold text-xs transition"
              >
                View Today
              </button>
              <button
                onClick={() => setSelectedDate(getLocalDateString(1))}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-glow-violet transition"
              >
                View Tomorrow
              </button>
              {isAdmin && (
                <Link
                  to={`/admin/shows?theatreId=${theatre._id}`}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs transition flex items-center gap-1.5"
                >
                  <span>Configure Schedule in Admin</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TheatreDetailsPage;
