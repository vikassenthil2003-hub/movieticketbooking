import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Ticket, Clapperboard, Play, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import TrailerModal from '../trailers/TrailerModal';

const DEFAULT_POSTER = '/images/movies/fallback-poster.svg';

const MovieCard = ({ movie }) => {
  const { isAdmin } = useAuth();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [trailerModalOpen, setTrailerModalOpen] = useState(false);

  const displayLanguages = Array.isArray(movie.language)
    ? movie.language.join(', ')
    : Array.isArray(movie.languages)
    ? movie.languages.join(', ')
    : typeof movie.language === 'string'
    ? movie.language
    : 'Tamil';

  const displayGenres = Array.isArray(movie.genre)
    ? movie.genre
    : Array.isArray(movie.genres)
    ? movie.genres
    : typeof movie.genre === 'string'
    ? movie.genre.split(' ')
    : ['Action'];

  const isComingSoon = movie.status === 'coming_soon';

  return (
    <div className="group relative rounded-2xl overflow-hidden glass-card flex flex-col h-full transition-all duration-300 hover:shadow-2xl hover:shadow-violet-600/10">
      {/* Poster Container with explicit 2:3 ratio */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-cine-800">
        {!imgLoaded && !hasError && (
          <div className="absolute inset-0 bg-cine-800 animate-pulse flex items-center justify-center">
            <span className="text-xs text-slate-500 font-semibold">Loading poster...</span>
          </div>
        )}

        <img
          src={hasError ? DEFAULT_POSTER : (movie.posterUrl || movie.poster || DEFAULT_POSTER)}
          alt={`${movie.title} official movie poster`}
          onLoad={() => setImgLoaded(true)}
          onError={() => {
            setHasError(true);
            setImgLoaded(true);
          }}
          className={`w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-500 ${
            imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          loading="lazy"
          decoding="async"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-cine-900 via-transparent to-black/30 opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[11px] font-bold text-white border border-white/10 uppercase">
            {movie.certification || 'UA'}
          </span>

          <div className="flex items-center gap-1.5">
            {isComingSoon && (
              <span className="px-2 py-0.5 rounded-md bg-violet-600/80 backdrop-blur-md text-[10px] font-extrabold text-white border border-violet-400/30 uppercase tracking-wide">
                Coming Soon
              </span>
            )}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[11px] font-bold text-amber-400 border border-amber-400/20 shadow-sm">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>
                {typeof movie.rating === 'object'
                  ? movie.rating?.average?.toFixed(1) || '8.5'
                  : movie.rating
                  ? Number(movie.rating).toFixed(1)
                  : '8.5'}
              </span>
            </div>
          </div>
        </div>

        {/* Hover Quick Action */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 backdrop-blur-[2px] gap-2">
          <button
            onClick={() => setTrailerModalOpen(true)}
            className="w-full py-2 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 backdrop-blur-md transition-all border border-white/20 shadow-md"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Watch Trailer</span>
          </button>

          <Link
            to={`/movies/${movie._id}`}
            className="w-full py-2 px-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-glow-violet transition-all"
          >
            {isAdmin ? <Clapperboard className="w-3.5 h-3.5" /> : <Ticket className="w-3.5 h-3.5" />}
            <span>{isAdmin ? 'View Details' : isComingSoon ? 'View Details' : 'Select Showtime'}</span>
          </Link>
        </div>
      </div>

      {/* Info Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-base text-white group-hover:text-violet-400 transition-colors line-clamp-1 font-display">
            {movie.title}
          </h3>

          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span className="truncate max-w-[150px]">{displayLanguages}</span>
            <span>•</span>
            <span className="flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3" />
              {movie.duration || 145}m
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {displayGenres.slice(0, 2).map((g) => (
              <span
                key={g}
                className="text-[10px] px-2 py-0.5 rounded bg-cine-700/60 text-slate-300 border border-white/5 font-medium"
              >
                {g}
              </span>
            ))}
            {(Array.isArray(movie.formats) ? movie.formats : ['2D', '3D']).slice(0, 2).map((fmt) => (
              <span
                key={fmt}
                className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 font-bold"
              >
                {fmt}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom CTA Bar */}
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
          <button
            onClick={() => setTrailerModalOpen(true)}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-semibold text-[11px] flex items-center gap-1 transition-colors"
            title="Watch Official Trailer"
          >
            <Play className="w-3 h-3 fill-current text-violet-400" />
            <span>Trailer</span>
          </button>

          <Link
            to={`/movies/${movie._id}`}
            className="px-3 py-1.5 rounded-lg bg-violet-600/30 hover:bg-violet-600 text-violet-300 hover:text-white font-bold text-[11px] flex items-center gap-1 transition-all"
          >
            {isAdmin ? <Clapperboard className="w-3 h-3" /> : <Ticket className="w-3 h-3" />}
            <span>{isAdmin ? 'Details' : isComingSoon ? 'Details' : 'Book'}</span>
          </Link>
        </div>
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

export default MovieCard;
