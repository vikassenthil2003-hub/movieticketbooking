import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Navigation,
  Search,
  Check,
  AlertCircle,
  Building,
  Loader2,
  X,
  Compass,
  Globe2,
  ChevronDown
} from 'lucide-react';
import Modal from '../common/Modal';
import { useLocationContext, ALL_INDIA_STATES_LIST } from '../../context/LocationContext';

const LocationModal = () => {
  const {
    isLocationModalOpen,
    closeLocationModal,
    selectedState,
    selectedDistrict,
    selectedCity,
    detectedArea,
    detectedPinCode,
    selectStateManually,
    selectDistrictManually,
    selectCityManually,
    selectLocationManually,
    detectLocation,
    isDetecting,
    permissionDenied,
    locationError,
    searchLocations,
  } = useLocationContext();

  const [activeStateTab, setActiveStateTab] = useState(selectedState || 'Tamil Nadu');
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState(selectedDistrict || 'Chennai');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimerRef = useRef(null);

  // Sync state tab when modal opens or selected state changes
  useEffect(() => {
    if (isLocationModalOpen) {
      setActiveStateTab(selectedState || 'Tamil Nadu');
      setSelectedDistrictFilter(selectedDistrict || 'Chennai');
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [isLocationModalOpen, selectedState, selectedDistrict]);

  // Debounced search for any Indian state, district, city, town, or PIN code
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await searchLocations(trimmed);
        setSearchResults(results);
      } catch (err) {
        console.error('[Search Geocode Error]:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, searchLocations]);

  // Find currently active state object
  const activeStateObj =
    ALL_INDIA_STATES_LIST.find(
      (s) => s.name.toLowerCase() === activeStateTab.toLowerCase()
    ) || ALL_INDIA_STATES_LIST[0];

  // Currently focused district object within active state
  const activeDistrictObj =
    activeStateObj?.districts.find(
      (d) => d.name.toLowerCase() === selectedDistrictFilter.toLowerCase()
    ) || activeStateObj?.districts[0];

  // Top cinema states for quick chip selection
  const topCinemaStates = [
    'Tamil Nadu',
    'Maharashtra',
    'Karnataka',
    'Telangana',
    'Delhi',
    'Kerala',
    'Andhra Pradesh',
    'Uttar Pradesh',
    'Gujarat',
    'West Bengal',
    'Rajasthan',
    'Chandigarh',
  ];

  return (
    <Modal
      isOpen={isLocationModalOpen}
      onClose={closeLocationModal}
      title="Select Location — All India Cinema Directory"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* Current Active Location Summary */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-cine-800/90 border border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <span className="text-slate-300">
              Active Cinema Zone:{' '}
              <strong className="text-white">
                {detectedArea ? `${detectedArea}, ` : ''}{selectedCity} ({selectedDistrict} District, {selectedState})
              </strong>
              {detectedPinCode ? <span className="text-slate-400"> • PIN: {detectedPinCode}</span> : null}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-500/20 text-teal-300 border border-teal-500/30 shrink-0">
            Selected
          </span>
        </div>

        {/* GPS Auto-Detect Button */}
        <button
          onClick={detectLocation}
          disabled={isDetecting}
          className="w-full flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-violet-600/20 via-indigo-600/20 to-teal-500/20 border border-violet-500/40 hover:border-violet-400 text-white font-medium transition-all group shadow-glow-violet disabled:opacity-60"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-600 text-white group-hover:scale-110 transition-transform">
              <Navigation className={`w-4 h-4 ${isDetecting ? 'animate-spin' : ''}`} />
            </div>
            <div className="text-left">
              <div className="font-semibold text-white text-xs sm:text-sm">Auto-Detect Current GPS Location</div>
              <div className="text-[11px] text-slate-400">
                {isDetecting
                  ? 'Reverse-geocoding coordinates across India...'
                  : 'Find closest theatres across all Indian states and towns'}
              </div>
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-violet-500/30 text-violet-300 font-semibold flex items-center gap-1.5 shrink-0">
            {isDetecting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Locating...</span>
              </>
            ) : (
              'Use GPS'
            )}
          </span>
        </button>

        {/* Permission Denied or Detection Error Notice */}
        {(permissionDenied || locationError) && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
            <div className="space-y-1">
              <div className="font-semibold">
                {permissionDenied ? 'Location access was denied.' : 'Location unavailable.'}
              </div>
              <div className="text-amber-200/90 text-[11px] leading-relaxed">
                {locationError ||
                  'You can select your state, district, town, or search any PIN code below.'}
              </div>
            </div>
          </div>
        )}

        {/* Search Input for State, District, City, Town, or PIN Code */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search all Indian states, districts, towns, areas, or PIN code..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-violet-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Real-time search status */}
          {isSearching && (
            <div className="flex items-center gap-2 text-xs text-violet-400 px-1 py-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Searching locations across India...</span>
            </div>
          )}
        </div>

        {/* Search Results Dropdown / Panel */}
        {searchQuery.trim().length >= 2 && (
          <div className="space-y-1.5 max-h-56 overflow-y-auto rounded-xl border border-white/10 bg-cine-800/95 p-2 divide-y divide-white/5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
              Search Results ({searchResults.length})
            </div>
            {searchResults.length > 0 ? (
              searchResults.map((item, idx) => (
                <button
                  key={`${item.name}-${idx}`}
                  onClick={() => selectLocationManually(item)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-violet-600/20 text-left transition text-xs group"
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-teal-400 shrink-0 group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="font-semibold text-white">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.area ? `${item.area}, ` : ''}{item.city || item.district}, {item.state || 'India'}
                        {item.pinCode ? ` • PIN: ${item.pinCode}` : ''}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    Select &rarr;
                  </span>
                </button>
              ))
            ) : !isSearching ? (
              <div className="p-3 text-center text-xs text-slate-400">
                No matching locations found for "{searchQuery}". Try a state (e.g. Maharashtra), district, or PIN code.
              </div>
            ) : null}
          </div>
        )}

        {/* Step 1: State / Union Territory Selection */}
        <div className="space-y-2 pt-1 border-t border-white/10">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-violet-400" />
              1. Choose State / Union Territory
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400">All 36 States/UTs:</span>
              <select
                value={activeStateTab}
                onChange={(e) => {
                  const stateVal = e.target.value;
                  setActiveStateTab(stateVal);
                  selectStateManually(stateVal);
                }}
                className="bg-cine-900 border border-white/15 text-white text-[11px] rounded-lg px-2 py-0.5 focus:outline-none focus:border-violet-500"
              >
                {ALL_INDIA_STATES_LIST.map((st) => (
                  <option key={st.code} value={st.name}>
                    {st.name} ({st.type === 'Union Territory' ? 'UT' : 'State'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick State Chips */}
          <div className="flex flex-wrap gap-1.5 pb-1">
            {topCinemaStates.map((stName) => {
              const isSelected = activeStateTab.toLowerCase() === stName.toLowerCase();
              return (
                <button
                  key={stName}
                  onClick={() => {
                    setActiveStateTab(stName);
                    selectStateManually(stName);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-violet-600 text-white font-bold shadow-glow-violet'
                      : 'bg-cine-800/80 border border-white/5 hover:border-white/20 text-slate-300 hover:text-white'
                  }`}
                >
                  {stName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: District Selection for the Active State */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>2. Districts in {activeStateObj?.name} ({activeStateObj?.districts?.length || 0})</span>
            <span className="text-[10px] text-teal-400">Click to view towns</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-44 overflow-y-auto p-1 border border-white/5 rounded-xl bg-cine-800/40">
            {(activeStateObj?.districts || []).map((dist) => {
              const isSelected = selectedDistrict.toLowerCase() === dist.name.toLowerCase();
              const isFiltered = selectedDistrictFilter.toLowerCase() === dist.name.toLowerCase();

              return (
                <button
                  key={dist.id}
                  onClick={() => {
                    setSelectedDistrictFilter(dist.name);
                    selectDistrictManually(dist.name, activeStateObj.name);
                  }}
                  className={`flex items-center justify-between p-2 rounded-xl border text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-violet-600/30 border-violet-500 text-white font-bold shadow-glow-violet'
                      : isFiltered
                      ? 'bg-teal-500/20 border-teal-500 text-white'
                      : 'bg-cine-800/60 border-white/5 hover:border-white/20 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Building className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-violet-400' : 'text-slate-400'}`} />
                    <span className="truncate">{dist.name}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-violet-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Cities, Towns & Localities for the Active District */}
        {activeDistrictObj && activeDistrictObj.cities?.length > 0 && (
          <div className="pt-2 border-t border-white/10 space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>3. Cities, Towns & Areas in {activeDistrictObj.name}</span>
              <span className="text-[10px] text-teal-400">{activeDistrictObj.cities.length} areas</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1">
              {activeDistrictObj.cities.map((cityName) => {
                const isSelectedCity = selectedCity.toLowerCase() === cityName.toLowerCase();
                return (
                  <button
                    key={cityName}
                    onClick={() => selectCityManually(cityName, activeDistrictObj.name, activeStateObj.name)}
                    className={`flex items-center justify-between p-2 rounded-xl border text-xs text-left transition-all ${
                      isSelectedCity
                        ? 'bg-teal-500/20 border-teal-500 text-white font-bold'
                        : 'bg-cine-800/40 border-white/5 hover:border-white/15 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3 h-3 text-teal-400 shrink-0" />
                      <span className="truncate">{cityName}</span>
                    </div>
                    {isSelectedCity && <Check className="w-3 h-3 text-teal-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default LocationModal;
