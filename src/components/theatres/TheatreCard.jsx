import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Navigation,
  Star,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Film,
  Calendar,
  Settings,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TheatreCard = ({ theatre, selectedDate }) => {
  const { isAdmin } = useAuth();
  const coordinates = theatre.location?.coordinates;
  const isVerified = theatre.verificationStatus === 'verified';
  const movies = theatre.movies || [];

  const directionsUrl =
    coordinates && coordinates.length >= 2
      ? `https://www.google.com/maps/search/?api=1&query=${coordinates[1]},${coordinates[0]}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          (theatre.name || '') + ' ' + (theatre.city || '') + ' ' + (theatre.state || 'India')
        )}`;

  return (
    <div className="p-5 sm:p-6 rounded-2xl glass-card flex flex-col justify-between h-full space-y-5 border border-white/10 hover:border-violet-500/30 transition-all">
      <div className="space-y-4">
        {/* Verification Status & Rating Bar */}
        <div className="flex items-center justify-between gap-2">
          {isVerified ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Verified Cinema</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
              <AlertCircle className="w-3 h-3 text-amber-400" />
              <span>Imported Record</span>
            </span>
          )}

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/40 border border-amber-400/30 text-amber-400 text-xs font-bold">
            <Star className="w-3 h-3 fill-amber-400" />
            <span>
              {typeof theatre.rating === 'object'
                ? theatre.rating?.average?.toFixed(1) || '4.5'
                : theatre.rating
                ? Number(theatre.rating).toFixed(1)
                : '4.5'}
            </span>
          </div>
        </div>

        {/* Theatre Title and District */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
            {theatre.brand || 'Cinema'} • {theatre.district ? `${theatre.district} Dist, ${theatre.state || 'India'}` : (theatre.state || 'India')}
          </span>
          <h3 className="text-lg font-bold text-white font-display mt-0.5">{theatre.name}</h3>
        </div>

        {/* Full Real Address */}
        <div className="flex items-start gap-2 text-xs text-slate-300">
          <MapPin className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
          <span>
            {theatre.address || theatre.addressLine || 'Cinema Complex'}, {theatre.city}
            {theatre.state ? `, ${theatre.state}` : ''}
            {theatre.pinCode || theatre.pincode ? ` — PIN: ${theatre.pinCode || theatre.pincode}` : ''}
          </span>
        </div>

        {/* Proximity Distance Badge */}
        {theatre.distanceKm !== undefined && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-[11px] font-bold">
            <Navigation className="w-3 h-3 text-teal-400" />
            <span>{theatre.distanceKm} km from selected location</span>
          </div>
        )}

        {/* Amenities */}
        <div className="flex flex-wrap gap-1.5">
          {theatre.amenities?.slice(0, 4).map((a) => (
            <span
              key={a}
              className="text-[10px] px-2 py-0.5 rounded bg-cine-700/60 text-slate-300 border border-white/5 font-medium"
            >
              {a}
            </span>
          ))}
        </div>

        {/* BookMyShow Style Inline Movies & Showtimes */}
        <div className="pt-3 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-violet-400" />
              <span>Now Playing ({movies.length})</span>
            </span>
            {movies.length > 0 && (
              <span className="text-[10px] font-semibold text-teal-400">
                {theatre.totalShowsCount || movies.reduce((a, m) => a + m.shows.length, 0)} shows
              </span>
            )}
          </div>

          {movies.length > 0 ? (
            <div className="space-y-3">
              {movies.slice(0, 3).map(({ movie, shows }) => (
                <div
                  key={movie._id}
                  className="p-3 rounded-xl bg-cine-900/80 border border-white/5 space-y-2 hover:border-white/10 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {movie.posterUrl && (
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          className="w-7 h-10 object-cover rounded shadow flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{movie.title}</h4>
                        <p className="text-[10px] text-slate-400 truncate">
                          {Array.isArray(movie.language) ? movie.language.join(', ') : movie.language || 'Tamil'} •{' '}
                          {movie.certification || 'UA'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Showtimes Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {shows.map((show) =>
                      isAdmin ? (
                        <div
                          key={show._id}
                          title="Admin accounts cannot book customer tickets."
                          className="px-2.5 py-1.5 rounded-lg bg-cine-800/40 border border-white/5 text-[11px] font-bold text-slate-400 cursor-not-allowed select-none"
                        >
                          <span>{show.startTime}</span>
                        </div>
                      ) : (
                        <Link
                          key={show._id}
                          to={`/booking/${show._id}/seats`}
                          className="px-2.5 py-1.5 rounded-lg bg-cine-800 hover:bg-violet-600/30 border border-white/10 hover:border-violet-500 text-[11px] font-bold text-white group flex items-center gap-1 transition-all shadow-sm"
                        >
                          <span className="group-hover:text-violet-300">{show.startTime}</span>
                          <span className="text-[9px] text-teal-400 font-semibold">{show.format}</span>
                        </Link>
                      )
                    )}
                  </div>
                </div>
              ))}

              {movies.length > 3 && (
                <p className="text-[11px] text-violet-400 font-semibold text-center pt-1">
                  + {movies.length - 3} more movies playing at this theatre
                </p>
              )}
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-cine-900/50 border border-white/5 text-center space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400 font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>Showtimes not yet configured</span>
              </div>
              <p className="text-[11px] text-slate-400">
                No active shows for this date. Check upcoming dates or configure schedules.
              </p>
              {isAdmin && (
                <Link
                  to={`/admin/shows?theatreId=${theatre._id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-bold transition-all"
                >
                  <Settings className="w-3 h-3" />
                  <span>Configure Schedule in Admin</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors font-medium"
        >
          <Navigation className="w-3.5 h-3.5 text-teal-400" />
          <span>Directions</span>
        </a>

        <Link
          to={`/theatres/${theatre._id}`}
          className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-glow-violet transition-all"
        >
          <span>All Shows</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default TheatreCard;
