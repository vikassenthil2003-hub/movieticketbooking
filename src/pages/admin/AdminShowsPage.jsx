import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import { getLocalDateString } from '../../utils/dateUtils';
import {
  CalendarDays,
  Plus,
  Clock,
  Film,
  Building2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Layers
} from 'lucide-react';

const AdminShowsPage = () => {
  const [searchParams] = useSearchParams();
  const urlTheatreId = searchParams.get('theatreId');

  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString(0));

  const [isModalOpen, setIsModalOpen] = useState(Boolean(urlTheatreId));
  const [formData, setFormData] = useState({
    movieId: '',
    theatreId: urlTheatreId || '',
    screenId: '',
    showDate: getLocalDateString(0),
    startTime: '18:30',
    endTime: '21:00',
    format: '2D',
    language: 'Tamil',
    priceStandard: 190,
    pricePremium: 280,
    priceRecliner: 450,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  // Bulk Scheduling State (Requirement 4)
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkFeedback, setBulkFeedback] = useState({ type: '', text: '', stats: null });
  const [bulkFormData, setBulkFormData] = useState({
    movieId: '',
    theatreMode: 'single', // 'single' | 'district' | 'all'
    theatreId: urlTheatreId || '',
    district: '',
    startDate: getLocalDateString(1),
    endDate: getLocalDateString(3),
    timeSlots: ['10:30 AM', '02:15 PM', '06:30 PM', '10:00 PM'],
    format: '2D',
    language: 'Tamil',
    priceStandard: 160,
    pricePremium: 250,
    priceRecliner: 420,
    isDemoData: true,
  });

  const fetchDropdowns = async () => {
    try {
      const [moviesRes, theatresRes] = await Promise.all([
        api.get('/movies'),
        api.get('/theatres?limit=200'),
      ]);
      const moviesRaw = moviesRes?.data !== undefined ? moviesRes.data : moviesRes;
      const moviesList = Array.isArray(moviesRaw) ? moviesRaw : (Array.isArray(moviesRaw?.data) ? moviesRaw.data : []);
      setMovies(moviesList);

      const theatresRaw = theatresRes?.data !== undefined ? theatresRes.data : theatresRes;
      const theatresList = Array.isArray(theatresRaw) ? theatresRaw : (Array.isArray(theatresRaw?.data) ? theatresRaw.data : []);
      setTheatres(theatresList);

      if (moviesList.length > 0) {
        setFormData((prev) => ({ ...prev, movieId: moviesList[0]._id }));
        setBulkFormData((prev) => ({ ...prev, movieId: moviesList[0]._id }));
      }
      if (theatresList.length > 0) {
        const targetTheatreId =
          urlTheatreId && theatresList.some((t) => t._id === urlTheatreId)
            ? urlTheatreId
            : theatresList[0]._id;
        setFormData((prev) => ({ ...prev, theatreId: targetTheatreId }));
        setBulkFormData((prev) => ({ ...prev, theatreId: targetTheatreId }));
        fetchScreensForTheatre(targetTheatreId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchScreensForTheatre = async (theatreId) => {
    try {
      const res = await api.get(`/screens/theatre/${theatreId}`);
      const raw = res?.data !== undefined ? res.data : res;
      const screensList = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
      setScreens(screensList);
      if (screensList.length > 0) {
        setFormData((prev) => ({ ...prev, screenId: screensList[0]._id }));
      } else {
        setFormData((prev) => ({ ...prev, screenId: 'auto' }));
      }
    } catch (err) {
      console.error(err);
      setFormData((prev) => ({ ...prev, screenId: 'auto' }));
    }
  };

  const fetchShows = async () => {
    setLoading(true);
    try {
      const res = await api.get('/shows', { params: { date: selectedDate } });
      const raw = res?.data !== undefined ? res.data : res;
      const showsList = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
      setShows(showsList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    fetchShows();
  }, [selectedDate]);

  const handleTheatreChange = (e) => {
    const tId = e.target.value;
    setFormData({ ...formData, theatreId: tId });
    fetchScreensForTheatre(tId);
  };

  const handleOpenAdd = () => {
    setFeedback({ type: '', text: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFeedback({ type: '', text: '' });

    const payload = {
      movieId: formData.movieId,
      theatreId: formData.theatreId,
      screenId: formData.screenId || 'auto',
      date: formData.showDate,
      showDate: formData.showDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      format: formData.format,
      language: formData.language,
      pricing: {
        standard: Number(formData.priceStandard),
        premium: Number(formData.pricePremium),
        recliner: Number(formData.priceRecliner),
      },
    };

    try {
      await api.post('/admin/shows', payload);
      setFeedback({ type: 'success', text: 'Showtime scheduled successfully!' });
      setTimeout(() => {
        setIsModalOpen(false);
        fetchShows();
      }, 1200);
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to create showtime' });
    } finally {
      setFormLoading(false);
    }
  };

  // Bulk Schedule Submit Handler (Requirement 4)
  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setBulkLoading(true);
    setBulkFeedback({ type: '', text: '', stats: null });

    try {
      // Calculate date array
      const dates = [];
      const start = new Date(bulkFormData.startDate);
      const end = new Date(bulkFormData.endDate);
      const curr = new Date(start);
      while (curr <= end && dates.length < 30) {
        const y = curr.getFullYear();
        const m = String(curr.getMonth() + 1).padStart(2, '0');
        const d = String(curr.getDate()).padStart(2, '0');
        dates.push(`${y}-${m}-${d}`);
        curr.setDate(curr.getDate() + 1);
      }

      if (dates.length === 0) {
        setBulkFeedback({ type: 'error', text: 'Invalid date range. Start date must be on or before End date.' });
        setBulkLoading(false);
        return;
      }

      // Determine target theatreIds
      let targetTheatreIds = [];
      if (bulkFormData.theatreMode === 'single') {
        targetTheatreIds = [bulkFormData.theatreId];
      } else if (bulkFormData.theatreMode === 'district' && bulkFormData.district) {
        targetTheatreIds = theatres
          .filter((t) => t.district === bulkFormData.district)
          .map((t) => t._id);
      } else {
        // All active theatres (batch first 50)
        targetTheatreIds = theatres.slice(0, 50).map((t) => t._id);
      }

      if (targetTheatreIds.length === 0) {
        setBulkFeedback({ type: 'error', text: 'No theatres matched the selected selection.' });
        setBulkLoading(false);
        return;
      }

      const payload = {
        theatreIds: targetTheatreIds,
        movieId: bulkFormData.movieId,
        dates,
        timeSlots: bulkFormData.timeSlots,
        format: bulkFormData.format,
        language: bulkFormData.language,
        pricing: {
          standard: Number(bulkFormData.priceStandard),
          premium: Number(bulkFormData.pricePremium),
          recliner: Number(bulkFormData.priceRecliner),
        },
        isDemoData: Boolean(bulkFormData.isDemoData),
      };

      const res = await api.post('/admin/shows/bulk-schedule', payload);
      const stats = res.data?.data || res.data;
      setBulkFeedback({
        type: 'success',
        text: `Bulk schedule created! Scheduled ${stats.totalScheduled} showtimes across ${stats.datesProcessed?.length || dates.length} dates. (${stats.skippedExisting} existing/duplicate slots preserved).`,
        stats,
      });

      fetchShows();
    } catch (err) {
      setBulkFeedback({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Bulk schedule creation failed.',
      });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this showtime?')) return;
    try {
      await api.delete(`/admin/shows/${id}`);
      fetchShows();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete show');
    }
  };

  const districts = Array.from(new Set(theatres.map((t) => t.district).filter(Boolean))).sort();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Showtimes & Scheduling</h1>
          <p className="text-xs text-navy-400 mt-0.5">Configure screen schedules, formats, and ticket tier pricing</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setBulkFeedback({ type: '', text: '', stats: null });
              setIsBulkModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-xs font-semibold text-white shadow-lg shadow-violet-600/20 transition"
          >
            <Sparkles className="w-4 h-4 text-violet-200" />
            <span>Bulk Schedule Tool</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-primary hover:bg-accent-primary/90 text-xs font-semibold text-white shadow-lg shadow-accent-primary/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Single Show</span>
          </button>
        </div>
      </div>

      {/* Date Filter */}
      <div className="flex items-center gap-3 bg-navy-900/60 border border-navy-800 p-3 rounded-2xl">
        <CalendarDays className="w-4 h-4 text-accent-secondary ml-2" />
        <span className="text-xs text-navy-400">Filter Date:</span>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-navy-950/80 border border-navy-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent-primary"
        />
      </div>

      {/* Shows Table */}
      <div className="bg-navy-900/60 border border-navy-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-navy-800 bg-navy-950/60 text-navy-400 font-semibold">
                <th className="py-3 px-4">Movie</th>
                <th className="py-3 px-4">Theatre & Screen</th>
                <th className="py-3 px-4">Time & Format</th>
                <th className="py-3 px-4">Standard / Premium / Recliner</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60 text-navy-200">
              {shows.map((s) => (
                <tr key={s._id} className="hover:bg-navy-800/20">
                  <td className="py-3 px-4 font-bold text-white">
                    {s.movieId?.title || s.movie?.title || 'Movie'}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-white">{s.theatreId?.name || s.theatre?.name || 'Theatre'}</p>
                    <p className="text-[10px] text-navy-400">{s.screenId?.name || s.screen?.name || 'Screen 1'}</p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 font-mono text-accent-secondary">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{s.startTime} - {s.endTime}</span>
                    </div>
                    <span className="text-[10px] text-navy-400">{s.format} | {s.language}</span>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    ₹{s.pricing?.standard} / ₹{s.pricing?.premium} / ₹{s.pricing?.recliner}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        s.status === 'scheduled'
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(s._id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete Show"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {shows.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-navy-500">
                    No showtimes scheduled for {selectedDate}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Show Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Showtime"
        maxWidth="max-w-xl"
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
          <div>
            <label className="block text-navy-300 font-medium mb-1">Select Movie</label>
            <select
              value={formData.movieId}
              onChange={(e) => setFormData({ ...formData, movieId: e.target.value })}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
            >
              {movies.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.title} ({m.certification})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-navy-300 font-medium mb-1">Select Theatre</label>
              <select
                value={formData.theatreId}
                onChange={handleTheatreChange}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
              >
                {theatres.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} ({t.city})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-navy-300 font-medium mb-1">Select Screen</label>
              <select
                value={formData.screenId}
                onChange={(e) => setFormData({ ...formData, screenId: e.target.value })}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
              >
                {screens.map((sc) => (
                  <option key={sc._id} value={sc._id}>
                    {sc.name} ({sc.soundSystem})
                  </option>
                ))}
                {screens.length === 0 && (
                  <option value="auto">Screen 1 (Auto-provision 120-seat Laser screen)</option>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-navy-300 font-medium mb-1">Show Date</label>
              <input
                type="date"
                required
                value={formData.showDate}
                onChange={(e) => setFormData({ ...formData, showDate: e.target.value })}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
              />
            </div>
            <div>
              <label className="block text-navy-300 font-medium mb-1">Start Time</label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
              />
            </div>
            <div>
              <label className="block text-navy-300 font-medium mb-1">End Time</label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-navy-300 font-medium mb-1">Format</label>
              <select
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
              >
                <option value="2D">2D</option>
                <option value="3D">3D</option>
                <option value="IMAX 3D">IMAX 3D</option>
                <option value="4DX">4DX</option>
              </select>
            </div>
            <div>
              <label className="block text-navy-300 font-medium mb-1">Language</label>
              <input
                type="text"
                required
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
              />
            </div>
          </div>

          <div className="p-3 bg-navy-950 rounded-xl border border-navy-800/80 space-y-2">
            <span className="block font-semibold text-accent-secondary">Seat Tier Ticket Pricing (₹)</span>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-navy-400 text-[11px] mb-1">Standard</label>
                <input
                  type="number"
                  required
                  value={formData.priceStandard}
                  onChange={(e) => setFormData({ ...formData, priceStandard: e.target.value })}
                  className="w-full bg-navy-900 border border-navy-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label className="block text-navy-400 text-[11px] mb-1">Premium</label>
                <input
                  type="number"
                  required
                  value={formData.pricePremium}
                  onChange={(e) => setFormData({ ...formData, pricePremium: e.target.value })}
                  className="w-full bg-navy-900 border border-navy-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label className="block text-navy-400 text-[11px] mb-1">Recliner</label>
                <input
                  type="number"
                  required
                  value={formData.priceRecliner}
                  onChange={(e) => setFormData({ ...formData, priceRecliner: e.target.value })}
                  className="w-full bg-navy-900 border border-navy-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-accent-primary"
                />
              </div>
            </div>
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
              {formLoading ? 'Scheduling...' : 'Confirm Show'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Bulk Schedule Creation Modal (Requirement 4) */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Bulk Schedule Future Shows"
        maxWidth="max-w-2xl"
      >
        <div className="mb-4 p-3 rounded-xl bg-violet-600/10 border border-violet-500/20 text-xs text-violet-200 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Batch-provision showtimes across multiple dates, theatres, and screens. The system automatically provisions 120-seat laser auditoriums, skips duplicates, and checks for screen overlaps safely.
          </p>
        </div>

        {bulkFeedback.text && (
          <div
            className={`p-3 rounded-xl mb-4 text-xs flex items-center gap-2 ${
              bulkFeedback.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            }`}
          >
            {bulkFeedback.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span className="leading-relaxed">{bulkFeedback.text}</span>
          </div>
        )}

        <form onSubmit={handleBulkSubmit} className="space-y-4 text-xs">
          {/* Movie Selection */}
          <div>
            <label className="block text-navy-300 font-medium mb-1">Target Movie</label>
            <select
              value={bulkFormData.movieId}
              onChange={(e) => setBulkFormData({ ...bulkFormData, movieId: e.target.value })}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
            >
              {movies.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.title} ({m.certification || 'UA'}) • {Array.isArray(m.language) ? m.language.join(', ') : m.language}
                </option>
              ))}
            </select>
          </div>

          {/* Theatre Target Mode */}
          <div className="space-y-2 p-3 bg-navy-950 rounded-xl border border-navy-800">
            <span className="block font-semibold text-accent-secondary">Target Theatres</span>
            <div className="flex flex-wrap items-center gap-4 text-navy-300">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="theatreMode"
                  checked={bulkFormData.theatreMode === 'single'}
                  onChange={() => setBulkFormData({ ...bulkFormData, theatreMode: 'single' })}
                  className="text-violet-600 focus:ring-0"
                />
                <span>Single Theatre</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="theatreMode"
                  checked={bulkFormData.theatreMode === 'district'}
                  onChange={() =>
                    setBulkFormData({
                      ...bulkFormData,
                      theatreMode: 'district',
                      district: districts[0] || 'Chennai',
                    })
                  }
                  className="text-violet-600 focus:ring-0"
                />
                <span>All Theatres in District</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="theatreMode"
                  checked={bulkFormData.theatreMode === 'all'}
                  onChange={() => setBulkFormData({ ...bulkFormData, theatreMode: 'all' })}
                  className="text-violet-600 focus:ring-0"
                />
                <span>Statewide Batch (All 38 Districts)</span>
              </label>
            </div>

            {bulkFormData.theatreMode === 'single' && (
              <select
                value={bulkFormData.theatreId}
                onChange={(e) => setBulkFormData({ ...bulkFormData, theatreId: e.target.value })}
                className="w-full mt-2 bg-navy-900 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
              >
                {theatres.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} ({t.city}, {t.district})
                  </option>
                ))}
              </select>
            )}

            {bulkFormData.theatreMode === 'district' && (
              <select
                value={bulkFormData.district}
                onChange={(e) => setBulkFormData({ ...bulkFormData, district: e.target.value })}
                className="w-full mt-2 bg-navy-900 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
              >
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d} District ({theatres.filter((t) => t.district === d).length} theatres)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date Range Selection with Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-navy-300 font-medium">Date Range (Asia/Kolkata)</label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setBulkFormData({
                      ...bulkFormData,
                      startDate: getLocalDateString(1),
                      endDate: getLocalDateString(1),
                    })
                  }
                  className="px-2 py-0.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-[10px] text-slate-300 transition"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setBulkFormData({
                      ...bulkFormData,
                      startDate: getLocalDateString(1),
                      endDate: getLocalDateString(3),
                    })
                  }
                  className="px-2 py-0.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-[10px] text-slate-300 transition"
                >
                  Next 3 Days
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setBulkFormData({
                      ...bulkFormData,
                      startDate: getLocalDateString(1),
                      endDate: getLocalDateString(7),
                    })
                  }
                  className="px-2 py-0.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-[10px] text-slate-300 transition"
                >
                  Next 7 Days
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-navy-400 text-[10px] mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={bulkFormData.startDate}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, startDate: e.target.value })}
                  className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label className="block text-navy-400 text-[10px] mb-1">End Date</label>
                <input
                  type="date"
                  required
                  value={bulkFormData.endDate}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, endDate: e.target.value })}
                  className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
                />
              </div>
            </div>
          </div>

          {/* Standard Showtime Slots */}
          <div className="space-y-2 p-3 bg-navy-950 rounded-xl border border-navy-800">
            <span className="block font-semibold text-accent-secondary">Daily Showtime Slots</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { slot: '10:30 AM', label: 'Morning (10:30 AM)' },
                { slot: '02:15 PM', label: 'Matinee (02:15 PM)' },
                { slot: '06:30 PM', label: 'Evening (06:30 PM)' },
                { slot: '10:00 PM', label: 'Night (10:00 PM)' },
              ].map(({ slot, label }) => {
                const checked = bulkFormData.timeSlots.includes(slot);
                return (
                  <label
                    key={slot}
                    className={`p-2 rounded-lg border cursor-pointer flex items-center gap-1.5 transition ${
                      checked
                        ? 'bg-violet-600/20 border-violet-500 text-white font-semibold'
                        : 'bg-navy-900 border-navy-800 text-slate-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const newSlots = checked
                          ? bulkFormData.timeSlots.filter((s) => s !== slot)
                          : [...bulkFormData.timeSlots, slot];
                        setBulkFormData({ ...bulkFormData, timeSlots: newSlots });
                      }}
                      className="rounded text-violet-600 focus:ring-0"
                    />
                    <span className="text-[11px]">{slot}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Format & Language */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-navy-300 font-medium mb-1">Format</label>
              <select
                value={bulkFormData.format}
                onChange={(e) => setBulkFormData({ ...bulkFormData, format: e.target.value })}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
              >
                <option value="2D">2D</option>
                <option value="3D">3D</option>
                <option value="IMAX 3D">IMAX 3D</option>
                <option value="4DX">4DX</option>
              </select>
            </div>
            <div>
              <label className="block text-navy-300 font-medium mb-1">Language</label>
              <input
                type="text"
                required
                value={bulkFormData.language}
                onChange={(e) => setBulkFormData({ ...bulkFormData, language: e.target.value })}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
              />
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="p-3 bg-navy-950 rounded-xl border border-navy-800 space-y-2">
            <span className="block font-semibold text-accent-secondary">Seat Tier Pricing (₹)</span>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-navy-400 text-[11px] mb-1">Standard</label>
                <input
                  type="number"
                  required
                  value={bulkFormData.priceStandard}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, priceStandard: e.target.value })}
                  className="w-full bg-navy-900 border border-navy-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label className="block text-navy-400 text-[11px] mb-1">Premium</label>
                <input
                  type="number"
                  required
                  value={bulkFormData.pricePremium}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, pricePremium: e.target.value })}
                  className="w-full bg-navy-900 border border-navy-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label className="block text-navy-400 text-[11px] mb-1">Recliner</label>
                <input
                  type="number"
                  required
                  value={bulkFormData.priceRecliner}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, priceRecliner: e.target.value })}
                  className="w-full bg-navy-900 border border-navy-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-accent-primary"
                />
              </div>
            </div>
          </div>

          {/* Demo Schedule Label Requirement */}
          <div className="p-3 bg-navy-900/50 rounded-xl border border-navy-800 flex items-center justify-between">
            <div>
              <span className="font-semibold text-white">Mark as Demo Schedule</span>
              <p className="text-[10px] text-navy-400 mt-0.5">
                Clearly badges shows in customer views as demo schedules if not verified live schedules.
              </p>
            </div>
            <input
              type="checkbox"
              checked={bulkFormData.isDemoData}
              onChange={(e) => setBulkFormData({ ...bulkFormData, isDemoData: e.target.checked })}
              className="w-4 h-4 rounded text-violet-600 focus:ring-0"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-navy-800">
            <button
              type="button"
              onClick={() => setIsBulkModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-navy-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={bulkLoading || bulkFormData.timeSlots.length === 0}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
            >
              {bulkLoading ? 'Creating Bulk Schedules...' : 'Publish Bulk Schedules'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminShowsPage;
