import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Ticket, Star, Sparkles, ChevronLeft, ChevronRight, X, Clapperboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import TrailerModal from '../trailers/TrailerModal';

const HeroBanner = ({ featuredMovies = [] }) => {
  const { isAdmin } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [trailerModalOpen, setTrailerModalOpen] = useState(false);

  if (!featuredMovies || featuredMovies.length === 0) return null;

  const currentMovie = featuredMovies[currentIndex] || featuredMovies[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 glass-panel shadow-2xl mb-12">
      {/* Background Banner with Layered Lighting */}
      <div className="relative h-[480px] sm:h-[520px] w-full">
        <img
          src={currentMovie.bannerUrl || currentMovie.bannerImage || currentMovie.posterUrl || currentMovie.poster || '/images/movies/fallback-poster.svg'}
          alt={`${currentMovie.title} banner artwork`}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = currentMovie.posterUrl || '/images/movies/fallback-poster.svg';
          }}
          className="w-full h-full object-cover object-center filter brightness-[0.65] transition-all duration-700"
        />

        {/* Cinematic Vignette Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-cine-950 via-cine-950/80 to-transparent w-full md:w-3/4" />
        <div className="absolute inset-0 bg-gradient-to-t from-cine-950 via-cine-950/40 to-transparent" />

        {/* Content Overlay */}
        <div className="absolute inset-0 max-w-7xl mx-auto px-6 sm:px-12 flex flex-col justify-center">
          <div className="max-w-xl space-y-4">
            {/* Top Trending Badge */}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-600/30 border border-violet-400/40 text-violet-300 text-xs font-bold uppercase tracking-wider shadow-glow-violet">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                Featured Premiere
              </span>
              <span className="px-2.5 py-1 rounded-full bg-black/50 text-slate-300 border border-white/10 text-xs font-bold uppercase">
                {currentMovie.certification || 'UA'}
              </span>
            </div>

            {/* Movie Title */}
            <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white leading-tight">
              {currentMovie.title}
            </h1>

            {/* Meta details */}
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold text-slate-300">
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>
                  {typeof currentMovie.rating === 'object'
                    ? currentMovie.rating?.average?.toFixed(1) || '8.8'
                    : currentMovie.rating
                    ? Number(currentMovie.rating).toFixed(1)
                    : '8.8'}
                  /10
                </span>
              </div>
              <span>•</span>
              <span>{currentMovie.duration || 150} mins</span>
              <span>•</span>
              <span>{(currentMovie.language || currentMovie.languages || ['Tamil'])?.join(', ')}</span>
              <span>•</span>
              <span className="text-teal-400 font-bold">
                {(currentMovie.formats || ['2D', '3D', 'IMAX 2D'])?.join(' | ')}
              </span>
            </div>

            {/* Synopsis */}
            <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed max-w-lg">
              {currentMovie.synopsis}
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {isAdmin ? (
                <Link
                  to={`/movies/${currentMovie._id}`}
                  className="px-6 py-3 rounded-xl bg-cine-800 hover:bg-cine-700 border border-white/10 text-white font-bold text-sm tracking-wide flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-md"
                >
                  <Clapperboard className="w-4 h-4 text-teal-400" />
                  <span>View Movie Details</span>
                </Link>
              ) : (
                <Link
                  to={`/movies/${currentMovie._id}`}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-teal-500 hover:from-violet-500 hover:to-teal-400 text-white font-bold text-sm tracking-wide flex items-center gap-2 shadow-glow-violet hover:scale-105 active:scale-95 transition-all"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Book Tickets</span>
                </Link>
              )}

              <button
                onClick={() => setTrailerModalOpen(true)}
                className={`px-5 py-3 rounded-xl border text-sm font-semibold flex items-center gap-2 backdrop-blur-md transition-all hover:scale-105 active:scale-95 shadow-md ${
                  currentMovie.trailerUrl || currentMovie.trailerVideoId
                    ? 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
                    : 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-300'
                }`}
                title={currentMovie.trailerUrl || currentMovie.trailerVideoId ? 'Play official theatrical trailer' : 'Official trailer not yet announced'}
              >
                <Play className={`w-4 h-4 ${currentMovie.trailerUrl || currentMovie.trailerVideoId ? 'fill-white' : 'text-rose-400'}`} />
                <span>{currentMovie.trailerUrl || currentMovie.trailerVideoId ? 'Watch Trailer' : 'Trailer Unavailable'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Controls */}
        {featuredMovies.length > 1 && (
          <div className="absolute bottom-6 right-6 sm:right-12 flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-2.5 rounded-full bg-black/60 hover:bg-violet-600 text-white border border-white/10 transition-colors shadow-lg"
              aria-label="Previous Featured Movie"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-2.5 rounded-full bg-black/60 hover:bg-violet-600 text-white border border-white/10 transition-colors shadow-lg"
              aria-label="Next Featured Movie"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Universal Trailer Modal */}
      <TrailerModal
        isOpen={trailerModalOpen}
        onClose={() => setTrailerModalOpen(false)}
        movie={currentMovie}
      />
    </div>
  );
};

export default HeroBanner;
