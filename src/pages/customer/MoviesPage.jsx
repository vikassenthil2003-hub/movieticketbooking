import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Film, Search, Frown, RefreshCw, AlertCircle, MapPin, Check } from 'lucide-react';
import api from '../../services/api';
import { useLocationContext } from '../../context/LocationContext';
import MovieCard from '../../components/movies/MovieCard';
import MovieFilters from '../../components/movies/MovieFilters';
import { MovieCardSkeleton } from '../../components/common/LoadingSkeleton';

const FALLBACK_TAMIL_MOVIES = [
  {
    _id: "6accbc48254256942bf30db5",
    title: "Leo",
    synopsis: "A mild-mannered café owner in Himachal Pradesh becomes the target of a ruthless cartel syndicate who suspect him of being a legendary former gangster.",
    posterUrl: "/images/movies/leo-poster.jpg",
    genre: ["Action", "Thriller", "Crime"],
    language: ["Tamil", "Telugu", "Hindi"],
    duration: 164,
    certification: "UA",
    status: "now_showing",
    formats: ["2D", "3D", "IMAX 2D"],
    rating: 8.8,
  },
  {
    _id: "6accbc48254256942bf30dbd",
    title: "Jailer",
    synopsis: "Retired jail warden Tiger Muthuvel Pandian springs back into action when an antiquities smuggling gang threatens his family.",
    posterUrl: "/images/movies/jailer-poster.jpg",
    genre: ["Action", "Comedy", "Drama"],
    language: ["Tamil", "Telugu", "Hindi"],
    duration: 168,
    certification: "UA",
    status: "now_showing",
    formats: ["2D", "Dolby Atmos"],
    rating: 8.6,
  },
  {
    _id: "6accbc48254256942bf30dbe",
    title: "Vikram",
    synopsis: "A covert black-ops investigator takes on a masked vigilante group and a vicious drug cartel kingpin seeking to retrieve a lost narcotics consignment.",
    posterUrl: "/images/movies/vikram-poster.jpg",
    genre: ["Action", "Thriller", "Mystery"],
    language: ["Tamil", "Telugu", "Hindi"],
    duration: 175,
    certification: "UA",
    status: "now_showing",
    formats: ["2D", "Dolby Atmos", "IMAX 2D"],
    rating: 8.9,
  },
  {
    _id: "6accbc48254256942bf30db8",
    title: "Master",
    synopsis: "An alcoholic professor is assigned to a juvenile correctional facility where he locks horns with a ruthless gangster using children as fall guys for crimes.",
    posterUrl: "/images/movies/master-poster.jpg",
    genre: ["Action", "Thriller", "Drama"],
    language: ["Tamil", "Telugu", "Hindi"],
    duration: 178,
    certification: "UA",
    status: "now_showing",
    formats: ["2D", "Dolby Atmos"],
    rating: 8.7,
  },
  {
    _id: "6accbc48254256942bf30dbf",
    title: "Maharaja",
    synopsis: "A quiet barber files an unusual police complaint when his metal dustbin Lakshmi is stolen during a burglary, unraveling a shocking web of retribution.",
    posterUrl: "/images/movies/maharaja-poster.jpg",
    genre: ["Action", "Thriller", "Drama"],
    language: ["Tamil", "Telugu", "Hindi"],
    duration: 140,
    certification: "UA",
    status: "now_showing",
    formats: ["2D", "Dolby Atmos"],
    rating: 9.0,
  },
  {
    _id: "6accbc48254256942bf30dc0",
    title: "Amaran",
    synopsis: "A biographical action drama depicting the courage and sacrifice of Major Mukund Varadarajan of the Rajputana Rifles during counter-terror operations in Kashmir.",
    posterUrl: "/images/movies/amaran-poster.jpg",
    genre: ["Action", "Biography", "Drama"],
    language: ["Tamil", "Telugu", "Hindi"],
    duration: 169,
    certification: "UA",
    status: "now_showing",
    formats: ["2D", "Dolby Atmos"],
    rating: 8.7,
  },
  {
    _id: "6accbc48254256942bf30dc2",
    title: "Ponniyin Selvan: Part I",
    synopsis: "Vandiyathevan sets out to cross the Chola kingdom with a crucial message while a conspiracy brews to overthrow Emperor Sundara Chola.",
    posterUrl: "/images/movies/ponniyin-selvan-1-poster.jpg",
    genre: ["Action", "Adventure", "Drama"],
    language: ["Tamil", "Telugu", "Hindi", "Malayalam"],
    duration: 167,
    certification: "UA",
    status: "now_showing",
    formats: ["2D", "IMAX 2D"],
    rating: 8.5,
  },
  {
    _id: "6accbc48254256942bf30dc3",
    title: "Ponniyin Selvan: Part II",
    synopsis: "Arulmozhi Varman continues his journey to reclaim the Chola crown as secrets of the past unfold and the empire faces internal rebellion.",
    posterUrl: "/images/movies/ponniyin-selvan-2-poster.jpg",
    genre: ["Action", "Adventure", "Drama"],
    language: ["Tamil", "Telugu", "Hindi", "Malayalam"],
    duration: 164,
    certification: "UA",
    status: "now_showing",
    formats: ["2D", "IMAX 2D"],
    rating: 8.4,
  },
  {
    _id: "6accbc48254256942bf30dc6",
    title: "Dragon",
    synopsis: "A young college graduate navigates ambition, career chaos, and unexpected romance while taking on life with unstoppable wit and grit.",
    posterUrl: "/images/movies/dragon-poster.jpg",
    genre: ["Action", "Comedy", "Drama"],
    language: ["Tamil", "Telugu"],
    duration: 152,
    certification: "UA",
    status: "coming_soon",
    formats: ["2D", "3D"],
    rating: 8.5,
  },
  {
    _id: "6accbc48254256942bf30dc4",
    title: "Retro",
    synopsis: "A stylized romantic gangster saga set against vintage coastal landscapes, exploring love, laughter, and high-octane warfare.",
    posterUrl: "/images/movies/retro-poster.jpg",
    genre: ["Action", "Drama", "Romance"],
    language: ["Tamil", "Telugu", "Hindi"],
    duration: 155,
    certification: "UA",
    status: "coming_soon",
    formats: ["2D", "Dolby Atmos"],
    rating: 8.6,
  },
  {
    _id: "6accbc48254256942bf30dc7",
    title: "Good Bad Ugly",
    synopsis: "An explosive action entertainer set across international criminal syndicates where three morally conflicted operatives collide in an epic heist duel.",
    posterUrl: "/images/movies/good-bad-ugly-poster.jpg",
    genre: ["Action", "Comedy", "Thriller"],
    language: ["Tamil", "Telugu", "Hindi"],
    duration: 158,
    certification: "UA",
    status: "coming_soon",
    formats: ["2D", "IMAX 2D"],
    rating: 8.8,
  },
  {
    _id: "6accbc48254256942bf30dc8",
    title: "Viduthalai: Part 1",
    synopsis: "A rookie police constable stationed at a remote outpost is caught in a moral conflict between institutional brutality and a separatist rebel leader.",
    posterUrl: "/images/movies/viduthalai-poster.jpg",
    genre: ["Crime", "Drama", "Thriller"],
    language: ["Tamil"],
    duration: 150,
    certification: "A",
    status: "now_showing",
    formats: ["2D"],
    rating: 8.7,
  }
];

const MoviesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedCity, selectedDistrict } = useLocationContext();

  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState(['Action', 'Thriller', 'Sci-Fi', 'Drama', 'Comedy', 'Adventure', 'Crime', 'Biography']);
  const [languages, setLanguages] = useState(['Tamil', 'Telugu', 'Hindi', 'English', 'Malayalam']);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [filterByCityOnly, setFilterByCityOnly] = useState(false);

  // Filter States
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genre') || 'All');
  const [selectedLanguage, setSelectedLanguage] = useState(searchParams.get('language') || 'All');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'now_showing');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'popularity');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  // Load Metadata (Genres & Languages)
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await api.get('/movies/filters/metadata');
        const apiGenres = res.data?.genres || res.genres || [];
        const apiLanguages = res.data?.languages || res.languages || [];
        if (apiGenres.length > 0) setGenres(apiGenres);
        if (apiLanguages.length > 0) {
          const uniqueLangs = Array.from(new Set(['Tamil', ...apiLanguages]));
          setLanguages(uniqueLangs);
        }
      } catch (err) {
        console.error('[Metadata Error]:', err);
      }
    };
    fetchMetadata();
  }, []);

  // Sync state if URL query params change (e.g. from navbar navigation)
  useEffect(() => {
    const q = searchParams.get('search');
    const g = searchParams.get('genre');
    const l = searchParams.get('language');
    const s = searchParams.get('status');
    const sort = searchParams.get('sort');

    if (q !== null && q !== searchQuery) setSearchQuery(q);
    if (g !== null && g !== selectedGenre) setSelectedGenre(g);
    if (l !== null && l !== selectedLanguage) setSelectedLanguage(l);
    if (s !== null && s !== selectedStatus) setSelectedStatus(s);
    if (sort !== null && sort !== sortBy) setSortBy(sort);
  }, [searchParams]);

  // Fetch Movies on filter change with explicit retry support
  const fetchMovies = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams();
      if (selectedGenre !== 'All') params.append('genre', selectedGenre);
      if (selectedLanguage !== 'All') params.append('language', selectedLanguage);
      if (selectedStatus && selectedStatus !== 'All') params.append('status', selectedStatus);
      if (sortBy) params.append('sort', sortBy);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (selectedCity && selectedCity !== 'All') params.append('city', selectedCity);
      params.append('limit', '50');

      const res = await api.get(`/movies?${params.toString()}`);
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : [];

      setMovies(list);
    } catch (err) {
      console.error('[Movies Fetch Error]:', err);
      const errMsg = err?.message || 'Could not load movies from the server.';
      setFetchError(errMsg);

      // Safe fallback from verified catalogue
      let filtered = [...FALLBACK_TAMIL_MOVIES];
      if (selectedStatus && selectedStatus !== 'All') filtered = filtered.filter((m) => m.status === selectedStatus);
      if (selectedLanguage !== 'All') {
        filtered = filtered.filter((m) => (m.language || []).includes(selectedLanguage));
      }
      if (selectedGenre !== 'All') {
        filtered = filtered.filter((m) => (m.genre || []).includes(selectedGenre));
      }
      if (searchQuery.trim()) {
        filtered = filtered.filter((m) =>
          m.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
        );
      }
      setMovies(filtered);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [selectedGenre, selectedLanguage, selectedStatus, sortBy, searchQuery, selectedCity]);

  // Optionally filter by local shows, but NEVER blank the page if none match
  const displayedMovies = filterByCityOnly
    ? movies.filter((m) => m.hasShowsInCity)
    : movies;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-display text-white">Explore Movies</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse now showing films, upcoming releases, and book verified seats across Tamil Nadu
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movie title..."
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* Filter Component */}
      <MovieFilters
        genres={genres}
        languages={languages}
        selectedGenre={selectedGenre}
        onSelectGenre={setSelectedGenre}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={setSelectedLanguage}
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
        sortBy={sortBy}
        onSelectSort={setSortBy}
      />

      {/* Error state with retry button */}
      {fetchError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-rose-300">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <span className="font-bold">Notice:</span> {fetchError} Displaying local verified offline catalogue.
            </div>
          </div>
          <button
            onClick={fetchMovies}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Connection
          </button>
        </div>
      )}

      {/* City Location Info Bar */}
      {selectedCity && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-cine-850/80 border border-white/5 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-teal-400" />
            <span>
              Browsing theatre availability for <span className="text-white font-bold">{selectedCity}</span>
              {selectedDistrict && selectedDistrict !== selectedCity ? ` (${selectedDistrict} District)` : ''}
            </span>
          </div>

          <button
            onClick={() => setFilterByCityOnly(!filterByCityOnly)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
              filterByCityOnly
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {filterByCityOnly ? `Filtered by ${selectedCity} Showtimes` : `Show All Tamil Nadu Movies`}
          </button>
        </div>
      )}

      {/* Movies Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      ) : displayedMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayedMovies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl glass-panel border border-white/10 space-y-3">
          <Frown className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Movies Matched Your Filters</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {filterByCityOnly
              ? `No movies currently have scheduled showtimes in ${selectedCity}. Try viewing all Tamil Nadu movies or select another date.`
              : 'Try resetting your genre or language filters, or search for a different title.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {filterByCityOnly && (
              <button
                onClick={() => setFilterByCityOnly(false)}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition"
              >
                View All Tamil Nadu Releases
              </button>
            )}
            <button
              onClick={() => {
                setSelectedGenre('All');
                setSelectedLanguage('All');
                setSearchQuery('');
                setFilterByCityOnly(false);
              }}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-glow-violet transition-all"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoviesPage;
