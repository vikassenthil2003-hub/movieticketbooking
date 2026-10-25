import React, { useState, useMemo } from 'react';
import { Play, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';

const FALLBACK_SVG = '/images/movies/fallback-poster.svg';

/**
 * CineVerse AI — Resilient Movie Trailer Thumbnail Component
 * 
 * Sequentially attempts YouTube resolution thumbnails:
 * maxresdefault.jpg (1280x720) -> hqdefault.jpg (480x360) -> mqdefault.jpg (320x180)
 * and gracefully falls back to movie bannerUrl, posterUrl, or SVG.
 * Completely eliminates grey default placeholders.
 */
const TrailerThumbnail = ({
  movie,
  className = '',
  aspectRatio = 'aspect-[16/10] sm:aspect-[16/9]',
  showBadges = true,
  showPlayButton = true,
  onPlay,
}) => {
  if (!movie) return null;

  const videoId =
    movie.trailerVideoId ||
    (movie.trailerUrl?.match(/(?:youtu\.be\/|(?:youtube\.com|youtube-nocookie\.com)\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i)?.[1] ||
      (movie.trailerUrl?.length === 11 ? movie.trailerUrl : null));

  const hasTrailer = Boolean(videoId && movie.trailerStatus !== 'missing' && movie.trailerStatus !== 'error');
  const isVerified = movie.trailerStatus === 'verified' || movie.isOfficial === true;

  // Build cascade of candidate URLs
  const candidateUrls = useMemo(() => {
    const list = [];
    if (movie.trailerThumbnail) list.push(movie.trailerThumbnail);
    if (videoId) {
      list.push(`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`);
      list.push(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`);
      list.push(`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`);
    }
    if (movie.bannerUrl) list.push(movie.bannerUrl);
    if (movie.posterUrl) list.push(movie.posterUrl);
    list.push(FALLBACK_SVG);

    // Filter duplicates while preserving order
    return [...new Set(list.filter(Boolean))];
  }, [movie.trailerThumbnail, videoId, movie.bannerUrl, movie.posterUrl]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);

  const currentSrc = candidateUrls[currentIndex] || movie.posterUrl || FALLBACK_SVG;

  const handleImageError = () => {
    if (currentIndex < candidateUrls.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleImageLoad = (e) => {
    // Detect YouTube's 120x90 empty image return when maxres is unavailable
    const img = e.currentTarget;
    if (img.naturalWidth > 0 && img.naturalWidth <= 120 && img.naturalHeight <= 90 && currentIndex < candidateUrls.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }
    setHasLoaded(true);
  };

  return (
    <div className={`relative ${aspectRatio} w-full overflow-hidden bg-cine-900 ${className}`}>
      {/* Background Image */}
      <img
        src={currentSrc}
        alt={`${movie.title} trailer preview`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
          hasLoaded ? 'opacity-100' : 'opacity-80'
        }`}
        loading="lazy"
        decoding="async"
      />

      {/* Cinematic Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-cine-950 via-black/40 to-black/20 pointer-events-none" />

      {/* Badges per Specification */}
      {showBadges && (
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          {isVerified ? (
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/85 backdrop-blur-md text-[10px] font-extrabold text-white flex items-center gap-1 shadow-sm">
              <CheckCircle2 className="w-3 h-3" />
              <span>Official Trailer</span>
            </span>
          ) : hasTrailer ? (
            <span className="px-2 py-0.5 rounded-md bg-slate-800/85 backdrop-blur-md text-[10px] font-extrabold text-slate-100 flex items-center gap-1 shadow-sm border border-white/10">
              <Sparkles className="w-3 h-3 text-teal-400" />
              <span>Trailer</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-rose-600/85 backdrop-blur-md text-[10px] font-extrabold text-white flex items-center gap-1 shadow-sm">
              <AlertCircle className="w-3 h-3" />
              <span>Trailer unavailable</span>
            </span>
          )}
        </div>
      )}

      {/* Release Year Badge */}
      {showBadges && movie.releaseDate && (
        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-white border border-white/10 z-10">
          {new Date(movie.releaseDate).getFullYear()}
        </div>
      )}

      {/* Play Button Overlay */}
      {showPlayButton && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onPlay) onPlay(movie);
          }}
          className="absolute inset-0 flex items-center justify-center group/btn z-10"
          aria-label={`Play ${movie.title} trailer`}
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-300 ${
              hasTrailer
                ? 'bg-violet-600/90 text-white shadow-glow-violet group-hover/btn:scale-115'
                : 'bg-black/60 text-slate-300 border border-white/20 group-hover/btn:scale-105'
            }`}
          >
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
        </button>
      )}
    </div>
  );
};

export default TrailerThumbnail;
