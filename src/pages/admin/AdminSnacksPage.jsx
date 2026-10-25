import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import {
  Utensils,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  ToggleLeft,
  ToggleRight,
  Building2,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

const CATEGORIES = [
  'Popcorn',
  'Combos',
  'Beverages',
  'Burgers & Sandwiches',
  'Nachos',
  'Other Snacks',
];

const AdminSnacksPage = () => {
  const [snacks, setSnacks] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [theatreFilter, setTheatreFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);

  const initialFormState = {
    name: '',
    category: 'Popcorn',
    variant: 'Regular',
    price: 150,
    isVeg: true,
    description: '',
    imageUrl: '',
    theatreId: '', // Empty means Global
    isAvailable: true,
    trackStock: false,
    stockQuantity: 100,
    isDemoPrice: true,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formLoading, setFormLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  // Fetch Snacks & Theatres
  const fetchData = async () => {
    setLoading(true);
    try {
      const [snacksRes, theatresRes] = await Promise.all([
        api.get('/snacks/admin/all'),
        api.get('/theatres'),
      ]);

      const rawSnacks = snacksRes?.data !== undefined ? snacksRes.data : snacksRes;
      const snackList = Array.isArray(rawSnacks) ? rawSnacks : rawSnacks?.snacks || [];
      setSnacks(snackList);

      const rawTheatres = theatresRes?.data !== undefined ? theatresRes.data : theatresRes;
      const theatreList = Array.isArray(rawTheatres) ? rawTheatres : rawTheatres?.theatres || [];
      setTheatres(theatreList);
    } catch (err) {
      console.error('[Admin Snacks Fetch Error]:', err);
      setFeedback({
        type: 'error',
        text: err.message || 'Failed to fetch snacks and theatre catalogues.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Open Add Modal
  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentEditId(null);
    setFormData(initialFormState);
    setFeedback({ type: '', text: '' });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setIsEditing(true);
    setCurrentEditId(item._id);
    setFormData({
      name: item.name || '',
      category: item.category || 'Popcorn',
      variant: item.variant || 'Regular',
      price: item.price || 100,
      isVeg: item.isVeg !== false,
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      theatreId: item.theatreId?._id || item.theatreId || '',
      isAvailable: item.isAvailable !== false,
      trackStock: Boolean(item.trackStock),
      stockQuantity: item.stockQuantity || 0,
      isDemoPrice: item.isDemoPrice !== false,
    });
    setFeedback({ type: '', text: '' });
    setIsModalOpen(true);
  };

  // Submit Add or Edit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFeedback({ type: '', text: '' });

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity, 10) || 0,
        theatreId: formData.theatreId ? formData.theatreId : null,
      };

      if (isEditing) {
        await api.put(`/snacks/${currentEditId}`, payload);
        setFeedback({ type: 'success', text: `Snack "${formData.name}" updated successfully!` });
      } else {
        await api.post('/snacks', payload);
        setFeedback({ type: 'success', text: `Snack "${formData.name}" created successfully!` });
      }

      await fetchData();
      setTimeout(() => {
        setIsModalOpen(false);
      }, 800);
    } catch (err) {
      console.error('[Admin Snack Submit Error]:', err);
      setFeedback({
        type: 'error',
        text: err.message || 'Operation failed. Please verify form values.',
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Toggle Availability
  const handleToggleAvailability = async (snack) => {
    try {
      await api.patch(`/snacks/${snack._id}/availability`);
      setSnacks((prev) =>
        prev.map((s) => (s._id === snack._id ? { ...s, isAvailable: !s.isAvailable } : s))
      );
    } catch (err) {
      console.error('[Toggle Availability Error]:', err);
      alert(err.message || 'Failed to toggle availability');
    }
  };

  // Delete Snack
  const handleDelete = async (snack) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${snack.name}"?`)) {
      return;
    }

    try {
      await api.delete(`/snacks/${snack._id}`);
      setSnacks((prev) => prev.filter((s) => s._id !== snack._id));
    } catch (err) {
      console.error('[Delete Snack Error]:', err);
      alert(err.message || 'Failed to delete snack');
    }
  };

  // Filtered List
  const filteredSnacks = useMemo(() => {
    return snacks.filter((item) => {
      // Category
      if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;
      // Theatre
      if (theatreFilter !== 'All') {
        const itemThId = item.theatreId?._id || item.theatreId;
        if (theatreFilter === 'global') {
          if (itemThId) return false;
        } else {
          if (itemThId !== theatreFilter) return false;
        }
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name?.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        const matchesVariant = item.variant?.toLowerCase().includes(q);
        return matchesName || matchesDesc || matchesVariant;
      }
      return true;
    });
  }, [snacks, categoryFilter, theatreFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-navy-800">
        <div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight">
            Cinema Concessions & Snacks
          </h1>
          <p className="text-xs text-navy-400 mt-1">
            Manage theatre food items, pricing, inventory stock, and availability status.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-accent-primary hover:bg-violet-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-accent-primary/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Snack</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800">
          <div className="text-[11px] font-bold text-navy-400 uppercase tracking-wider">
            Total Catalogue
          </div>
          <div className="text-2xl font-black text-white mt-1 font-display">{snacks.length}</div>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800">
          <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
            Active / In Stock
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1 font-display">
            {snacks.filter((s) => s.isAvailable).length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800">
          <div className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">
            Global Concessions
          </div>
          <div className="text-2xl font-black text-teal-400 mt-1 font-display">
            {snacks.filter((s) => !s.theatreId).length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800">
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
            Categories
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1 font-display">
            {CATEGORIES.length}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by snack name, variant or description..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-navy-950 border border-navy-800 text-white placeholder-navy-500 text-xs focus:outline-none focus:border-accent-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-navy-950 border border-navy-800 text-white text-xs focus:outline-none focus:border-accent-primary font-medium"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Theatre Dropdown */}
          <select
            value={theatreFilter}
            onChange={(e) => setTheatreFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-navy-950 border border-navy-800 text-white text-xs focus:outline-none focus:border-accent-primary font-medium"
          >
            <option value="All">All Outlets</option>
            <option value="global">Global Items (All Theatres)</option>
            {theatres.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Snacks Table */}
      <div className="rounded-2xl bg-navy-900 border border-navy-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-navy-400 text-xs flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
            <span>Loading concessions catalogue...</span>
          </div>
        ) : filteredSnacks.length === 0 ? (
          <div className="p-12 text-center text-navy-400 text-xs space-y-2">
            <p className="text-2xl">🍿</p>
            <p className="font-semibold text-white">No snack items found</p>
            <p>Try resetting filters or click "Add New Snack" to create a new concession item.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-950 text-navy-400 uppercase tracking-wider font-semibold border-b border-navy-800">
                <tr>
                  <th className="py-3 px-4">Snack Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Variant / Size</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Theatre Outlet</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60 text-navy-200">
                {filteredSnacks.map((item) => (
                  <tr key={item._id} className="hover:bg-navy-850/50 transition-colors">
                    {/* Item */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover bg-navy-950 border border-navy-800 shrink-0"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=200&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-white">
                            <span
                              className={`w-2.5 h-2.5 rounded-full block ${
                                item.isVeg !== false ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                              title={item.isVeg !== false ? 'Vegetarian' : 'Non-Vegetarian'}
                            />
                            <span>{item.name}</span>
                          </div>
                          <div className="text-[11px] text-navy-400 line-clamp-1 max-w-xs">
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-navy-800 text-navy-300 font-medium">
                        {item.category}
                      </span>
                    </td>

                    {/* Variant */}
                    <td className="py-3 px-4 font-mono text-navy-300">
                      {item.variant || 'Regular'}
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-emerald-400 font-mono text-sm">
                        ₹{item.price}
                      </div>
                      {item.isDemoPrice && (
                        <span className="text-[9px] text-amber-400 uppercase font-semibold">
                          Demo
                        </span>
                      )}
                    </td>

                    {/* Outlet */}
                    <td className="py-3 px-4">
                      {item.theatreId ? (
                        <span className="text-teal-400 font-medium flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{item.theatreId?.name || 'Assigned Theatre'}</span>
                        </span>
                      ) : (
                        <span className="text-navy-400 font-medium">All Theatres (Global)</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                          item.isAvailable
                            ? 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
                            : 'bg-rose-500/15 text-rose-300 hover:bg-rose-500/25'
                        }`}
                        title="Click to toggle availability"
                      >
                        {item.isAvailable ? (
                          <>
                            <ToggleRight className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Available</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-3.5 h-3.5 text-rose-400" />
                            <span>Unavailable</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-navy-300 hover:text-white transition-colors"
                          title="Edit Snack"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 rounded-lg bg-navy-800 hover:bg-rose-900/40 text-navy-400 hover:text-rose-400 transition-colors"
                          title="Delete Snack"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Concession Snack' : 'Add New Cinema Snack'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {feedback.text && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                feedback.type === 'error'
                  ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                  : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              }`}
            >
              {feedback.type === 'error' ? (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              ) : (
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-navy-300 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Cheese Popcorn Tub"
                className="w-full px-3.5 py-2 rounded-xl bg-navy-950 border border-navy-800 text-white text-xs focus:outline-none focus:border-accent-primary"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-navy-300 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-navy-950 border border-navy-800 text-white text-xs focus:outline-none focus:border-accent-primary"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Variant / Size */}
            <div>
              <label className="block text-xs font-semibold text-navy-300 mb-1">
                Variant / Size
              </label>
              <input
                type="text"
                value={formData.variant}
                onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                placeholder="e.g. Medium (60g), Large, 500ml"
                className="w-full px-3.5 py-2 rounded-xl bg-navy-950 border border-navy-800 text-white text-xs focus:outline-none focus:border-accent-primary"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-semibold text-navy-300 mb-1">
                Demo Price (₹) *
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-navy-950 border border-navy-800 text-white text-xs focus:outline-none focus:border-accent-primary"
              />
            </div>

            {/* Veg / Non-Veg */}
            <div>
              <label className="block text-xs font-semibold text-navy-300 mb-1">Diet Type</label>
              <select
                value={formData.isVeg ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, isVeg: e.target.value === 'true' })}
                className="w-full px-3.5 py-2 rounded-xl bg-navy-950 border border-navy-800 text-white text-xs focus:outline-none focus:border-accent-primary"
              >
                <option value="true">Vegetarian (🟢)</option>
                <option value="false">Non-Vegetarian (🔴)</option>
              </select>
            </div>

            {/* Theatre Association */}
            <div>
              <label className="block text-xs font-semibold text-navy-300 mb-1">
                Theatre Assignment
              </label>
              <select
                value={formData.theatreId}
                onChange={(e) => setFormData({ ...formData, theatreId: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-navy-950 border border-navy-800 text-white text-xs focus:outline-none focus:border-accent-primary"
              >
                <option value="">All Theatres (Global Concession)</option>
                {theatres.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} ({t.city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-semibold text-navy-300 mb-1">
              Product Image URL
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2 rounded-xl bg-navy-950 border border-navy-800 text-white text-xs focus:outline-none focus:border-accent-primary"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-navy-300 mb-1">Description</label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Appetizing description of the snack item..."
              className="w-full px-3.5 py-2 rounded-xl bg-navy-950 border border-navy-800 text-white text-xs focus:outline-none focus:border-accent-primary"
            />
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-4 pt-2 border-t border-navy-800">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-navy-300">
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                className="w-4 h-4 rounded text-accent-primary focus:ring-0 bg-navy-950 border-navy-800"
              />
              <span>Available for ordering</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-navy-300">
              <input
                type="checkbox"
                checked={formData.isDemoPrice}
                onChange={(e) => setFormData({ ...formData, isDemoPrice: e.target.checked })}
                className="w-4 h-4 rounded text-accent-primary focus:ring-0 bg-navy-950 border-navy-800"
              />
              <span>Mark as Demo Price</span>
            </label>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-navy-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-navy-300 hover:text-white text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-5 py-2 rounded-xl bg-accent-primary hover:bg-violet-600 text-white text-xs font-bold shadow-md shadow-accent-primary/20 disabled:opacity-50"
            >
              {formLoading ? 'Saving...' : isEditing ? 'Update Snack' : 'Create Snack'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminSnacksPage;
