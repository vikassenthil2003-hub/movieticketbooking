import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Star, Clock, Trash2, ArrowRight, Play } from 'lucide-react';
import api from '../../services/api';
import TrailerModal from '../../components/trailers/TrailerModal';

const WatchlistPage = () => {
  const [watchlistMovies, setWatchlistMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMovieForTrailer, setActiveMovieForTrailer] = useState(null);
  const [trailerModalOpen, setTrailerModalOpen] = useState(false);

  const fetchWatchlist = async () => {
    try {
      const res = await api.get('/users/watchlist');
      setWatchlistMovies(res.data || []);
    } catch (err) {
      console.error('[Watchlist Error]:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleRemove = async (movieId) => {
    try {
      await api.post('/users/watchlist/toggle', { movieId });
      setWatchlistMovies((prev) => prev.filter((m) => m._id !== movieId));
    } catch (err) {
      alert(err.message || 'Failed to remove from watchlist');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black font-display text-white">My Movie Watchlist</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Saved films you want to experience in theatres
        </p>
      </div>

      {watchlistMovies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {watchlistMovies.map((movie) => (
            <div
              key={movie._id}
              className="p-4 rounded-2xl glass-card flex flex-col justify-between space-y-4"
            >
              <div className="flex gap-4">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-20 h-28 object-cover rounded-xl shadow-md border border-white/10 flex-shrink-0"
                />
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-white font-display line-clamp-1">{movie.title}</h3>
                  <div className="flex items-center gap-1 text-xs text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{movie.rating ? movie.rating.toFixed(1) : '8.8'}</span>
                  </div>
                  <p className="text-xs text-slate-400">{movie.duration}m • {movie.language?.join(', ')}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10 gap-2">
                <button
                  onClick={() => handleRemove(movie._id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Remove from watchlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveMovieForTrailer(movie);
                      setTrailerModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-semibold text-xs flex items-center gap-1 transition-colors"
                    title="Watch Official Trailer"
                  >
                    <Play className="w-3 h-3 fill-current text-violet-400" />
                    <span>Trailer</span>
                  </button>

                  <Link
                    to={`/movies/${movie._id}`}
                    className="px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-1 shadow-glow-violet transition-all"
                  >
                    <span>Book</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl glass-panel border border-white/10 space-y-4">
          <Bookmark className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">Your Watchlist is Empty</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Browse our movie catalogue and tap "Add to Watchlist" to bookmark films for later.
          </p>
          <Link
            to="/movies"
            className="inline-block px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-glow-violet transition-all"
          >
            Explore Movies
          </Link>
        </div>
      )}

      {/* Universal Trailer Modal */}
      <TrailerModal
        isOpen={trailerModalOpen}
        onClose={() => {
          setTrailerModalOpen(false);
          setActiveMovieForTrailer(null);
        }}
        movie={activeMovieForTrailer}
      />
    </div>
  );
};

export default WatchlistPage;
