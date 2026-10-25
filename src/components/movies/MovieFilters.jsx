import React from 'react';
import { Filter, SlidersHorizontal } from 'lucide-react';

const MovieFilters = ({
  genres = [],
  languages = [],
  selectedGenre,
  onSelectGenre,
  selectedLanguage,
  onSelectLanguage,
  selectedStatus,
  onSelectStatus,
  sortBy,
  onSelectSort,
}) => {
  return (
    <div className="p-4 sm:p-6 rounded-2xl glass-panel border border-white/10 space-y-5 mb-8">
      {/* Top Status Tabs and Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        {/* Status Switcher */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-cine-800/80 border border-white/10 self-start">
          <button
            onClick={() => onSelectStatus('now_showing')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              selectedStatus === 'now_showing'
                ? 'bg-violet-600 text-white shadow-glow-violet'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Now Showing
          </button>
          <button
            onClick={() => onSelectStatus('coming_soon')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              selectedStatus === 'coming_soon'
                ? 'bg-violet-600 text-white shadow-glow-violet'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Coming Soon
          </button>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400 font-medium">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => onSelectSort(e.target.value)}
            className="px-3 py-1.5 rounded-lg glass-input text-xs font-semibold focus:outline-none"
          >
            <option value="popularity">Most Popular</option>
            <option value="rating">Top Rated</option>
            <option value="releaseDate">Release Date</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Languages Pills */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Language
        </div>
        <div className="flex flex-wrap gap-2">
          {['All', ...languages].map((lang) => {
            const isSelected = selectedLanguage === lang;
            return (
              <button
                key={lang}
                onClick={() => onSelectLanguage(lang)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-teal-500 text-white shadow-glow-teal'
                    : 'bg-cine-800 hover:bg-cine-700 text-slate-300 border border-white/5'
                }`}
              >
                {lang}
              </button>
            );
          })}
        </div>
      </div>

      {/* Genres Pills */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Genre
        </div>
        <div className="flex flex-wrap gap-2">
          {['All', ...genres].map((g) => {
            const isSelected = selectedGenre === g;
            return (
              <button
                key={g}
                onClick={() => onSelectGenre(g)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-violet-600 text-white shadow-glow-violet'
                    : 'bg-cine-800 hover:bg-cine-700 text-slate-300 border border-white/5'
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MovieFilters;
