import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import { Tag, Plus, Trash2, CheckCircle, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';

const AdminCouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 20,
    maxDiscount: 100,
    minBookingAmount: 300,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const [formLoading, setFormLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get('/coupons');
      const raw = res?.data !== undefined ? res.data : res;
      const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
      setCoupons(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: 20,
      maxDiscount: 100,
      minBookingAmount: 300,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setFeedback({ type: '', text: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFeedback({ type: '', text: '' });

    try {
      await api.post('/coupons', {
        code: formData.code.toUpperCase(),
        description: formData.description,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        maxDiscount: Number(formData.maxDiscount),
        minBookingAmount: Number(formData.minBookingAmount),
        validUntil: formData.validUntil,
        isActive: true,
      });
      setFeedback({ type: 'success', text: 'Coupon created successfully!' });
      setTimeout(() => {
        setIsModalOpen(false);
        fetchCoupons();
      }, 1200);
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to create coupon' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try {
      await api.delete(`/coupons/${id}`);
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete coupon');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Promotions & Coupons</h1>
          <p className="text-xs text-navy-400 mt-0.5">Manage promo discount codes and minimum spending thresholds</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-primary hover:bg-accent-primary/90 text-xs font-semibold text-white shadow-lg shadow-accent-primary/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon Code</span>
        </button>
      </div>

      <div className="bg-navy-900/60 border border-navy-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-navy-800 bg-navy-950/60 text-navy-400 font-semibold">
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Min. Spend</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60 text-navy-200">
              {coupons.map((c) => (
                <tr key={c._id} className="hover:bg-navy-800/20">
                  <td className="py-3 px-4 font-mono font-bold text-accent-secondary">
                    {c.code}
                  </td>
                  <td className="py-3 px-4 text-navy-300">{c.description || 'Special offer'}</td>
                  <td className="py-3 px-4 font-semibold text-white">
                    {c.discountType === 'percentage'
                      ? `${c.discountValue}% (Max ₹${c.maxDiscount})`
                      : `₹${c.discountValue} Flat Off`}
                  </td>
                  <td className="py-3 px-4">₹{c.minBookingAmount || 0}</td>
                  <td className="py-3 px-4 text-navy-400">
                    {new Date(c.validUntil).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        c.isActive
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                          : 'bg-navy-800 text-navy-400'
                      }`}
                    >
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(c._id, c.code)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete Coupon"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-navy-500">
                    No promo coupons created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Coupon"
        maxWidth="max-w-md"
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
            <label className="block text-navy-300 font-medium mb-1">Coupon Code (Uppercase)</label>
            <input
              type="text"
              required
              placeholder="e.g. FESTIVE50"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-accent-primary"
            />
          </div>

          <div>
            <label className="block text-navy-300 font-medium mb-1">Description</label>
            <input
              type="text"
              required
              placeholder="Get 50% discount up to ₹150"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-navy-300 font-medium mb-1">Discount Type</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-navy-300 font-medium mb-1">Discount Value</label>
              <input
                type="number"
                required
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-navy-300 font-medium mb-1">Max Cap (₹)</label>
              <input
                type="number"
                required
                value={formData.maxDiscount}
                onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
              />
            </div>
            <div>
              <label className="block text-navy-300 font-medium mb-1">Min Spend (₹)</label>
              <input
                type="number"
                required
                value={formData.minBookingAmount}
                onChange={(e) => setFormData({ ...formData, minBookingAmount: e.target.value })}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-navy-300 font-medium mb-1">Valid Until</label>
            <input
              type="date"
              required
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
            />
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
              {formLoading ? 'Creating...' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCouponsPage;
