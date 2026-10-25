import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import {
  Clapperboard,
  Plus,
  Search,
  Edit2,
  Trash2,
  Star,
  Clock,
  AlertCircle,
  CheckCircle,
  Eye,
  RefreshCw,
  Play,
  Sparkles,
} from 'lucide-react';

const AdminMoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    synopsis: '',
    poster: '',
    bannerImage: '',
    duration: 120,
    certification: 'UA',
    releaseDate: '',
    releaseStatus: 'now_showing',
    languages: 'Tamil, English',
    genres: 'Action, Thriller',
    directors: '',
    cast: '',
    trailerUrl: '',
    rating: 8.0,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [autoFindingTrailer, setAutoFindingTrailer] = useState(false);
  const [autoTrailerResult, setAutoTrailerResult] = useState(null);

  const handleAutoFindTrailer = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a movie title first to search for its trailer.');
      return;
    }
    try {
      setAutoFindingTrailer(true);
      setAutoTrailerResult(null);
      const res = await api.post('/trailers/admin/lookup-query', {
        title: formData.title.trim(),
        year: formData.releaseDate ? new Date(formData.releaseDate).getFullYear() : null,
        language: formData.languages,
        forceLiveSearch: true,
      });
      const result = res.data?.searchResult || res.data?.data?.searchResult || res?.searchResult;
      setAutoTrailerResult(result);
      if (result && result.success && result.trailerUrl) {
        setFormData((prev) => ({ ...prev, trailerUrl: result.trailerUrl }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Trailer lookup failed.');
    } finally {
      setAutoFindingTrailer(false);
    }
  };

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/movies', { params });
      const raw = res?.data !== undefined ? res.data : res;
      const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
      setMovies(list);
    } catch (err) {
      console.error('[Admin Movies Fetch Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [statusFilter]);

  const handleOpenAdd = () => {
    setEditingMovie(null);
    setFormData({
      title: '',
      synopsis: '',
      poster: '/images/movies/leo-poster.jpg',
      bannerImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
      duration: 135,
      certification: 'UA',
      releaseDate: new Date().toISOString().split('T')[0],
      releaseStatus: 'now_showing',
      languages: 'Tamil, Telugu, Hindi',
      genres: 'Action, Thriller',
      directors: 'Director Name',
      cast: 'Lead Actor, Co-star',
      trailerUrl: '',
      rating: 8.5,
    });
    setFeedback({ type: '', text: '' });
    setAutoTrailerResult(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (movie) => {
    setEditingMovie(movie);
    setAutoTrailerResult(null);
    const posterVal = movie.poster || movie.posterUrl || '';
    const bannerVal = movie.bannerImage || movie.bannerUrl || '';
    const statusVal = movie.releaseStatus || movie.status || 'now_showing';
    const langsArr = Array.isArray(movie.languages)
      ? movie.languages
      : Array.isArray(movie.language)
      ? movie.language
      : typeof movie.language === 'string'
      ? [movie.language]
      : [];
    const genresArr = Array.isArray(movie.genres)
      ? movie.genres
      : Array.isArray(movie.genre)
      ? movie.genre
      : typeof movie.genre === 'string'
      ? [movie.genre]
      : [];
    const dirsArr = Array.isArray(movie.directors)
      ? movie.directors
      : movie.director
      ? [movie.director]
      : [];
    const ratingVal = typeof movie.rating === 'object'
      ? movie.rating?.average || 8.0
      : Number(movie.rating) || 8.0;

    setFormData({
      title: movie.title || '',
      synopsis: movie.synopsis || '',
      poster: posterVal,
      bannerImage: bannerVal,
      duration: movie.duration || 120,
      certification: movie.certification || 'UA',
      releaseDate: movie.releaseDate ? new Date(movie.releaseDate).toISOString().split('T')[0] : '',
      releaseStatus: statusVal,
      languages: langsArr.join(', '),
      genres: genresArr.join(', '),
      directors: dirsArr.join(', '),
      cast: (movie.cast || []).map((c) => c.name || c).join(', '),
      trailerUrl: movie.trailerUrl || '',
      rating: ratingVal,
    });
    setFeedback({ type: '', text: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFeedback({ type: '', text: '' });

    const langsArray = formData.languages.split(',').map((s) => s.trim()).filter(Boolean);
    const genresArray = formData.genres.split(',').map((s) => s.trim()).filter(Boolean);
    const dirsArray = formData.directors.split(',').map((s) => s.trim()).filter(Boolean);
    const numRating = Number(formData.rating) || 8.0;

    const payload = {
      title: formData.title.trim(),
      synopsis: formData.synopsis.trim(),
      poster: formData.poster.trim(),
      posterUrl: formData.poster.trim(),
      bannerImage: formData.bannerImage.trim(),
      bannerUrl: formData.bannerImage.trim() || formData.poster.trim(),
      duration: Number(formData.duration),
      certification: formData.certification,
      releaseDate: formData.releaseDate,
      releaseStatus: formData.releaseStatus,
      status: formData.releaseStatus,
      languages: langsArray.length > 0 ? langsArray : ['Tamil'],
      language: langsArray.length > 0 ? langsArray : ['Tamil'],
      genres: genresArray.length > 0 ? genresArray : ['Action'],
      genre: genresArray.length > 0 ? genresArray : ['Action'],
      directors: dirsArray,
      director: dirsArray.join(', ') || 'Director',
      cast: formData.cast.split(',').map((s) => ({ name: s.trim() })).filter((c) => c.name),
      trailerUrl: formData.trailerUrl.trim(),
      rating: numRating,
    };

    try {
      if (editingMovie) {
        await api.put(`/admin/movies/${editingMovie._id}`, payload);
        setFeedback({ type: 'success', text: 'Movie updated successfully!' });
      } else {
        await api.post('/admin/movies', payload);
        setFeedback({ type: 'success', text: 'New movie created successfully!' });
      }
      setTimeout(() => {
        setIsModalOpen(false);
        fetchMovies();
      }, 1000);
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || err.message || 'Failed to save movie' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete movie "${title}"?`)) return;
    try {
      await api.delete(`/admin/movies/${id}`);
      fetchMovies();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete movie');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Movie Management</h1>
          <p className="text-xs text-navy-400 mt-0.5">Add, update, or archive movies in the CineVerse catalogue</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/trailers"
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-xs font-semibold text-accent-primary border border-navy-700 hover:border-accent-primary/40 transition"
            title="Open CineVerse Trailer Manager"
          >
            <Play className="w-3.5 h-3.5 fill-accent-primary" />
            <span className="hidden sm:inline">Trailer Manager</span>
          </Link>
          <button
            onClick={fetchMovies}
            className="p-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-navy-300 hover:text-white transition"
            title="Refresh Movies"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-primary hover:bg-accent-primary/90 text-xs font-semibold text-white shadow-lg shadow-accent-primary/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Movie</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-navy-900/60 border border-navy-800 p-3 rounded-2xl">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-navy-500" />
          <input
            type="text"
            placeholder="Search catalogue by movie title or director..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchMovies()}
            className="w-full bg-navy-950/80 border border-navy-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-accent-primary"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-navy-950/80 border border-navy-800 rounded-xl px-3 py-2 text-xs text-navy-200 focus:outline-none focus:border-accent-primary"
        >
          <option value="">All Release Statuses</option>
          <option value="now_showing">Now Showing</option>
          <option value="coming_soon">Coming Soon</option>
          <option value="archived">Archived / Ended</option>
        </select>
      </div>

      {/* Movies Table */}
      <div className="bg-navy-900/60 border border-navy-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-navy-800 bg-navy-950/60 text-navy-400 font-semibold">
                <th className="py-3 px-4">Movie</th>
                <th className="py-3 px-4">Languages</th>
                <th className="py-3 px-4">Genres</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Trailer</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60 text-navy-200">
              {movies.map((m) => {
                const statusStr = m.releaseStatus || m.status || 'now_showing';
                const posterSrc = m.poster || m.posterUrl || '/images/movies/fallback-poster.svg';
                const langsStr = (Array.isArray(m.languages) ? m.languages : Array.isArray(m.language) ? m.language : [m.language || 'Tamil']).join(', ');
                const genresStr = (Array.isArray(m.genres) ? m.genres : Array.isArray(m.genre) ? m.genre : [m.genre || 'Action']).join(', ');
                const ratingVal = typeof m.rating === 'object'
                  ? (m.rating?.average !== undefined ? Number(m.rating.average).toFixed(1) : '8.5')
                  : (m.rating !== undefined && m.rating !== null ? Number(m.rating).toFixed(1) : '8.5');

                return (
                  <tr key={m._id} className="hover:bg-navy-800/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={posterSrc}
                          alt={m.title}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/images/movies/fallback-poster.svg';
                          }}
                          className="w-9 h-12 rounded object-cover border border-navy-700 shrink-0 bg-navy-950"
                        />
                        <div>
                          <p className="font-bold text-white leading-tight">{m.title}</p>
                          <span className="text-[10px] text-navy-400">{m.certification || 'UA'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-navy-300">{langsStr}</td>
                    <td className="py-3 px-4 text-navy-300">{genresStr}</td>
                    <td className="py-3 px-4 text-navy-300">{m.duration || 120} mins</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          statusStr === 'now_showing'
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                            : statusStr === 'coming_soon'
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                            : 'bg-navy-800 text-navy-400 border border-navy-700'
                        }`}
                      >
                        {statusStr.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {m.trailerUrl && m.trailerStatus === 'verified' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      ) : m.trailerUrl ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          Needs Review
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          Missing
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1 font-bold text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {ratingVal}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(m)}
                          className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-navy-300 hover:text-white transition"
                          title="Edit Movie"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(m._id, m.title)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                          title="Delete Movie"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {movies.length === 0 && !loading && (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-navy-500">
                    No movies found matching criteria.
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-navy-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading movies catalogue...</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Movie Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMovie ? 'Edit Movie Details' : 'Add New Movie to Catalogue'}
        maxWidth="max-w-2xl"
      >
        {feedback.text && (
          <div
            className={`p-3 rounded-xl mb-4 text-xs flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            }`}
          >
            {feedback.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{feedback.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-navy-300 font-medium mb-1">Movie Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
              />
            </div>
            <div>
              <label className="block text-navy-300 font-medium mb-1">Certification</label>
              <select
                value={formData.certification}
                onChange={(e) => setFormData({ ...formData, certification: e.target.value })}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
              >
                <option value="U">U (Universal)</option>
                <option value="UA">UA (Parental Guidance)</option>
                <option value="A">A (Adults Only)</option>
                <option value="PG-13">PG-13</option>
                <option value="R">R</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-navy-300 font-medium mb-1">Synopsis</label>
            <textarea
              rows={2}
              required
              value={formData.synopsis}
              onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-navy-300 font-medium mb-1">Poster Image URL or Path</label>
              <input
                type="text"
                required
                placeholder="/images/movies/leo-poster.jpg or https://..."
                value={formData.poster}
                onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
              />
            </div>
            <div>
              <label className="block text-navy-300 font-medium mb-1">Banner Image URL or Path</label>
              <input
                type="text"
                placeholder="https://... or /images/..."
                value={formData.bannerImage}
                onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-navy-300 font-medium mb-1">Duration (minutes)</label>
              <input
                type="number"
                required
                min={30}
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
              />
            </div>
            <div>
              <label className="block text-navy-300 font-medium mb-1">Release Status</label>
              <select
                value={formData.releaseStatus}
                onChange={(e) => setFormData({ ...formData, releaseStatus: e.target.value })}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
              >
                <option value="now_showing">Now Showing</option>
                <option value="coming_soon">Coming Soon</option>
                <option value="ended">Archived / Ended</option>
              </select>
            </div>
            <div>
              <label className="block text-navy-300 font-medium mb-1">Release Date</label>
              <input
                type="date"
                required
                value={formData.releaseDate}
                onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-navy-300 font-medium mb-1">Languages (comma-separated)</label>
              <input
                type="text"
                placeholder="Tamil, Telugu, Hindi"
                value={formData.languages}
                onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
              />
            </div>
            <div>
              <label className="block text-navy-300 font-medium mb-1">Genres (comma-separated)</label>
              <input
                type="text"
                placeholder="Action, Thriller, Sci-Fi"
                value={formData.genres}
                onChange={(e) => setFormData({ ...formData, genres: e.target.value })}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-navy-300 font-medium mb-1">Director</label>
              <input
                type="text"
                placeholder="Lokesh Kanagaraj"
                value={formData.directors}
                onChange={(e) => setFormData({ ...formData, directors: e.target.value })}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
              />
            </div>
            <div>
              <label className="block text-navy-300 font-medium mb-1">Rating (0 - 10)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
              />
            </div>
          </div>

          {/* Official Trailer Section */}
          <div className="p-3.5 bg-navy-950/70 border border-navy-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-navy-200 font-semibold">YouTube Official Trailer</label>
              <button
                type="button"
                onClick={handleAutoFindTrailer}
                disabled={autoFindingTrailer || !formData.title.trim()}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary border border-accent-primary/30 text-[11px] font-semibold transition disabled:opacity-40"
              >
                {autoFindingTrailer ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    Auto-Find Trailer
                  </>
                )}
              </button>
            </div>
            <input
              type="text"
              placeholder="https://www.youtube.com/watch?v=... or YouTube video ID"
              value={formData.trailerUrl}
              onChange={(e) => {
                setFormData({ ...formData, trailerUrl: e.target.value });
                setAutoTrailerResult(null);
              }}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
            />
            {autoTrailerResult && (
              <p
                className={`text-[11px] flex items-center gap-1 ${
                  autoTrailerResult.success ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {autoTrailerResult.success ? (
                  <>
                    <CheckCircle className="w-3 h-3 shrink-0" />
                    Matched ({autoTrailerResult.confidence}): {autoTrailerResult.title || 'Official Trailer'}
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {autoTrailerResult.reason || 'No verified trailer found automatically. Please enter URL manually.'}
                  </>
                )}
              </p>
            )}
            <p className="text-[10px] text-navy-400">
              Paste a YouTube trailer URL or click Auto-Find to match via title, release year, and language.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-navy-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-navy-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-5 py-2 rounded-xl bg-accent-primary hover:bg-accent-primary/90 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
            >
              {formLoading ? 'Saving...' : editingMovie ? 'Save Changes' : 'Create Movie'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminMoviesPage;
