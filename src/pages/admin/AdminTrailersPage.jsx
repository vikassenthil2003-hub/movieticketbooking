import React, { useState, useEffect } from 'react';
import {
  Film,
  Search,
  RefreshCw,
  Play,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Trash2,
  Edit,
  ExternalLink,
  SlidersHorizontal,
  Key,
  Layers,
  HelpCircle,
  X,
  Wrench,
} from 'lucide-react';
import api from '../../services/api';
import TrailerModal from '../../components/trailers/TrailerModal';
import TrailerThumbnail from '../../components/trailers/TrailerThumbnail';

const AdminTrailersPage = () => {
  const [movies, setMovies] = useState([]);
  const [stats, setStats] = useState(null);
  const [configStatus, setConfigStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Preview Modal
  const [previewMovie, setPreviewMovie] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Manual Edit Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedMovieForEdit, setSelectedMovieForEdit] = useState(null);
  const [editForm, setEditForm] = useState({
    trailerUrl: '',
    trailerVideoId: '',
    trailerTitle: '',
    trailerChannel: '',
    status: 'verified',
    notes: '',
  });
  const [editSaving, setEditSaving] = useState(false);

  // Bulk Sync Modal
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkResults, setBulkResults] = useState(null);
  const [bulkOverwrite, setBulkOverwrite] = useState(false);

  // Bulk Repair Modal & Candidates
  const [bulkRepairModalOpen, setBulkRepairModalOpen] = useState(false);
  const [bulkRepairRunning, setBulkRepairRunning] = useState(false);
  const [bulkRepairResults, setBulkRepairResults] = useState(null);
  const [bulkRepairForceRecheck, setBulkRepairForceRecheck] = useState(false);
  const [approvedCandidateIds, setApprovedCandidateIds] = useState(new Set());

  // Single movie search candidate modal
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchingMovie, setSearchingMovie] = useState(null);
  const [searchCandidate, setSearchCandidate] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [moviesRes, statsRes, configRes] = await Promise.all([
        api.get('/movies?limit=100'),
        api.get('/trailers/admin/stats').catch(() => null),
        api.get('/trailers/config-status').catch(() => null),
      ]);

      const moviesData = Array.isArray(moviesRes?.data)
        ? moviesRes.data
        : Array.isArray(moviesRes?.data?.data)
        ? moviesRes.data.data
        : Array.isArray(moviesRes)
        ? moviesRes
        : [];
      setMovies(moviesData);

      const statsData = statsRes?.data?.totalMovies !== undefined
        ? statsRes.data
        : statsRes?.data?.data || statsRes || null;
      if (statsData) setStats(statsData);

      const configData = configRes?.data?.youtubeApiConfigured !== undefined
        ? configRes.data
        : configRes?.data?.data || configRes || null;
      if (configData) setConfigStatus(configData);
    } catch (err) {
      console.error('[AdminTrailersPage Error]:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load trailer directory data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter movies
  const filteredMovies = movies.filter((m) => {
    if (statusFilter !== 'all') {
      const st = m.trailerStatus || (m.trailerUrl ? 'needs_review' : 'missing');
      if (st !== statusFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = m.title?.toLowerCase().includes(q);
      const matchDir = m.director?.toLowerCase().includes(q);
      const matchChannel = m.trailerChannel?.toLowerCase().includes(q);
      if (!matchTitle && !matchDir && !matchChannel) return false;
    }
    return true;
  });

  // Open Edit Modal
  const handleOpenEdit = (movie) => {
    setSelectedMovieForEdit(movie);
    setEditForm({
      trailerUrl: movie.trailerUrl || '',
      trailerVideoId: movie.trailerVideoId || '',
      trailerTitle: movie.trailerTitle || `${movie.title} — Official Trailer`,
      trailerChannel: movie.trailerChannel || '',
      status: movie.trailerStatus || 'verified',
      notes: movie.trailerNotes || '',
    });
    setEditModalOpen(true);
  };

  // Submit Manual Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedMovieForEdit) return;

    try {
      setEditSaving(true);
      const res = await api.put(`/trailers/${selectedMovieForEdit._id}/assign`, editForm);
      const updated = res?.data?.movie || res?.data || res;

      if (updated && updated._id) {
        setMovies((prev) => prev.map((m) => (m._id === updated._id ? updated : m)));
      } else {
        await fetchData();
      }
      setEditModalOpen(false);
      setSelectedMovieForEdit(null);
      // Refresh stats
      api.get('/trailers/admin/stats').then((s) => {
        const sd = s?.data?.totalMovies !== undefined ? s.data : s?.data?.data || s || null;
        if (sd) setStats(sd);
      }).catch(() => {});
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to update trailer URL.');
    } finally {
      setEditSaving(false);
    }
  };

  // Remove Trailer
  const handleRemoveTrailer = async (movie) => {
    if (!window.confirm(`Are you sure you want to remove the trailer for "${movie.title}"?`)) {
      return;
    }

    try {
      const res = await api.delete(`/trailers/${movie._id}`);
      const updated = res?.data?.movie || res?.data || res;
      if (updated && updated._id) {
        setMovies((prev) => prev.map((m) => (m._id === updated._id ? updated : m)));
      } else {
        await fetchData();
      }
      api.get('/trailers/admin/stats').then((s) => {
        const sd = s?.data?.totalMovies !== undefined ? s.data : s?.data?.data || s || null;
        if (sd) setStats(sd);
      }).catch(() => {});
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove trailer.');
    }
  };

  // Single Search YouTube / Registry
  const handleSearchSingle = async (movie) => {
    setSearchingMovie(movie);
    setIsSearching(true);
    setSearchCandidate(null);
    setSearchModalOpen(true);

    try {
      const res = await api.post(`/trailers/${movie._id}/search`, { forceLiveSearch: true });
      const searchResult = res?.data?.searchResult || res?.data?.data?.searchResult || res?.searchResult || res?.data;
      setSearchCandidate(searchResult);
    } catch (err) {
      setSearchCandidate({
        success: false,
        message: err.response?.data?.message || 'Search request failed.',
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Approve Search Candidate
  const handleApproveCandidate = async () => {
    if (!searchingMovie || !searchCandidate?.videoId) return;

    try {
      const res = await api.put(`/trailers/${searchingMovie._id}/assign`, {
        trailerUrl: searchCandidate.trailerUrl,
        trailerVideoId: searchCandidate.videoId,
        trailerTitle: searchCandidate.title,
        trailerChannel: searchCandidate.channelTitle,
        status: 'verified',
      });
      const updated = res?.data?.movie || res?.data || res;
      if (updated && updated._id) {
        setMovies((prev) => prev.map((m) => (m._id === updated._id ? updated : m)));
      } else {
        await fetchData();
      }
      setSearchModalOpen(false);
      setSearchingMovie(null);
      api.get('/trailers/admin/stats').then((s) => {
        const sd = s?.data?.totalMovies !== undefined ? s.data : s?.data?.data || s || null;
        if (sd) setStats(sd);
      }).catch(() => {});
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign candidate trailer.');
    }
  };

  // Run Bulk Sync
  const handleRunBulkSync = async () => {
    try {
      setBulkRunning(true);
      setBulkResults(null);

      const res = await api.post('/trailers/admin/bulk-sync', { overwrite: bulkOverwrite });
      const bulkData = res?.data?.bulkResult || res?.data || res;
      setBulkResults(bulkData);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Bulk sync encountered an error.');
    } finally {
      setBulkRunning(false);
    }
  };

  // Run Bulk Repair (previewOnly = true for scan/preview, false for commit)
  const handleRunBulkRepair = async (previewOnly = true, movieIdsToApply = null) => {
    try {
      setBulkRepairRunning(true);
      const payload = {
        previewOnly,
        forceRecheck: bulkRepairForceRecheck,
      };
      if (movieIdsToApply && movieIdsToApply.length > 0) {
        payload.approvedMovieIds = movieIdsToApply;
      } else if (!previewOnly && approvedCandidateIds.size > 0) {
        payload.approvedMovieIds = Array.from(approvedCandidateIds);
      }

      const res = await api.post('/trailers/admin/bulk-repair', payload);
      const data = res?.data?.data || res?.data || res;
      setBulkRepairResults(data);

      if (data?.logs) {
        // Pre-select non-uncertain candidates
        const autoApproved = new Set();
        data.logs.forEach((lg) => {
          if (lg.candidate && !lg.isUncertain) {
            autoApproved.add(String(lg.movieId));
          }
        });
        setApprovedCandidateIds(autoApproved);
      }

      if (!previewOnly) {
        await fetchData();
        api.get('/trailers/admin/stats').then((s) => {
          const sd = s?.data?.totalMovies !== undefined ? s.data : s?.data?.data || s || null;
          if (sd) setStats(sd);
        }).catch(() => {});
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Bulk repair request failed.');
    } finally {
      setBulkRepairRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-display text-white">Trailer Manager</h1>
          <p className="text-xs text-navy-300">
            Audit, verify, search, and synchronize official cinema trailers across all 6 Indian languages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setBulkRepairResults(null);
              setBulkRepairModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-accent-primary hover:bg-accent-secondary text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-accent-primary/20 transition-colors"
          >
            <Wrench className="w-4 h-4" />
            <span>Bulk Repair Trailers</span>
          </button>
          <button
            onClick={() => {
              setBulkResults(null);
              setBulkModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-navy-200 text-xs font-bold flex items-center gap-2 border border-white/10 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Bulk Sync</span>
          </button>
        </div>
      </div>

      {/* YouTube API / Configuration Status Banner */}
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
          configStatus?.youtubeApiConfigured
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
              configStatus?.youtubeApiConfigured
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-amber-500/20 text-amber-400'
            }`}
          >
            <Key className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white flex items-center gap-2">
              <span>{configStatus?.youtubeApiConfigured ? 'YouTube Data API v3 Active' : 'Fallback Mode: Verified Cinema Registry Active'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase bg-black/40">
                {configStatus?.mode || 'Offline Curated'}
              </span>
            </div>
            <p className="text-slate-300 text-[11px] mt-0.5">
              {configStatus?.message ||
                'Official high-confidence verified trailers are sourced from the built-in authentic cinema registry.'}
            </p>
          </div>
        </div>

        {!configStatus?.youtubeApiConfigured && (
          <div className="text-[11px] text-amber-200/90 bg-black/30 px-3 py-1.5 rounded-lg border border-white/5 shrink-0">
            Set <code className="text-white font-mono">YOUTUBE_API_KEY</code> in <code className="text-white font-mono">backend/.env</code> for live YouTube search.
          </div>
        )}
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="glass-panel p-3.5 rounded-2xl border border-white/10 space-y-1">
          <div className="text-[10px] text-navy-400 font-semibold uppercase tracking-wider">Total Movies</div>
          <div className="text-xl sm:text-2xl font-black text-white">{stats?.totalMovies ?? movies.length}</div>
        </div>
        <div className="glass-panel p-3.5 rounded-2xl border border-white/10 space-y-1">
          <div className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Official
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400">{stats?.verifiedCount ?? 0}</div>
        </div>
        <div className="glass-panel p-3.5 rounded-2xl border border-white/10 space-y-1">
          <div className="text-[10px] text-teal-400 font-semibold uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Neutral
          </div>
          <div className="text-xl sm:text-2xl font-black text-teal-400">{stats?.availableCount ?? 0}</div>
        </div>
        <div className="glass-panel p-3.5 rounded-2xl border border-white/10 space-y-1">
          <div className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Review
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-400">{stats?.needsReviewCount ?? 0}</div>
        </div>
        <div className="glass-panel p-3.5 rounded-2xl border border-white/10 space-y-1">
          <div className="text-[10px] text-rose-400 font-semibold uppercase tracking-wider flex items-center gap-1">
            <X className="w-3.5 h-3.5" /> Missing
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-400">{stats?.missingCount ?? 0}</div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movie title, director, or channel..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-navy-950 border border-navy-800 text-xs text-white placeholder:text-navy-500 focus:border-accent-primary"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 text-xs">
          {[
            { id: 'all', label: 'All Titles' },
            { id: 'verified', label: 'Official Only' },
            { id: 'available', label: 'Neutral Trailers' },
            { id: 'needs_review', label: 'Needs Review' },
            { id: 'missing', label: 'Missing Trailer' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st.id
                  ? 'bg-accent-primary text-white'
                  : 'bg-navy-800 text-navy-300 hover:text-white'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Movie Directory Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-navy-800 bg-navy-950/60 text-navy-400 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-3 px-4">Movie</th>
                <th className="py-3 px-4">Language & Year</th>
                <th className="py-3 px-4">Trailer Status</th>
                <th className="py-3 px-4">YouTube ID / Channel</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-navy-400">
                    <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading trailer catalogue...
                  </td>
                </tr>
              ) : filteredMovies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-navy-400">
                    No movies found matching current filter.
                  </td>
                </tr>
              ) : (
                filteredMovies.map((movie) => {
                  const status = movie.trailerStatus || (movie.trailerUrl ? 'needs_review' : 'missing');
                  const hasVideo = Boolean(movie.trailerVideoId || movie.trailerUrl);

                  return (
                    <tr key={movie._id} className="hover:bg-white/5 transition-colors">
                      {/* Movie Poster & Title */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={movie.posterUrl || '/images/movies/fallback-poster.svg'}
                            alt={movie.title}
                            onError={(e) => {
                              e.currentTarget.src = '/images/movies/fallback-poster.svg';
                            }}
                            className="w-10 h-14 object-cover rounded-lg bg-navy-800 border border-white/5 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-white text-sm line-clamp-1">{movie.title}</div>
                            <div className="text-[11px] text-navy-400 line-clamp-1">
                              Dir: {movie.director || 'Director'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Language & Year */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-white font-medium">
                          {Array.isArray(movie.language) ? movie.language.join(', ') : movie.language}
                        </div>
                        <div className="text-navy-400 text-[11px]">
                          {movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : '—'} • {movie.duration || 145}m
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {status === 'verified' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verified Official</span>
                          </span>
                        )}
                        {status === 'available' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-300 border border-teal-500/30">
                            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                            <span>Neutral Trailer</span>
                          </span>
                        )}
                        {status === 'needs_review' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Needs Review</span>
                          </span>
                        )}
                        {status === 'missing' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Missing</span>
                          </span>
                        )}
                      </td>

                      {/* Video ID & Channel */}
                      <td className="py-3 px-4">
                        {hasVideo ? (
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-9 rounded-lg overflow-hidden bg-navy-950 border border-white/10 shrink-0">
                              <TrailerThumbnail
                                movie={movie}
                                showBadges={false}
                                showPlayButton={false}
                                aspectRatio="aspect-video"
                                className="w-full h-full"
                              />
                            </div>
                            <div className="space-y-0.5 min-w-0">
                              <div className="font-mono text-[11px] text-teal-300 font-semibold flex items-center gap-1">
                                <span className="truncate">{movie.trailerVideoId || '—'}</span>
                                <a
                                  href={movie.trailerUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-navy-400 hover:text-white shrink-0"
                                  title="Open on YouTube"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                              <div className="text-[10px] text-navy-400 truncate max-w-[170px]">
                                {movie.trailerChannel || movie.trailerTitle || 'Official Trailer'}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-navy-500 italic text-[11px]">No video assigned</span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Preview Player */}
                          <button
                            onClick={() => {
                              setPreviewMovie(movie);
                              setIsPreviewOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-navy-800 hover:bg-violet-600 hover:text-white text-navy-300 transition-colors"
                            title="Preview Trailer Player"
                          >
                            <Play className="w-4 h-4 fill-current" />
                          </button>

                          {/* Search YouTube Action */}
                          <button
                            onClick={() => handleSearchSingle(movie)}
                            className="p-1.5 rounded-lg bg-navy-800 hover:bg-indigo-600 hover:text-white text-indigo-300 transition-colors"
                            title="Search Official Trailer"
                          >
                            <Search className="w-4 h-4" />
                          </button>

                          {/* Manual Edit URL */}
                          <button
                            onClick={() => handleOpenEdit(movie)}
                            className="p-1.5 rounded-lg bg-navy-800 hover:bg-teal-600 hover:text-white text-teal-300 transition-colors"
                            title="Edit Trailer URL"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Remove Trailer */}
                          {hasVideo && (
                            <button
                              onClick={() => handleRemoveTrailer(movie)}
                              className="p-1.5 rounded-lg bg-navy-800 hover:bg-rose-600 hover:text-white text-rose-400 transition-colors"
                              title="Remove Trailer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Universal Preview Modal */}
      <TrailerModal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewMovie(null);
        }}
        movie={previewMovie}
      />

      {/* Manual Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-navy-900 border border-navy-700 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h3 className="font-bold text-white text-base">
                Edit Trailer: {selectedMovieForEdit?.title}
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-navy-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-navy-300 font-semibold mb-1">
                  YouTube URL or 11-Character Video ID <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.trailerUrl}
                  onChange={(e) => setEditForm({ ...editForm, trailerUrl: e.target.value })}
                  placeholder="e.g. https://www.youtube.com/watch?v=Po3jStA673E or Po3jStA673E"
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-800 text-white font-mono placeholder:text-navy-600 focus:border-accent-primary"
                />
              </div>

              <div>
                <label className="block text-navy-300 font-semibold mb-1">Official Video / Trailer Title</label>
                <input
                  type="text"
                  value={editForm.trailerTitle}
                  onChange={(e) => setEditForm({ ...editForm, trailerTitle: e.target.value })}
                  placeholder="LEO - Official Trailer | Thalapathy Vijay | Sun Pictures"
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-800 text-white"
                />
              </div>

              <div>
                <label className="block text-navy-300 font-semibold mb-1">Official Production / Channel Name</label>
                <input
                  type="text"
                  value={editForm.trailerChannel}
                  onChange={(e) => setEditForm({ ...editForm, trailerChannel: e.target.value })}
                  placeholder="e.g. Sun Pictures / Sony Music South"
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-800 text-white"
                />
              </div>

              <div>
                <label className="block text-navy-300 font-semibold mb-1">Verification Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-800 text-white"
                >
                  <option value="verified">Verified Official Trailer</option>
                  <option value="needs_review">Needs Review (Uncertain match)</option>
                  <option value="missing">Missing / Inactive</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-navy-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-5 py-2 rounded-xl bg-accent-primary hover:bg-accent-secondary text-white font-bold flex items-center gap-2"
                >
                  {editSaving ? 'Saving...' : 'Save & Verify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Single Search Candidate Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-navy-900 border border-navy-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h3 className="font-bold text-white text-base">
                Trailer Search: {searchingMovie?.title}
              </h3>
              <button
                onClick={() => setSearchModalOpen(false)}
                className="text-navy-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isSearching ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-navy-300">Searching official cinema sources and YouTube...</p>
              </div>
            ) : searchCandidate?.success && searchCandidate.videoId ? (
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Found high-confidence official trailer match!</span>
                </div>

                {/* Candidate Preview */}
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-navy-800">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${searchCandidate.videoId}`}
                    title="Candidate Trailer"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope"
                    allowFullScreen
                  />
                </div>

                <div className="space-y-1">
                  <div className="font-bold text-white text-sm">{searchCandidate.title}</div>
                  <div className="text-navy-400">
                    Channel: <strong className="text-teal-300">{searchCandidate.channelTitle}</strong> • Source: {searchCandidate.source}
                  </div>
                  <div className="font-mono text-navy-400 text-[11px]">Video ID: {searchCandidate.videoId}</div>
                </div>

                <div className="pt-2 flex justify-end gap-3 border-t border-navy-800">
                  <button
                    onClick={() => setSearchModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-navy-800 text-navy-300 font-semibold"
                  >
                    Reject Match
                  </button>
                  <button
                    onClick={handleApproveCandidate}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Attach Trailer</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                <h4 className="font-bold text-white text-sm">No Confirmed Match Found</h4>
                <p className="text-xs text-navy-400 leading-relaxed max-w-sm mx-auto">
                  {searchCandidate?.message || 'Could not verify an official theatrical trailer for this title.'}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSearchModalOpen(false);
                      handleOpenEdit(searchingMovie);
                    }}
                    className="px-4 py-2 rounded-xl bg-accent-primary text-white text-xs font-bold"
                  >
                    Enter YouTube URL Manually
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bulk Sync Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-navy-900 border border-navy-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h3 className="font-bold text-white text-base">Bulk Synchronize Cinema Trailers</h3>
              <button
                onClick={() => setBulkModalOpen(false)}
                className="text-navy-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-navy-300 leading-relaxed">
                This service scans all movies in your catalogue against official verified production channels and legitimate YouTube listings, applying multi-factor title, year, language, and official channel scoring.
              </p>

              <div className="p-3 rounded-xl bg-navy-950 border border-navy-800 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-white">
                  <input
                    type="checkbox"
                    checked={bulkOverwrite}
                    onChange={(e) => setBulkOverwrite(e.target.checked)}
                    className="rounded bg-navy-900 border-navy-700 text-accent-primary"
                  />
                  <span>Re-check all movies (even those with existing trailers)</span>
                </label>
                <p className="text-[11px] text-navy-400 ml-5">
                  Leave unchecked to only process movies currently missing trailers or flagged as needing review.
                </p>
              </div>

              {bulkRunning ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-10 h-10 border-3 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="font-bold text-white">Processing movie catalogue...</p>
                  <p className="text-[11px] text-navy-400">Rate-limiting applied to comply with source API limits.</p>
                </div>
              ) : bulkResults ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold">
                    ✓ Bulk Sync Complete: Processed {bulkResults.totalProcessed} Movies
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-navy-950 border border-navy-800">
                      <div className="text-emerald-400 font-bold text-base">{bulkResults.verifiedCount}</div>
                      <div className="text-[10px] text-navy-400">Verified Added</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-navy-950 border border-navy-800">
                      <div className="text-amber-400 font-bold text-base">{bulkResults.needsReviewCount}</div>
                      <div className="text-[10px] text-navy-400">Needs Review</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-navy-950 border border-navy-800">
                      <div className="text-rose-400 font-bold text-base">{bulkResults.missingCount}</div>
                      <div className="text-[10px] text-navy-400">Unavailable</div>
                    </div>
                  </div>

                  {bulkResults.logs && bulkResults.logs.length > 0 && (
                    <div className="max-h-40 overflow-y-auto rounded-xl bg-navy-950 border border-navy-800 p-2.5 space-y-1 font-mono text-[10px]">
                      {bulkResults.logs.map((lg, i) => (
                        <div key={i} className="text-navy-300">
                          <strong className={lg.status === 'verified' ? 'text-emerald-400' : 'text-amber-400'}>
                            [{lg.status.toUpperCase()}]
                          </strong>{' '}
                          {lg.title}: {lg.message}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              <div className="pt-2 flex justify-end gap-3 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => setBulkModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-navy-800 text-navy-300 font-semibold"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={bulkRunning}
                  onClick={handleRunBulkSync}
                  className="px-5 py-2 rounded-xl bg-accent-primary hover:bg-accent-secondary text-white font-bold flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${bulkRunning ? 'animate-spin' : ''}`} />
                  <span>{bulkRunning ? 'Synchronizing...' : 'Start Bulk Sync'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Bulk Repair Modal */}
      {bulkRepairModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl my-8 bg-navy-900 border border-navy-700 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-accent-primary/20 text-accent-primary flex items-center justify-center">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Bulk Repair Trailer Thumbnails & Links</h3>
                  <p className="text-[11px] text-navy-400">
                    Audits all catalogue movies, checks 404s/broken IDs, enforces 3-tier search, prevents duplicates, and verifies matches.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBulkRepairModalOpen(false)}
                className="text-navy-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Options */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-navy-950 border border-navy-800 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-white">
                <input
                  type="checkbox"
                  checked={bulkRepairForceRecheck}
                  onChange={(e) => setBulkRepairForceRecheck(e.target.checked)}
                  className="rounded bg-navy-900 border-navy-700 text-accent-primary"
                />
                <span>Force re-verify existing and verified trailers</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={bulkRepairRunning}
                  onClick={() => handleRunBulkRepair(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-white font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Preview Scan Only</span>
                </button>
                <button
                  type="button"
                  disabled={bulkRepairRunning}
                  onClick={() => handleRunBulkRepair(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-accent-primary hover:bg-accent-secondary text-white font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Wrench className={`w-3.5 h-3.5 ${bulkRepairRunning ? 'animate-spin' : ''}`} />
                  <span>{bulkRepairRunning ? 'Repairing...' : 'Repair & Save All'}</span>
                </button>
              </div>
            </div>

            {bulkRepairRunning ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-10 h-10 border-3 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="font-bold text-white text-sm">Running catalogue audit & thumbnail repair...</p>
                <p className="text-[11px] text-navy-400">
                  Verifying YouTube oEmbed accessibility, testing maxresdefault/hqdefault resolutions, and matching titles.
                </p>
              </div>
            ) : bulkRepairResults ? (
              <div className="space-y-4 text-xs">
                {/* Summary Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-navy-950 border border-navy-800">
                    <div className="text-white font-bold text-base">{bulkRepairResults.summary?.totalChecked ?? 0}</div>
                    <div className="text-[10px] text-navy-400">Total Checked</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-navy-950 border border-navy-800">
                    <div className="text-emerald-400 font-bold text-base">{bulkRepairResults.summary?.alreadyValid ?? 0}</div>
                    <div className="text-[10px] text-navy-400">Already Valid</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-navy-950 border border-navy-800">
                    <div className="text-accent-primary font-bold text-base">{bulkRepairResults.summary?.trailersRepaired ?? 0}</div>
                    <div className="text-[10px] text-navy-400">{bulkRepairResults.previewOnly ? 'Found Candidates' : 'Repaired & Saved'}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-navy-950 border border-navy-800">
                    <div className="text-amber-400 font-bold text-base">{bulkRepairResults.summary?.uncertainMatches ?? 0}</div>
                    <div className="text-[10px] text-navy-400">Uncertain Matches</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-navy-950 border border-navy-800">
                    <div className="text-rose-400 font-bold text-base">{bulkRepairResults.summary?.stillMissing ?? 0}</div>
                    <div className="text-[10px] text-navy-400">Still Missing</div>
                  </div>
                </div>

                {/* Candidate Approval Section */}
                {bulkRepairResults.logs && bulkRepairResults.logs.filter((l) => l.candidate).length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-white">
                      <span>Candidate Trailer Replacements ({bulkRepairResults.logs.filter((l) => l.candidate).length})</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const setAll = new Set(bulkRepairResults.logs.filter((l) => l.candidate).map((l) => String(l.movieId)));
                            setApprovedCandidateIds(setAll);
                          }}
                          className="text-[11px] text-accent-primary hover:underline"
                        >
                          Select All
                        </button>
                        <span className="text-navy-600">•</span>
                        <button
                          type="button"
                          onClick={() => {
                            const setNonUncertain = new Set(
                              bulkRepairResults.logs
                                .filter((l) => l.candidate && !l.isUncertain)
                                .map((l) => String(l.movieId))
                            );
                            setApprovedCandidateIds(setNonUncertain);
                          }}
                          className="text-[11px] text-emerald-400 hover:underline"
                        >
                          Select Official Only
                        </button>
                        <span className="text-navy-600">•</span>
                        <button
                          type="button"
                          onClick={() => setApprovedCandidateIds(new Set())}
                          className="text-[11px] text-navy-400 hover:underline"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto rounded-xl bg-navy-950 border border-navy-800 divide-y divide-navy-800/60 p-2 space-y-1">
                      {bulkRepairResults.logs
                        .filter((l) => l.candidate)
                        .map((lg) => {
                          const isSelected = approvedCandidateIds.has(String(lg.movieId));
                          const movieRecord = movies.find((m) => String(m._id) === String(lg.movieId));

                          return (
                            <div
                              key={lg.movieId}
                              className={`p-2 rounded-lg flex items-center justify-between gap-3 text-xs transition-colors ${
                                isSelected ? 'bg-accent-primary/10' : 'hover:bg-white/5'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    const next = new Set(approvedCandidateIds);
                                    if (e.target.checked) next.add(String(lg.movieId));
                                    else next.delete(String(lg.movieId));
                                    setApprovedCandidateIds(next);
                                  }}
                                  className="rounded bg-navy-900 border-navy-700 text-accent-primary"
                                />

                                <div className="w-14 h-9 rounded overflow-hidden bg-black border border-white/10 shrink-0">
                                  <img
                                    src={lg.candidate.thumbnail || `https://i.ytimg.com/vi/${lg.candidate.videoId}/hqdefault.jpg`}
                                    alt={lg.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.src = movieRecord?.posterUrl || '/images/movies/fallback-poster.svg';
                                    }}
                                  />
                                </div>

                                <div className="min-w-0">
                                  <div className="font-bold text-white flex items-center gap-1.5 truncate">
                                    <span>{lg.title}</span>
                                    {lg.year && <span className="text-[10px] text-navy-400">({lg.year})</span>}
                                    {lg.candidate.isOfficial ? (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                        Official
                                      </span>
                                    ) : (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                        Neutral
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-navy-400 truncate">
                                    {lg.candidate.title} • <span className="text-teal-300">{lg.candidate.channel}</span>
                                  </div>
                                  <div className="text-[10px] text-navy-500 font-mono">
                                    ID: {lg.candidate.videoId} • Reason: {lg.reason}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPreviewMovie({
                                      ...movieRecord,
                                      title: lg.title,
                                      trailerVideoId: lg.candidate.videoId,
                                      trailerUrl: `https://www.youtube.com/watch?v=${lg.candidate.videoId}`,
                                      trailerTitle: lg.candidate.title,
                                      trailerChannel: lg.candidate.channel,
                                    });
                                    setIsPreviewOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg bg-navy-800 hover:bg-violet-600 hover:text-white text-navy-300 transition-colors"
                                  title="Preview Trailer Video"
                                >
                                  <Play className="w-3.5 h-3.5 fill-current" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Audit Logs */}
                {bulkRepairResults.logs && (
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-navy-400 uppercase tracking-wider">
                      Audit Trail & Actions Taken ({bulkRepairResults.logs.length})
                    </div>
                    <div className="max-h-36 overflow-y-auto rounded-xl bg-navy-950 border border-navy-800 p-2.5 space-y-1 font-mono text-[10px]">
                      {bulkRepairResults.logs.map((lg, i) => (
                        <div key={i} className="text-navy-300">
                          <strong
                            className={
                              lg.action === 'repaired'
                                ? 'text-emerald-400'
                                : lg.action === 'skipped'
                                ? 'text-teal-400'
                                : lg.action === 'duplicate_prevented'
                                ? 'text-rose-400'
                                : 'text-amber-400'
                            }
                          >
                            [{lg.action.toUpperCase()}]
                          </strong>{' '}
                          <span className="text-white">{lg.title}:</span> {lg.reason}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* Modal Actions */}
            <div className="pt-2 flex justify-between items-center border-t border-navy-800 text-xs">
              <button
                type="button"
                onClick={() => setBulkRepairModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-navy-800 text-navy-300 font-semibold"
              >
                Close
              </button>

              {bulkRepairResults?.previewOnly && approvedCandidateIds.size > 0 && (
                <button
                  type="button"
                  disabled={bulkRepairRunning}
                  onClick={() => handleRunBulkRepair(false, Array.from(approvedCandidateIds))}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Approved Candidates ({approvedCandidateIds.size}) to MongoDB</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTrailersPage;
