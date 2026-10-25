import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Play, Ticket, ExternalLink, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';

/**
 * CineVerse AI — Universal Cinematic Trailer Modal
 * 
 * Safely embeds official YouTube trailers using youtube-nocookie.com,
 * supports keyboard navigation (Escape key), prevents background audio leaks
 * by disposing of the player immediately on close, and provides graceful
 * unavailable states.
 */
const TrailerModal = ({ isOpen, onClose, movie }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasPlaybackError, setHasPlaybackError] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling while modal is open & reset states
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsLoading(true);
      setHasPlaybackError(false);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !movie) return null;

  // Extract clean video ID
  const videoId =
    movie.trailerVideoId ||
    (movie.trailerUrl?.match(/(?:youtu\.be\/|(?:youtube\.com|youtube-nocookie\.com)\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i)?.[1] ||
      (movie.trailerUrl?.length === 11 ? movie.trailerUrl : null));

  const hasTrailer = Boolean(videoId);
  const embedUrl = hasTrailer
    ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`
    : null;

  const isNowShowing = movie.status === 'now_showing';
  const displayLanguage = Array.isArray(movie.language)
    ? movie.language.join(', ')
    : movie.language || 'Tamil';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="trailer-modal-title"
    >
      <div
        className="relative w-full max-w-4xl bg-cine-900 border border-white/15 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-cine-950/80 backdrop-blur-md">
          <div className="flex items-center gap-3 overflow-hidden pr-2">
            <div className="w-8 h-8 rounded-lg bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-violet-400 shrink-0">
              <Play className="w-4 h-4 fill-violet-400" />
            </div>
            <div className="truncate">
              <h2 id="trailer-modal-title" className="font-bold text-white text-sm sm:text-base truncate font-display">
                {movie.title}
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>{displayLanguage}</span>
                {movie.releaseDate && (
                  <>
                    <span>•</span>
                    <span>{new Date(movie.releaseDate).getFullYear()}</span>
                  </>
                )}
                {movie.trailerChannel && (
                  <>
                    <span>•</span>
                    <span className="text-teal-400 font-medium truncate max-w-[140px] sm:max-w-xs">
                      {movie.trailerChannel}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            aria-label="Close Trailer Player"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Area */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          {hasPlaybackError ? (
            <div className="p-8 text-center max-w-md space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">Playback Error</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Could not load video player in this browser session (video may be restricted by YouTube or browser privacy settings).
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => {
                    setHasPlaybackError(false);
                    setIsLoading(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-cine-800 hover:bg-cine-700 text-slate-200 border border-white/10 font-bold text-xs transition-colors"
                >
                  Retry Player
                </button>
                <a
                  href={movie.trailerUrl || `https://www.youtube.com/watch?v=${videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>Open on YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : hasTrailer ? (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3 z-10">
                  <div className="w-10 h-10 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-semibold text-slate-400">Loading official trailer...</span>
                </div>
              )}
              <iframe
                src={embedUrl}
                title={`${movie.title} Official Trailer`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setHasPlaybackError(true);
                }}
              />
            </>
          ) : (
            <div className="p-8 text-center max-w-md space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">Trailer Unavailable</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The official theatrical trailer for <strong className="text-white">{movie.title}</strong> has not yet been announced or verified. We never substitute random or unverified video clips.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Link
                  to={`/movies/${movie._id}`}
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition-colors"
                >
                  View Movie Details
                </Link>
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${movie.title} official trailer`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-cine-800 hover:bg-cine-700 text-slate-200 border border-white/10 font-medium text-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>Search on YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info & Actions */}
        <div className="px-5 py-3.5 border-t border-white/10 bg-cine-950/90 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            {movie.trailerStatus === 'verified' ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Official Theatrical Trailer</span>
              </span>
            ) : hasTrailer ? (
              <span className="flex items-center gap-1 text-[11px] font-medium text-slate-300 bg-slate-800/80 border border-white/10 px-2.5 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 text-teal-400" />
                <span>Trailer</span>
              </span>
            ) : null}
            {hasTrailer && (
              <a
                href={movie.trailerUrl || `https://www.youtube.com/watch?v=${videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] font-medium transition-colors"
                title="Open trailer directly on YouTube"
              >
                <span>YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <span className="hidden sm:inline text-slate-500">• Press Esc to close</span>
          </div>

          <div className="flex items-center gap-2">
            {isNowShowing ? (
              <Link
                to={`/movies/${movie._id}`}
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-glow-violet transition-all"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>Book Tickets</span>
              </Link>
            ) : (
              <Link
                to={`/movies/${movie._id}`}
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-cine-800 hover:bg-cine-700 text-slate-200 border border-white/10 font-bold text-xs transition-colors"
              >
                <span>View Details</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrailerModal;
