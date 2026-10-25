import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  MapPin,
  List,
  Map,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
  Navigation,
  RotateCcw,
  Calendar,
  Film,
  Sparkles,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import api from '../../services/api';
import {
  useLocationContext,
  ALL_INDIA_STATES_LIST,
  TAMIL_NADU_DISTRICTS_LIST,
} from '../../context/LocationContext';
import { getLocalDateString, getDynamicDateTabs } from '../../utils/dateUtils';
import TheatreCard from '../../components/theatres/TheatreCard';
import TheatreMap from '../../components/theatres/TheatreMap';

const TheatresPage = () => {
  const {
    selectedState,
    selectedDistrict,
    selectedCity,
    detectedArea,
    userCoords,
    openLocationModal,
    selectStateManually,
    selectDistrictManually,
    selectCityManually,
  } = useLocationContext();

  const [theatres, setTheatres] = useState([]);
  const [moviesList, setMoviesList] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStateFilter, setSelectedStateFilter] = useState(selectedState || 'All');
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState(selectedDistrict || 'All');
  const [selectedCityFilter, setSelectedCityFilter] = useState('All');
  const [selectedVerification, setSelectedVerification] = useState('All'); // 'All' | 'verified' | 'unverified'
  const [selectedRadius, setSelectedRadius] = useState(50);
  const [selectedAmenity, setSelectedAmenity] = useState('All');
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString(0));
  const [selectedMovieFilter, setSelectedMovieFilter] = useState('All');
  const [sortBy, setSortBy] = useState('shows'); // 'distance' | 'rating' | 'shows' | 'name'
  const [onlyWithShows, setOnlyWithShows] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic Date Tabs for Today, Tomorrow, and upcoming dates
  const dateTabs = getDynamicDateTabs(6);

  // Fetch available movies for the movie filter dropdown
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await api.get('/movies');
        const raw = res.data?.data || res.data || [];
        const list = Array.isArray(raw) ? raw : (raw.movies || []);
        setMoviesList(list);
      } catch (err) {
        console.warn('Failed to load movies for filter:', err);
      }
    };
    fetchMovies();
  }, []);

  // Sync state & district filters with location context when user changes location in modal
  useEffect(() => {
    if (selectedState) {
      setSelectedStateFilter(selectedState);
    }
  }, [selectedState]);

  useEffect(() => {
    if (selectedDistrict) {
      setSelectedDistrictFilter(selectedDistrict);
    }
  }, [selectedDistrict]);

  const amenitiesList = [
    'All',
    'Dolby Atmos',
    'Recliner Seats',
    'IMAX Laser',
    '4K Laser Projection',
    'Parking',
    'Food & Beverage',
  ];

  // Derive districts for the current state filter
  const currentStateObj = ALL_INDIA_STATES_LIST.find(
    (s) => s.name.toLowerCase() === (selectedStateFilter || '').toLowerCase()
  );
  const availableDistricts = currentStateObj ? currentStateObj.districts : [];

  // Derive cities for the selected district filter
  const currentDistrictObj = (availableDistricts.length > 0 ? availableDistricts : TAMIL_NADU_DISTRICTS_LIST).find(
    (d) => d.name.toLowerCase() === (selectedDistrictFilter || '').toLowerCase()
  );
  const districtCities = currentDistrictObj ? currentDistrictObj.cities : [];

  useEffect(() => {
    const fetchTheatres = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          lat: userCoords.lat,
          lng: userCoords.lng,
          radius: selectedRadius,
          date: selectedDate,
        });

        if (selectedStateFilter && selectedStateFilter !== 'All') {
          params.append('state', selectedStateFilter);
        }
        if (selectedDistrictFilter && selectedDistrictFilter !== 'All') {
          params.append('district', selectedDistrictFilter);
        }
        if (selectedVerification && selectedVerification !== 'All') {
          params.append('verificationStatus', selectedVerification);
        }
        if (selectedMovieFilter && selectedMovieFilter !== 'All') {
          params.append('movie', selectedMovieFilter);
        }

        const res = await api.get(`/theatres/nearby?${params.toString()}`);
        let list = res.data?.data?.theatres || res.data?.theatres || [];

        // Apply city filter if set
        if (selectedCityFilter && selectedCityFilter !== 'All') {
          const cFilter = selectedCityFilter.toLowerCase().trim();
          list = list.filter(
            (th) =>
              th.city?.toLowerCase() === cFilter ||
              th.locality?.toLowerCase() === cFilter ||
              th.address?.toLowerCase().includes(cFilter)
          );
        }

        // Apply amenity filter if set
        if (selectedAmenity !== 'All') {
          list = list.filter((th) => th.amenities?.includes(selectedAmenity));
        }

        // Apply text search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          list = list.filter(
            (th) =>
              th.name?.toLowerCase().includes(q) ||
              (th.address || th.addressLine || '').toLowerCase().includes(q) ||
              th.city?.toLowerCase().includes(q) ||
              th.district?.toLowerCase().includes(q) ||
              th.state?.toLowerCase().includes(q) ||
              th.pinCode?.includes(q) ||
              (th.movies && th.movies.some((m) => m.movie?.title?.toLowerCase().includes(q)))
          );
        }

        // Filter by hasShows if toggled
        if (onlyWithShows) {
          list = list.filter((th) => th.hasShows);
        }

        // Sort results
        if (sortBy === 'distance') {
          list.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
        } else if (sortBy === 'rating') {
          list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else if (sortBy === 'shows') {
          list.sort((a, b) => (b.totalShowsCount || 0) - (a.totalShowsCount || 0) || (b.rating || 0) - (a.rating || 0));
        } else if (sortBy === 'name') {
          list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        }

        setTheatres(list);
      } catch (err) {
        console.error('[Theatres Fetch Error]:', err);
        // Fallback to standard filtered list
        try {
          const fallbackParams = { date: selectedDate };
          if (selectedStateFilter && selectedStateFilter !== 'All') {
            fallbackParams.state = selectedStateFilter;
          }
          if (selectedDistrictFilter && selectedDistrictFilter !== 'All') {
            fallbackParams.district = selectedDistrictFilter;
          }
          if (selectedMovieFilter && selectedMovieFilter !== 'All') {
            fallbackParams.movie = selectedMovieFilter;
          }
          const fallback = await api.get('/theatres', { params: fallbackParams });
          const raw = fallback.data?.data?.theatres || fallback.data?.data || fallback.data || [];
          setTheatres(Array.isArray(raw) ? raw : []);
        } catch {
          setTheatres([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTheatres();
  }, [
    userCoords,
    selectedStateFilter,
    selectedDistrictFilter,
    selectedCityFilter,
    selectedVerification,
    selectedRadius,
    selectedAmenity,
    selectedDate,
    selectedMovieFilter,
    sortBy,
    onlyWithShows,
    searchQuery,
  ]);

  const verifiedCount = theatres.filter((th) => th.verificationStatus === 'verified').length;
  const theatresWithShowsCount = theatres.filter((th) => th.hasShows).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-4xl font-black font-display text-white">
              {selectedStateFilter === 'All' ? 'All India' : selectedStateFilter} Theatres
            </h1>
            <button
              onClick={openLocationModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 text-violet-300 hover:text-white text-xs font-bold transition-all shadow-glow-violet"
              title="Change Cinema District or Location"
            >
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              <span>
                {detectedArea ? `${detectedArea}, ` : ''}{selectedCity} ({selectedDistrict} Dist, {selectedState})
              </span>
              <span className="text-[10px] text-teal-400 underline font-semibold ml-1">Change</span>
            </button>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse verified cinema theatres across {selectedStateFilter === 'All' ? 'all Indian states, union territories and districts' : selectedStateFilter} with live movie listings, addresses &amp; showtimes.
          </p>
        </div>

        {/* View Switcher: List vs Map */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-cine-800 border border-white/10 self-start">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'list' ? 'bg-violet-600 text-white shadow-glow-violet' : 'text-slate-400 hover:text-white'
            }`}
          >
            <List className="w-4 h-4" />
            <span>List View</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'map' ? 'bg-teal-500 text-white shadow-glow-teal' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>Map View</span>
          </button>
        </div>
      </div>

      {/* Dynamic Date Bar (Today, Tomorrow, and upcoming 5 dates) */}
      <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Select Showtime Date</span>
          </span>
          <span className="text-[11px] text-slate-400">
            Selected: <strong className="text-white">{selectedDate}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {dateTabs.map((tab) => {
            const isSelected = selectedDate === tab.dateStr;
            return (
              <button
                key={tab.dateStr}
                onClick={() => setSelectedDate(tab.dateStr)}
                className={`flex flex-col items-center min-w-[95px] py-2 px-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-violet-600 border-violet-500 text-white shadow-glow-violet scale-105 font-bold'
                    : 'bg-cine-850/80 border-white/10 text-slate-300 hover:text-white hover:border-white/20'
                }`}
              >
                <span className="text-[10px] font-bold uppercase">{tab.dayName}</span>
                <span className="text-xs font-extrabold mt-0.5">{tab.formattedDate}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-white/10 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search theatre, movie, or PIN..."
              className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs text-white placeholder-slate-400 focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* State / UT Dropdown */}
          <div>
            <select
              value={selectedStateFilter}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedStateFilter(val);
                setSelectedDistrictFilter('All');
                setSelectedCityFilter('All');
                if (val !== 'All') {
                  selectStateManually(val);
                }
              }}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs font-semibold text-white focus:outline-none focus:border-violet-500"
            >
              <option value="All" className="bg-cine-900 text-white">All India (States &amp; UTs)</option>
              {ALL_INDIA_STATES_LIST.map((st) => (
                <option key={st.code} value={st.name} className="bg-cine-900 text-white">
                  {st.name} ({st.type === 'Union Territory' ? 'UT' : 'State'})
                </option>
              ))}
            </select>
          </div>

          {/* District Dropdown */}
          <div>
            <select
              value={selectedDistrictFilter}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedDistrictFilter(val);
                setSelectedCityFilter('All');
                if (val !== 'All') {
                  selectDistrictManually(val, selectedStateFilter !== 'All' ? selectedStateFilter : undefined);
                }
              }}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs font-semibold text-white focus:outline-none focus:border-violet-500"
            >
              <option value="All" className="bg-cine-900 text-white">
                {selectedStateFilter === 'All' ? 'All Districts' : `All Districts in ${selectedStateFilter}`}
              </option>
              {(availableDistricts.length > 0 ? availableDistricts : TAMIL_NADU_DISTRICTS_LIST).map((d) => (
                <option key={d.id} value={d.name} className="bg-cine-900 text-white">
                  {d.name} District
                </option>
              ))}
            </select>
          </div>

          {/* City / Town Dropdown */}
          <div>
            <select
              value={selectedCityFilter}
              onChange={(e) => setSelectedCityFilter(e.target.value)}
              disabled={selectedDistrictFilter === 'All'}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs font-semibold text-white focus:outline-none focus:border-violet-500 disabled:opacity-50"
            >
              <option value="All" className="bg-cine-900 text-white">
                {selectedDistrictFilter === 'All' ? 'Select a district first' : `All Towns in ${selectedDistrictFilter}`}
              </option>
              {districtCities.map((c) => (
                <option key={c} value={c} className="bg-cine-900 text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Movie Dropdown */}
          <div>
            <select
              value={selectedMovieFilter}
              onChange={(e) => setSelectedMovieFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs font-semibold text-white focus:outline-none focus:border-violet-500"
            >
              <option value="All" className="bg-cine-900 text-white">All Movies</option>
              {moviesList.map((m) => (
                <option key={m._id} value={m._id} className="bg-cine-900 text-white">
                  {m.title} ({Array.isArray(m.language) ? m.language[0] : m.language || 'Tamil'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Sort Options */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2.5 py-1 rounded-lg glass-input text-[11px] font-semibold text-white focus:outline-none"
              >
                <option value="shows" className="bg-cine-900 text-white">Sort: Most Shows</option>
                <option value="distance" className="bg-cine-900 text-white">Sort: Nearest Distance</option>
                <option value="rating" className="bg-cine-900 text-white">Sort: Highest Rated</option>
                <option value="name" className="bg-cine-900 text-white">Sort: Alphabetical (A-Z)</option>
              </select>
            </div>

            {/* Verification Filter */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-cine-800/80 border border-white/5">
              <button
                onClick={() => setSelectedVerification('All')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                  selectedVerification === 'All' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Venues
              </button>
              <button
                onClick={() => setSelectedVerification('verified')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                  selectedVerification === 'verified' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Verified
              </button>
            </div>

            {/* Only With Shows Toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-300 select-none">
              <input
                type="checkbox"
                checked={onlyWithShows}
                onChange={(e) => setOnlyWithShows(e.target.checked)}
                className="rounded accent-violet-600"
              />
              <span>With Active Shows Only</span>
            </label>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>
              Showing <strong className="text-white">{theatres.length}</strong> theatres
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline text-teal-400 font-semibold">
              {theatresWithShowsCount} with shows today
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline text-emerald-400 font-semibold">
              {verifiedCount} verified
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-6 rounded-2xl glass-card border border-white/10 animate-pulse space-y-4">
              <div className="h-5 w-36 bg-white/10 rounded"></div>
              <div className="h-4 w-52 bg-white/5 rounded"></div>
              <div className="h-3 w-40 bg-white/5 rounded"></div>
              <div className="h-24 bg-white/5 rounded-xl pt-2"></div>
            </div>
          ))}
        </div>
      ) : theatres.length === 0 ? (
        <div className="p-12 text-center rounded-2xl glass-panel border border-white/10 space-y-3">
          <Building2 className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Theatres Match Your Filters</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try expanding your search radius, selecting &quot;All India&quot;, or removing the movie filter.
          </p>
          <button
            onClick={() => {
              setSelectedStateFilter('All');
              setSelectedDistrictFilter('All');
              setSelectedCityFilter('All');
              setSelectedMovieFilter('All');
              setSelectedVerification('All');
              setOnlyWithShows(false);
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-glow-violet transition-all"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {theatres.map((theatre) => (
            <TheatreCard
              key={theatre._id}
              theatre={theatre}
              selectedDate={selectedDate}
            />
          ))}
        </div>
      ) : (
        <div className="h-[650px] rounded-2xl overflow-hidden glass-panel border border-white/10">
          <TheatreMap theatres={theatres} />
        </div>
      )}
    </div>
  );
};

export default TheatresPage;
