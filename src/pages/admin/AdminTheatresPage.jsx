import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import {
  Film,
  Building2,
  Plus,
  MapPin,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Search,
  CheckCircle2,
  Download,
  Filter,
  SlidersHorizontal,
  Navigation,
  Globe,
  Loader2,
  Power,
  RotateCcw,
  Copy,
  AlertTriangle,
  Eye,
  Check,
  XCircle,
  Tv
} from 'lucide-react';
import { ALL_INDIA_STATES_LIST, TAMIL_NADU_DISTRICTS_LIST } from '../../context/LocationContext';

const AdminTheatresPage = () => {
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coverageStats, setCoverageStats] = useState(null);

  // Filters
  const [stateFilter, setStateFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDistrictAudit, setShowDistrictAudit] = useState(false);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: 'CineVerse Partner',
    category: 'Multiplex',
    screensCount: 2,
    district: 'Chennai',
    city: 'Chennai',
    locality: '',
    state: 'Tamil Nadu',
    pinCode: '600002',
    address: '',
    longitude: 80.2707,
    latitude: 13.0827,
    amenities: 'Dolby Atmos, 4K Laser Projection, Recliner Seats, Parking',
    phone: '+91 44 2852 4444',
    verificationStatus: 'verified',
    verificationNotes: '',
    isActive: true,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importMode, setImportMode] = useState('national'); // 'national' | 'google_places' | 'curated' | 'osm' | 'all'
  const [importLoading, setImportLoading] = useState(false);
  const [importReport, setImportReport] = useState(null);

  // Duplicate Detection Modal State
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [duplicateClusters, setDuplicateClusters] = useState([]);
  const [duplicateLoading, setDuplicateLoading] = useState(false);
  const [duplicateActionMsg, setDuplicateActionMsg] = useState('');

  // Fetch coverage metrics
  const fetchCoverageStats = async () => {
    try {
      const res = await api.get('/admin/theatres/stats');
      setCoverageStats(res.data?.data || res.data);
    } catch (err) {
      console.warn('Failed to fetch coverage stats:', err);
    }
  };

  // Derive districts for current state filter
  const currentStateObj = ALL_INDIA_STATES_LIST.find(
    (s) => s.name.toLowerCase() === stateFilter.toLowerCase()
  );
  const availableDistricts = currentStateObj ? currentStateObj.districts : [];

  // Fetch theatre list
  const fetchTheatres = async () => {
    setLoading(true);
    try {
      const params = {};
      if (stateFilter) params.state = stateFilter;
      if (districtFilter) params.district = districtFilter;
      if (verificationFilter) params.verificationStatus = verificationFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.get('/theatres', { params });
      const raw = res?.data !== undefined ? res.data : res;
      const list = raw?.data?.theatres || (Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : []);
      setTheatres(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheatres();
    fetchCoverageStats();
  }, [stateFilter, districtFilter, verificationFilter, searchQuery]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      brand: 'CineVerse Partner',
      category: 'Multiplex',
      screensCount: 2,
      district: districtFilter || 'Chennai',
      city: 'Chennai',
      locality: '',
      state: 'Tamil Nadu',
      pinCode: '600001',
      address: '',
      longitude: 80.2707,
      latitude: 13.0827,
      amenities: 'Dolby Atmos, 4K Laser Projection, Recliner Seats, Parking',
      phone: '+91 44 2855 0000',
      verificationStatus: 'verified',
      verificationNotes: 'Manually verified by administrator.',
      isActive: true,
    });
    setFeedback({ type: '', text: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setEditingId(t._id);
    const coords = t.location?.coordinates || [80.2707, 13.0827];
    setFormData({
      name: t.name || '',
      brand: t.brand || 'CineVerse Partner',
      category: t.category || (t.screensCount > 1 ? 'Multiplex' : 'Single Screen'),
      screensCount: t.screensCount || 1,
      district: t.district || 'Chennai',
      city: t.city || 'Chennai',
      locality: t.locality || '',
      state: t.state || 'Tamil Nadu',
      pinCode: t.pinCode || t.pincode || '',
      address: t.address || t.addressLine || '',
      longitude: coords[0],
      latitude: coords[1],
      amenities: Array.isArray(t.amenities) ? t.amenities.join(', ') : t.amenities || '',
      phone: t.contactPhone || t.phone || '',
      verificationStatus: t.verificationStatus || 'verified',
      verificationNotes: t.verificationNotes || '',
      isActive: t.isActive !== false,
    });
    setFeedback({ type: '', text: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFeedback({ type: '', text: '' });

    const payload = {
      name: formData.name,
      brand: formData.brand,
      category: formData.category,
      screensCount: Number(formData.screensCount) || 1,
      district: formData.district,
      city: formData.city,
      locality: formData.locality,
      state: formData.state,
      pinCode: formData.pinCode,
      address: formData.address,
      coordinates: [Number(formData.longitude), Number(formData.latitude)],
      amenities: formData.amenities.split(',').map((s) => s.trim()).filter(Boolean),
      contactPhone: formData.phone,
      verificationStatus: formData.verificationStatus,
      verificationNotes: formData.verificationNotes,
      isActive: formData.verificationStatus === 'inactive' ? false : formData.isActive,
    };

    try {
      if (editingId) {
        await api.put(`/admin/theatres/${editingId}`, payload);
        setFeedback({ type: 'success', text: 'Theatre updated successfully!' });
      } else {
        await api.post('/admin/theatres', payload);
        setFeedback({ type: 'success', text: 'Theatre added successfully!' });
      }
      setTimeout(() => {
        setIsModalOpen(false);
        fetchTheatres();
        fetchCoverageStats();
      }, 1000);
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to save theatre' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleSetVerificationStatus = async (theatre, newStatus) => {
    try {
      await api.patch(`/admin/theatres/${theatre._id}/verify`, {
        status: newStatus,
        notes: `Marked as ${newStatus} by admin on ${new Date().toLocaleDateString()}.`,
      });
      fetchTheatres();
      fetchCoverageStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update verification');
    }
  };

  const handleToggleActive = async (theatre) => {
    const newActive = !theatre.isActive;
    try {
      await api.put(`/admin/theatres/${theatre._id}`, {
        isActive: newActive,
        verificationStatus: !newActive ? 'inactive' : theatre.verificationStatus === 'inactive' ? 'verified' : theatre.verificationStatus,
      });
      fetchTheatres();
      fetchCoverageStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete theatre "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/theatres/${id}`);
      fetchTheatres();
      fetchCoverageStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete theatre');
    }
  };

  // Trigger Safe Theatre Import
  const handleRunImport = async () => {
    setImportLoading(true);
    setImportReport(null);
    try {
      const res = await api.post('/admin/theatres/import', {
        mode: importMode,
        limit: 0,
      });
      setImportReport(res.data?.data || res.data);
      fetchTheatres();
      fetchCoverageStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Import failed. Check network connectivity.');
    } finally {
      setImportLoading(false);
    }
  };

  // Duplicate Detection Handler
  const handleScanDuplicates = async () => {
    setDuplicateLoading(true);
    setDuplicateActionMsg('');
    try {
      const res = await api.get('/admin/theatres/duplicates');
      const data = res.data?.data || res.data;
      setDuplicateClusters(data.clusters || []);
      setIsDuplicateModalOpen(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to scan duplicates');
    } finally {
      setDuplicateLoading(false);
    }
  };

  const handleResolveDuplicate = async (duplicateTheatreId, action) => {
    try {
      if (action === 'delete') {
        await api.delete(`/admin/theatres/${duplicateTheatreId}`);
        setDuplicateActionMsg('Redundant duplicate theatre deleted successfully.');
      } else if (action === 'inactive') {
        await api.patch(`/admin/theatres/${duplicateTheatreId}/verify`, {
          status: 'inactive',
          notes: 'Marked inactive as duplicate during admin review.',
        });
        setDuplicateActionMsg('Theatre marked inactive / closed.');
      }
      // Refresh duplicate scan
      const res = await api.get('/admin/theatres/duplicates');
      const refreshedData = res.data?.data || res.data;
      setDuplicateClusters(refreshedData?.clusters || []);
      fetchTheatres();
      fetchCoverageStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white font-display">
              All-India Cinema Directory &amp; Administration
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              {coverageStats?.statesCoveredCount || 20} States &amp; UTs Active
            </span>
          </div>
          <p className="text-xs text-navy-400 mt-1">
            Manage authentic cinemas across 28 states &amp; 8 UTs, run Google Places / OpenStreetMap imports, audit duplicate records, review coordinates, and control operating status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleScanDuplicates}
            disabled={duplicateLoading}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-cine-800 hover:bg-cine-700 text-xs font-semibold text-amber-300 border border-amber-500/30 transition shadow-glow-amber disabled:opacity-50"
            title="Scan database for duplicates within 450m or with identical names"
          >
            {duplicateLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            ) : (
              <Copy className="w-4 h-4 text-amber-400" />
            )}
            <span>Scan Duplicates</span>
          </button>

          <button
            onClick={() => {
              setImportReport(null);
              setIsImportModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-cine-800 hover:bg-cine-700 text-xs font-semibold text-teal-300 border border-teal-500/30 transition shadow-glow-teal"
          >
            <Download className="w-4 h-4 text-teal-400" />
            <span>Import &amp; Sync Data</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-primary hover:bg-accent-primary/90 text-xs font-semibold text-white shadow-lg shadow-accent-primary/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Verified Cinema</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      {coverageStats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3.5">
          <div className="p-4 rounded-2xl bg-navy-900/80 border border-navy-800 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-navy-400">Total Directory</span>
            <div className="text-2xl font-black text-white">{coverageStats.totalTheatres}</div>
            <div className="text-[11px] text-teal-400">All-India Cinemas</div>
          </div>

          <div className="p-4 rounded-2xl bg-navy-900/80 border border-emerald-500/20 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified Real</span>
            </span>
            <div className="text-2xl font-black text-emerald-300">{coverageStats.totalVerified}</div>
            <div className="text-[11px] text-emerald-400/80">Major chains &amp; landmarks</div>
          </div>

          <div className="p-4 rounded-2xl bg-navy-900/80 border border-amber-500/20 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>OSM / Directory</span>
            </span>
            <div className="text-2xl font-black text-amber-300">{coverageStats.totalUnverified}</div>
            <div className="text-[11px] text-amber-400/80">Public directory imported</div>
          </div>

          <div className="p-4 rounded-2xl bg-navy-900/80 border border-violet-500/20 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              <span>States / UTs</span>
            </span>
            <div className="text-2xl font-black text-violet-300">{coverageStats.statesCoveredCount || 20} / 36</div>
            <div className="text-[11px] text-violet-400/80">Active territories</div>
          </div>

          <div
            onClick={() => setShowDistrictAudit(!showDistrictAudit)}
            className="p-4 rounded-2xl bg-navy-900/80 border border-navy-800 hover:border-teal-500/40 cursor-pointer transition space-y-1 group"
            title="Click to toggle coverage audit"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-navy-400 group-hover:text-teal-300">
                Districts Covered
              </span>
              <span className="text-[10px] text-teal-400 font-bold">{showDistrictAudit ? 'Hide' : 'Audit'}</span>
            </div>
            <div className="text-2xl font-black text-white">
              {coverageStats.districtsCoveredCount || 81}
            </div>
            <div className="text-[11px] text-teal-400 font-semibold">
              Districts with venues
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-navy-900/80 border border-rose-500/20 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
              <Power className="w-3.5 h-3.5" />
              <span>Inactive / Closed</span>
            </span>
            <div className="text-2xl font-black text-rose-300">{coverageStats.totalInactive || 0}</div>
            <div className="text-[11px] text-rose-400/80">Marked closed or suspended</div>
          </div>
        </div>
      )}

      {/* Coverage Audit Panel */}
      {showDistrictAudit && coverageStats && (
        <div className="p-5 rounded-2xl bg-navy-900/90 border border-teal-500/30 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-navy-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white font-display">
                All-India States &amp; Territories Coverage Breakdown
              </h3>
            </div>
            <span className="text-xs text-navy-400">
              Click any state to filter cinema directory
            </span>
          </div>

          <div className="p-3 rounded-xl bg-navy-950/80 border border-navy-800 text-xs text-navy-300 leading-relaxed">
            <span className="font-bold text-teal-400">Directory Coverage Integrity: </span>
            Prioritizing authentic multiplexes and verified single screens first. Starting with complete Tamil Nadu coverage (740 venues), with premier verified multiplexes active across Maharashtra, Karnataka, Telangana, Delhi NCR, Kerala, Andhra Pradesh, Gujarat, and other states.
          </div>

          {/* State Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-1">
            {coverageStats.states?.map((st) => {
              const isSelected = stateFilter.toLowerCase() === st.name.toLowerCase();
              const hasTheatres = st.theatresCount > 0;

              return (
                <button
                  key={st.code}
                  onClick={() => {
                    setStateFilter(isSelected ? '' : st.name);
                    setDistrictFilter('');
                  }}
                  className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-teal-500/20 border-teal-400 text-white shadow-glow-teal'
                      : hasTheatres
                      ? 'bg-navy-950/60 border-navy-800/80 hover:border-navy-700 text-navy-200'
                      : 'bg-navy-950/30 border-navy-900 text-navy-500 hover:text-navy-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs truncate text-white">{st.name}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      isSelected
                        ? 'bg-teal-500/30 text-teal-300'
                        : hasTheatres
                        ? 'bg-navy-800 text-teal-300'
                        : 'bg-navy-900 text-navy-500'
                    }`}>
                      {st.theatresCount}
                    </span>
                  </div>
                  <div className="text-[10px] text-navy-400 mt-1 flex items-center justify-between">
                    <span>{st.verifiedCount} verified</span>
                    <span className="text-[9px] text-slate-400">{st.districtsCoveredCount} dist</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-navy-900/70 border border-navy-800 p-3.5 rounded-2xl">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by theatre name, brand, city, district, state, address, or PIN code..."
            className="w-full bg-navy-950/80 border border-navy-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-accent-primary placeholder-navy-500"
          />
        </div>

        {/* State Selector */}
        <select
          value={stateFilter}
          onChange={(e) => {
            setStateFilter(e.target.value);
            setDistrictFilter('');
          }}
          className="w-full md:w-48 bg-navy-950/80 border border-navy-800 rounded-xl px-3 py-2 text-xs text-navy-200 focus:outline-none focus:border-accent-primary"
        >
          <option value="">All States &amp; UTs</option>
          {ALL_INDIA_STATES_LIST.map((st) => (
            <option key={st.code} value={st.name}>
              {st.name}
            </option>
          ))}
        </select>

        {/* District Selector */}
        <select
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          className="w-full md:w-52 bg-navy-950/80 border border-navy-800 rounded-xl px-3 py-2 text-xs text-navy-200 focus:outline-none focus:border-accent-primary"
        >
          <option value="">{stateFilter ? `All Districts in ${stateFilter}` : 'All Districts'}</option>
          {(availableDistricts.length > 0 ? availableDistricts : TAMIL_NADU_DISTRICTS_LIST).map((d) => (
            <option key={d.id} value={d.name}>
              {d.name} District
            </option>
          ))}
        </select>

        {/* Verification Status Selector */}
        <select
          value={verificationFilter}
          onChange={(e) => setVerificationFilter(e.target.value)}
          className="w-full md:w-44 bg-navy-950/80 border border-navy-800 rounded-xl px-3 py-2 text-xs text-navy-200 focus:outline-none focus:border-accent-primary"
        >
          <option value="">All Statuses</option>
          <option value="verified">Verified Real Theatres</option>
          <option value="unverified">Unverified Records</option>
          <option value="inactive">Inactive / Closed</option>
        </select>

        {(stateFilter || districtFilter || verificationFilter || searchQuery) && (
          <button
            onClick={() => {
              setStateFilter('');
              setDistrictFilter('');
              setVerificationFilter('');
              setSearchQuery('');
            }}
            className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 px-2 py-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Theatres Count Note */}
      <div className="flex items-center justify-between text-xs text-navy-400 px-1">
        <span>
          Showing <strong className="text-white">{theatres.length}</strong> theatres
          {stateFilter ? ` in ${stateFilter}` : ' across India'}
          {districtFilter ? ` (${districtFilter} Dist)` : ''}
        </span>
      </div>

      {/* Theatres Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 rounded-2xl bg-navy-900/40 border border-navy-800 animate-pulse" />
          ))}
        </div>
      ) : theatres.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {theatres.map((t) => {
            const isVerified = t.verificationStatus === 'verified';
            const isInactive = t.verificationStatus === 'inactive' || t.isActive === false;
            const coords = t.location?.coordinates || [];

            return (
              <div
                key={t._id}
                className={`border rounded-2xl p-5 space-y-3.5 flex flex-col justify-between transition-all ${
                  isInactive
                    ? 'bg-navy-950/40 border-navy-800/60 opacity-75'
                    : 'bg-navy-900/70 border-navy-800 hover:border-navy-700'
                }`}
              >
                <div>
                  {/* Status Badges Header */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      {isInactive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          <Power className="w-3 h-3 text-rose-400" />
                          <span>Inactive / Closed</span>
                        </span>
                      ) : isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          <AlertCircle className="w-3 h-3 text-amber-400" />
                          <span>Unverified</span>
                        </span>
                      )}

                      {t.category && (
                        <span className="px-2 py-0.5 rounded-md bg-navy-950 border border-navy-800 text-[10px] text-teal-300 font-medium">
                          {t.category}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Verification Status Quick Action Dropdown */}
                      <select
                        value={t.verificationStatus || 'unverified'}
                        onChange={(e) => handleSetVerificationStatus(t, e.target.value)}
                        className="bg-navy-950 border border-navy-800 rounded-lg px-2 py-0.5 text-[10px] text-navy-200 focus:outline-none"
                        title="Change verification status"
                      >
                        <option value="verified">Verified</option>
                        <option value="unverified">Unverified</option>
                        <option value="inactive">Inactive</option>
                      </select>

                      <button
                        onClick={() => handleToggleActive(t)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.isActive
                            ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                        }`}
                        title="Toggle Active / Inactive"
                      >
                        {t.isActive ? 'Active' : 'Closed'}
                      </button>

                      <Link
                        to={`/admin/shows?theatreId=${t._id}`}
                        className="p-1 rounded-lg text-teal-400 hover:text-white hover:bg-navy-800 transition"
                        title="Configure & Manage Shows for this Theatre"
                      >
                        <Film className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => handleOpenEdit(t)}
                        className="p-1 rounded-lg text-navy-400 hover:text-white hover:bg-navy-800 transition"
                        title="Edit Theatre"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(t._id, t.name)}
                        className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                        title="Delete Theatre"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title and District */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                      {t.district ? `${t.district} District` : 'Tamil Nadu'} • {t.brand || 'Cinema'}
                    </span>
                    <h3 className="font-bold text-white text-base mt-0.5 flex items-center justify-between">
                      <span>{t.name}</span>
                      {t.screensCount && (
                        <span className="text-[10px] font-normal text-navy-400">
                          {t.screensCount} {t.screensCount === 1 ? 'Screen' : 'Screens'}
                        </span>
                      )}
                    </h3>
                  </div>

                  {/* Address */}
                  <p className="text-xs text-navy-300 flex items-start gap-1.5 mt-2">
                    <MapPin className="w-3.5 h-3.5 text-accent-secondary shrink-0 mt-0.5" />
                    <span>
                      {t.address || t.addressLine}, {t.city}
                      {t.pinCode || t.pincode ? ` — PIN: ${t.pinCode || t.pincode}` : ''}
                    </span>
                  </p>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1.5 pt-2.5">
                    {(t.amenities || []).slice(0, 3).map((a, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-navy-950 border border-navy-800 text-[10px] text-navy-300"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Details */}
                <div className="flex items-center justify-between pt-3 text-[11px] text-navy-400 border-t border-navy-800/80">
                  <span className="font-mono text-accent-secondary text-[10px]">
                    {coords.length >= 2 ? `${coords[1].toFixed(4)}°N, ${coords[0].toFixed(4)}°E` : 'Coords set'}
                  </span>
                  <span className="text-[10px] text-navy-400">
                    Source: <strong className="text-navy-300">{t.source === 'verified_directory' ? 'Verified Registry' : t.source || 'osm'}</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-navy-900/40 border border-navy-800 space-y-3">
          <Building2 className="w-10 h-10 text-navy-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Theatres Matched Query</h3>
          <p className="text-xs text-navy-400 max-w-sm mx-auto">
            Try choosing another district or click "Import & Sync Data" to sync theatres from legitimate directories.
          </p>
        </div>
      )}

      {/* Add / Edit Theatre Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Cinema Complex' : 'Add Verified Cinema Complex'}
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs max-h-[70vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-navy-300 font-medium mb-1">Cinema Complex Name</label>
            <input
              type="text"
              required
              placeholder="e.g. SPI Sathyam Cinemas / PVR INOX"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-navy-300 font-medium mb-1">Chain / Brand</label>
              <input
                type="text"
                placeholder="e.g. PVR INOX / AGS / SPI Cinemas"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
              />
            </div>

            <div>
              <label className="block text-navy-300 font-medium mb-1">Category & Screens</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="bg-navy-950 border border-navy-800 rounded-xl px-2 py-2 text-white focus:outline-none focus:border-accent-primary"
                >
                  <option value="Multiplex">Multiplex</option>
                  <option value="Single Screen">Single Screen</option>
                  <option value="Premium Cinema">Premium Cinema</option>
                  <option value="Drive-in">Drive-in</option>
                </select>

                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.screensCount}
                  onChange={(e) => setFormData({ ...formData, screensCount: e.target.value })}
                  placeholder="Screens"
                  className="bg-navy-950 border border-navy-800 rounded-xl px-2 py-2 text-white focus:outline-none focus:border-accent-primary"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-navy-300 font-medium mb-1">State / Union Territory</label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
              >
                {ALL_INDIA_STATES_LIST.map((st) => (
                  <option key={st.code} value={st.name}>
                    {st.name} ({st.type === 'Union Territory' ? 'UT' : 'State'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-navy-300 font-medium mb-1">District</label>
              <input
                type="text"
                required
                placeholder="e.g. Chennai, Mumbai, Bengaluru"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-navy-300 font-medium mb-1">City / Town</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
              />
            </div>

            <div>
              <label className="block text-navy-300 font-medium mb-1">Area / Locality</label>
              <input
                type="text"
                placeholder="e.g. Royapettah / Gandhipuram"
                value={formData.locality}
                onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-navy-300 font-medium mb-1">PIN Code</label>
              <input
                type="text"
                placeholder="e.g. 600014"
                value={formData.pinCode}
                onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
              />
            </div>

            <div>
              <label className="block text-navy-300 font-medium mb-1">Contact Phone</label>
              <input
                type="text"
                placeholder="e.g. +91 44 2852 4444"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-navy-300 font-medium mb-1">Full Street Address</label>
            <input
              type="text"
              required
              placeholder="e.g. 8, Thiru-Vi-Ka Road, Royapettah"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-navy-300 font-medium mb-1">Longitude (East)</label>
              <input
                type="number"
                step="any"
                required
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary font-mono"
              />
            </div>

            <div>
              <label className="block text-navy-300 font-medium mb-1">Latitude (North)</label>
              <input
                type="number"
                step="any"
                required
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-navy-300 font-medium mb-1">Verification Status</label>
              <select
                value={formData.verificationStatus}
                onChange={(e) => setFormData({ ...formData, verificationStatus: e.target.value })}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
              >
                <option value="verified">Verified Real Cinema</option>
                <option value="unverified">Unverified Record</option>
                <option value="inactive">Inactive / Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-navy-300 font-medium mb-1">Contact Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-navy-300 font-medium mb-1">Amenities & Facilities (comma-separated)</label>
            <input
              type="text"
              value={formData.amenities}
              onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
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
              {formLoading ? 'Saving...' : editingId ? 'Update Theatre' : 'Add Verified Complex'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Duplicate Detection & Audit Modal */}
      <Modal
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
        title="Duplicate Theatre Detection & Review"
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
          <p className="text-slate-300 leading-relaxed">
            Detects venues within 450 meters or having matching normalized names across Tamil Nadu. Review clusters to mark duplicates as inactive or delete redundant records.
          </p>

          {duplicateActionMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{duplicateActionMsg}</span>
            </div>
          )}

          {duplicateClusters.length > 0 ? (
            <div className="space-y-4">
              <div className="text-xs font-bold text-amber-400">
                Found {duplicateClusters.length} suspected duplicate cluster(s):
              </div>

              {duplicateClusters.map((cluster, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-navy-950/80 border border-navy-800 space-y-3">
                  {/* Primary Venue */}
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      Primary Record ({cluster.primary.source === 'verified_directory' ? 'Verified Registry' : 'OSM'})
                    </span>
                    <div className="font-bold text-white text-sm mt-0.5">{cluster.primary.name}</div>
                    <div className="text-[11px] text-slate-300 mt-1">
                      {cluster.primary.address}, {cluster.primary.district}
                    </div>
                  </div>

                  {/* Suspected Duplicates */}
                  <div className="space-y-2 pl-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      Potential Duplicates:
                    </span>

                    {cluster.duplicates.map((dup, dIdx) => (
                      <div
                        key={dIdx}
                        className="p-3 rounded-lg bg-navy-900 border border-navy-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="font-bold text-white">{dup.theatre.name}</div>
                          <div className="text-[11px] text-slate-400">
                            {dup.theatre.address}, {dup.theatre.district}
                          </div>
                          <div className="text-[10px] text-amber-400 mt-0.5">
                            Reason: {dup.reason} ({dup.distanceMeters}m apart) • Status: {dup.theatre.verificationStatus}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleResolveDuplicate(dup.theatre._id, 'inactive')}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold"
                          >
                            Mark Inactive
                          </button>

                          <button
                            onClick={() => handleResolveDuplicate(dup.theatre._id, 'delete')}
                            className="px-2.5 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-[10px] font-bold"
                          >
                            Delete Duplicate
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-xl bg-navy-900/50 border border-navy-800 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Suspicious Duplicates Found</h4>
              <p className="text-xs text-slate-400">
                All records currently in the database pass spatial and normalized name uniqueness checks!
              </p>
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-navy-800">
            <button
              onClick={() => setIsDuplicateModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-white text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Theatre Data Import & Sync Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="All-India Cinema Data Import & Sync"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-300 leading-relaxed">
            Synchronize authentic theatre data across all 28 states &amp; 8 UTs. Equipped with spatial proximity (&lt; 400m),
            provider place ID and normalized name deduplication to safely update records without duplicating or breaking active showtimes.
          </p>

          {/* Google Places API Key Status Banner */}
          <div className="p-3 rounded-xl bg-navy-950/90 border border-navy-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-teal-400 shrink-0" />
              <div>
                <span className="font-bold text-white">Google Places API Status: </span>
                {coverageStats?.googlePlacesStatus?.configured ? (
                  <span className="text-emerald-400 font-bold">Configured &amp; Active</span>
                ) : (
                  <span className="text-amber-400 font-bold">Fallback / Manual Mode</span>
                )}
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {coverageStats?.googlePlacesStatus?.configured
                    ? 'Backend queries Google Places API for real place IDs and live business locations.'
                    : 'To enable live Google Places searches, configure GOOGLE_PLACES_API_KEY in backend/.env.'}
                </p>
              </div>
            </div>
          </div>

          {/* Import Mode Selector */}
          <div className="space-y-2">
            <label className="block font-semibold text-white">Select Import Source:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setImportMode('national')}
                className={`p-3 rounded-xl border text-left transition ${
                  importMode === 'national'
                    ? 'bg-violet-600/30 border-violet-500 text-white font-bold shadow-glow-violet'
                    : 'bg-cine-800/50 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-semibold text-white">All-India Verified</div>
                <div className="text-[10px] text-slate-400 mt-1">56 premier multiplexes across 20+ states &amp; UTs</div>
              </button>

              <button
                type="button"
                onClick={() => setImportMode('google_places')}
                className={`p-3 rounded-xl border text-left transition ${
                  importMode === 'google_places'
                    ? 'bg-emerald-600/30 border-emerald-500 text-white font-bold shadow-glow-emerald'
                    : 'bg-cine-800/50 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-semibold text-white">Google Places API</div>
                <div className="text-[10px] text-slate-400 mt-1">Live Places API sync with safe fallback</div>
              </button>

              <button
                type="button"
                onClick={() => setImportMode('curated')}
                className={`p-3 rounded-xl border text-left transition ${
                  importMode === 'curated'
                    ? 'bg-teal-500/30 border-teal-500 text-white font-bold'
                    : 'bg-cine-800/50 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-semibold text-white">TN Curated Registry</div>
                <div className="text-[10px] text-slate-400 mt-1">130 verified major chains in 38 TN districts</div>
              </button>

              <button
                type="button"
                onClick={() => setImportMode('osm')}
                className={`p-3 rounded-xl border text-left transition ${
                  importMode === 'osm'
                    ? 'bg-teal-500/30 border-teal-500 text-white font-bold'
                    : 'bg-cine-800/50 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-semibold text-white">OpenStreetMap</div>
                <div className="text-[10px] text-slate-400 mt-1">664 authentic OSM cinemas from Tamil Nadu</div>
              </button>

              <button
                type="button"
                onClick={() => setImportMode('all')}
                className={`p-3 rounded-xl border text-left transition sm:col-span-2 ${
                  importMode === 'all'
                    ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold'
                    : 'bg-cine-800/50 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-semibold text-white">Full All-India Sync</div>
                <div className="text-[10px] text-slate-400 mt-1">All-India Verified + TN Curated + OpenStreetMap dataset</div>
              </button>
            </div>
          </div>

          {/* Trigger Button */}
          <button
            onClick={handleRunImport}
            disabled={importLoading}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-glow-violet transition disabled:opacity-50"
          >
            {importLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing &amp; Deduplicating Theatres...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Execute Safe Synchronized Import</span>
              </>
            )}
          </button>

          {/* Import Report */}
          {importReport && (
            <div className="p-4 rounded-xl bg-cine-800/90 border border-teal-500/30 space-y-3">
              <div className="flex items-center gap-2 text-teal-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Import and Deduplication Report</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                  <div className="text-slate-400">Newly Added</div>
                  <div className="text-base font-black text-emerald-400">
                    {(importReport.nationalReport?.newlyImported || 0) +
                      (importReport.googlePlacesReport?.newlyImported || 0) +
                      (importReport.curatedReport?.newlyImported || 0) +
                      (importReport.osmReport?.newlyImported || 0)}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                  <div className="text-slate-400">Updated</div>
                  <div className="text-base font-black text-teal-400">
                    {(importReport.nationalReport?.updated || 0) +
                      (importReport.googlePlacesReport?.updated || 0) +
                      (importReport.curatedReport?.updated || 0) +
                      (importReport.osmReport?.updated || 0)}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                  <div className="text-slate-400">Duplicates Skipped</div>
                  <div className="text-base font-black text-amber-400">
                    {(importReport.nationalReport?.duplicatesSkipped || 0) +
                      (importReport.googlePlacesReport?.duplicatesSkipped || 0) +
                      (importReport.curatedReport?.duplicatesSkipped || 0) +
                      (importReport.osmReport?.duplicatesSkipped || 0)}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                  <div className="text-slate-400">States Covered</div>
                  <div className="text-base font-black text-white">
                    {importReport.coverage?.statesCoveredCount || 20} / 36
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400">
                Verified records: <strong className="text-emerald-400">{importReport.coverage?.totalVerified}</strong> • Unverified records: <strong className="text-amber-400">{importReport.coverage?.totalUnverified}</strong> • Closed/Inactive: <strong className="text-rose-400">{importReport.coverage?.totalInactive || 0}</strong> • Districts: <strong className="text-white">{importReport.coverage?.districtsCoveredCount || 81}</strong>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AdminTheatresPage;
