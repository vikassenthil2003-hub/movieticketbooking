import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Play,
  Search,
  Film,
  Sparkles,
  Ticket,
  Clock,
  ShieldCheck,
  Filter,
  AlertCircle,
  Clapperboard,
  CheckCircle2,
} from 'lucide-react';
import api from '../../services/api';
import TrailerModal from '../../components/trailers/TrailerModal';
import TrailerThumbnail from '../../components/trailers/TrailerThumbnail';
import { MovieCardSkeleton } from '../../components/common/LoadingSkeleton';

const CATEGORIES = [
  { id: 'all', label: 'All Trailers' },
  { id: 'latest', label: 'Latest Trailers' },
  { id: 'tamil', label: 'Tamil Trailers' },
  { id: 'telugu', label: 'Telugu Trailers' },
  { id: 'hindi', label: 'Hindi Trailers' },
  { id: 'malayalam', label: 'Malayalam Trailers' },
  { id: 'kannada', label: 'Kannada Trailers' },
  { id: 'english', label: 'English Trailers' },
];

const GENRES = ['All', 'Action', 'Drama', 'Thriller', 'Comedy', 'Sci-Fi', 'Adventure', 'Crime', 'Horror'];

const WatchMoviePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialMovieId = searchParams.get('movie');

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });

  // Active trailer modal state
  const [activeMovie, setActiveMovie] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch movies from API
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          page,
          limit: 12,
          category: activeCategory,
        };
        if (selectedGenre !== 'All') params.genre = selectedGenre;
        if (searchQuery.trim()) params.search = searchQuery.trim();

        const res = await api.get('/trailers', { params });
        const rawList = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data?.movies)
          ? res.data.movies
          : Array.isArray(res)
          ? res
          : [];
        setMovies(rawList);

        const pageInfo = res?.pagination || res?.data?.pagination || res?.meta?.pagination || null;
        if (pageInfo) {
          setPagination(pageInfo);
        }

        // Auto-open modal if ?movie=ID was passed in URL query
        if (initialMovieId && !activeMovie) {
          const match = rawList.find((m) => m._id === initialMovieId);
          if (match) {
            setActiveMovie(match);
            setIsModalOpen(true);
          }
        }
      } catch (err) {
        console.error('[WatchMoviePage Error]:', err);
        setError('Failed to load movie trailers. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [activeCategory, selectedGenre, searchQuery, page, initialMovieId]);

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    setPage(1);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (catId === 'all') next.delete('category');
      else next.set('category', catId);
      return next;
    });
  };

  const handlePlayTrailer = (movie) => {
    setActiveMovie(movie);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setActiveMovie(null);
    if (searchParams.get('movie')) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete('movie');
        return next;
      });
    }
  };

  // Filtered counts
  const verifiedCount = useMemo(
    () => movies.filter((m) => m.trailerStatus === 'verified').length,
    [movies]
  );

  return (
    <div className="min-h-screen bg-cine-950 text-slate-100 pb-20">
      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-violet-950/40 via-cine-900/40 to-cine-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-600/15 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Watch Theatrical Trailers</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white">
                CineVerse <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-300 to-teal-300">Watch Movie</span>
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                Stream verified, high-definition official theatrical trailers across Tamil, Telugu, Malayalam, Kannada, Hindi, and English cinema. Directly choose showtimes and book your tickets in seconds.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-2.5 rounded-2xl glass-panel border border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Verified Trailers</div>
                  <div className="text-lg font-black text-white">{verifiedCount} Titles</div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-8 max-w-2xl">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search trailers by movie title, star, or director..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl glass-input text-sm text-white placeholder:text-slate-500 border border-white/10 focus:border-violet-500 transition-all shadow-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setPage(1);
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Language / Category Tabs */}
          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-glow-violet scale-105'
                      : 'bg-cine-900/80 text-slate-300 hover:bg-cine-800 border border-white/10'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Genre Filters */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5 mr-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Genre:
            </span>
            {GENRES.map((g) => (
              <button
                key={g}
                onClick={() => {
                  setSelectedGenre(g);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedGenre === g
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold'
                    : 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="py-16 text-center space-y-4 glass-panel max-w-lg mx-auto rounded-3xl border border-rose-500/20 p-8">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Error Loading Trailers</h3>
            <p className="text-xs text-slate-400">{error}</p>
            <button
              onClick={() => setActiveCategory('all')}
              className="px-5 py-2.5 rounded-xl bg-violet-600 text-white text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : movies.length === 0 ? (
          <div className="py-20 text-center space-y-4 glass-panel max-w-lg mx-auto rounded-3xl border border-white/10 p-8">
            <Film className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Trailers Found</h3>
            <p className="text-xs text-slate-400">
              No movie trailers matched your current search and filter criteria. Try searching for a different title or resetting the language tab.
            </p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setSelectedGenre('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.map((movie) => {
              const hasTrailer = Boolean(movie.trailerVideoId || movie.trailerUrl);
              const isVerified = movie.trailerStatus === 'verified';
              const displayLanguages = Array.isArray(movie.language)
                ? movie.language.join(', ')
                : movie.language || 'Tamil';
              const isNowShowing = movie.status === 'now_showing';

              return (
                <div
                  key={movie._id}
                  className="group relative rounded-2xl overflow-hidden glass-card flex flex-col h-full transition-all duration-300 hover:shadow-2xl hover:shadow-violet-600/15 border border-white/10 hover:border-violet-500/40"
                >
                  {/* Thumbnail / Poster Area with Multi-Resolution Fallback */}
                  <TrailerThumbnail
                    movie={movie}
                    onPlay={handlePlayTrailer}
                  />

                  {/* Movie Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-bold text-base text-white group-hover:text-violet-400 transition-colors line-clamp-1 font-display">
                        {movie.title}
                      </h3>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span className="truncate max-w-[140px] text-teal-300 font-semibold">{displayLanguages}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {movie.duration || 145}m
                        </span>
                      </div>

                      {/* Channel Info */}
                      {movie.trailerChannel && (
                        <div className="text-[11px] text-slate-400 truncate mt-1">
                          Channel: <span className="text-slate-300">{movie.trailerChannel}</span>
                        </div>
                      )}

                      {/* Genre Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {(Array.isArray(movie.genre) ? movie.genre : ['Action']).slice(0, 2).map((g) => (
                          <span
                            key={g}
                            className="text-[10px] px-2 py-0.5 rounded bg-cine-800 text-slate-300 border border-white/5 font-medium"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                      <button
                        onClick={() => handlePlayTrailer(movie)}
                        className="flex-1 py-2 px-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>{hasTrailer ? 'Watch Trailer' : 'View Status'}</span>
                      </button>

                      {isNowShowing ? (
                        <Link
                          to={`/movies/${movie._id}`}
                          className="py-2 px-3 rounded-xl bg-cine-800 hover:bg-cine-700 text-teal-300 border border-white/10 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                          title="Book Tickets"
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          <span>Book</span>
                        </Link>
                      ) : (
                        <Link
                          to={`/movies/${movie._id}`}
                          className="py-2 px-3 rounded-xl bg-cine-800 hover:bg-cine-700 text-slate-300 border border-white/10 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                          title="View Details"
                        >
                          <Clapperboard className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination & Lazy Loading Navigation */}
        {!loading && pagination.totalPages > 1 && (
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10 text-xs">
            <span className="text-slate-400">
              Showing Page <strong className="text-white">{page}</strong> of{' '}
              <strong className="text-white">{pagination.totalPages}</strong> ({pagination.total} Titles Available)
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 380, behavior: 'smooth' });
                }}
                disabled={page <= 1}
                className="px-4 py-2 rounded-xl bg-cine-900 border border-white/10 hover:bg-cine-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-all flex items-center gap-1.5"
              >
                <span>Previous</span>
              </button>

              {Array.from({ length: pagination.totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                const isActive = pageNum === page;
                return (
                  <button
                    key={pageNum}
                    onClick={() => {
                      setPage(pageNum);
                      window.scrollTo({ top: 380, behavior: 'smooth' });
                    }}
                    className={`w-8 h-8 rounded-xl font-bold transition-all ${
                      isActive
                        ? 'bg-violet-600 text-white shadow-glow-violet'
                        : 'bg-cine-900 border border-white/10 text-slate-300 hover:bg-cine-800'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => {
                  setPage((p) => Math.min(pagination.totalPages, p + 1));
                  window.scrollTo({ top: 380, behavior: 'smooth' });
                }}
                disabled={page >= pagination.totalPages}
                className="px-4 py-2 rounded-xl bg-cine-900 border border-white/10 hover:bg-cine-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-all flex items-center gap-1.5"
              >
                <span>Next</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Universal Modal */}
      <TrailerModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        movie={activeMovie}
      />
    </div>
  );
};

export default WatchMoviePage;
