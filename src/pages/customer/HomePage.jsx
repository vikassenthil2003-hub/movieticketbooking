import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Flame,
  Film,
  Calendar,
  Building2,
  Ticket,
  Tag,
  ArrowRight,
  ShieldCheck,
  Star,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Clock,
  Compass
} from 'lucide-react';
import api from '../../services/api';
import { useLocationContext } from '../../context/LocationContext';
import HeroBanner from '../../components/movies/HeroBanner';
import MovieCard from '../../components/movies/MovieCard';
import TheatreCard from '../../components/theatres/TheatreCard';
import { MovieCardSkeleton } from '../../components/common/LoadingSkeleton';

// Verified Demo Fallback Data in case MongoDB or API is unreachable
const FALLBACK_DEMO_MOVIES = [
  {
    _id: "6accbc48254256942bf30db5",
    title: "Leo",
    synopsis: "A mild-mannered café owner in Himachal Pradesh becomes the target of a ruthless cartel syndicate who suspect him of being a legendary former gangster.",
    posterUrl: "/images/movies/leo-poster.jpg",
    bannerUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80",
    trailerUrl: "https://www.youtube.com/watch?v=Po3jStA673E",
    genre: ["Action", "Thriller", "Crime"],
    language: ["Tamil", "Telugu", "Hindi"],
    duration: 164,
    certification: "UA",
    releaseDate: "2023-10-19",
    status: "now_showing",
    formats: ["2D", "3D", "IMAX 2D"],
    rating: 8.8,
    isTrending: true,
  },
  {
    _id: "6accbc48254256942bf30dbd",
    title: "Jailer",
    synopsis: "Retired jail warden Tiger Muthuvel Pandian springs back into action when an antiquities smuggling gang threatens his family.",
    posterUrl: "/images/movies/jailer-poster.jpg",
    bannerUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80",
    trailerUrl: "https://www.youtube.com/watch?v=xenOE1Tma0A",
    genre: ["Action", "Comedy", "Drama"],
    language: ["Tamil", "Telugu", "Hindi"],
    duration: 168,
    certification: "UA",
    releaseDate: "2023-08-10",
    status: "now_showing",
    formats: ["2D", "Dolby Atmos"],
    rating: 8.6,
    isTrending: true,
  },
  {
    _id: "6accbc48254256942bf30dbe",
    title: "Vikram",
    synopsis: "A covert black-ops investigator takes on a masked vigilante group and a vicious drug cartel kingpin seeking to retrieve a lost narcotics consignment.",
    posterUrl: "/images/movies/vikram-poster.jpg",
    bannerUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80",
    trailerUrl: "https://www.youtube.com/watch?v=OKBMCL-frPU",
    genre: ["Action", "Thriller", "Mystery"],
    language: ["Tamil", "Telugu", "Hindi"],
    duration: 175,
    certification: "UA",
    releaseDate: "2022-06-03",
    status: "now_showing",
    formats: ["2D", "Dolby Atmos", "IMAX 2D"],
    rating: 8.9,
    isTrending: true,
  },
  {
    _id: "6accbc48254256942bf30db8",
    title: "Master",
    synopsis: "An alcoholic professor is assigned to a juvenile correctional facility where he locks horns with a ruthless gangster using children as fall guys for crimes.",
    posterUrl: "/images/movies/master-poster.jpg",
    bannerUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1600&q=80",
    trailerUrl: "https://www.youtube.com/watch?v=UTiXQcrLlv4",
    genre: ["Action", "Thriller", "Drama"],
    language: ["Tamil", "Telugu", "Hindi"],
    duration: 178,
    certification: "UA",
    releaseDate: "2021-01-13",
    status: "now_showing",
    formats: ["2D", "Dolby Atmos"],
    rating: 8.7,
    isTrending: true,
  },
  {
    _id: "6accbc48254256942bf30dbf",
    title: "Maharaja",
    synopsis: "A quiet barber files an unusual police complaint when his metal dustbin Lakshmi is stolen during a burglary, unraveling a shocking web of retribution.",
    posterUrl: "/images/movies/maharaja-poster.jpg",
    bannerUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1600&q=80",
    trailerUrl: "https://www.youtube.com/watch?v=8367mw_e6fE",
    genre: ["Action", "Thriller", "Drama"],
    language: ["Tamil", "Telugu", "Hindi"],
    duration: 140,
    certification: "UA",
    releaseDate: "2024-06-14",
    status: "now_showing",
    formats: ["2D", "Dolby Atmos"],
    rating: 9.0,
    isTrending: true,
  },
  {
    _id: "6accbc48254256942bf30dc0",
    title: "Amaran",
    synopsis: "A biographical action drama depicting the courage and sacrifice of Major Mukund Varadarajan of the Rajputana Rifles during counter-terror operations in Kashmir.",
    posterUrl: "/images/movies/amaran-poster.jpg",
    bannerUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1600&q=80",
    trailerUrl: "https://www.youtube.com/watch?v=hylixqkflDE",
    genre: ["Action", "Biography", "Drama"],
    language: ["Tamil", "Telugu", "Hindi"],
    duration: 169,
    certification: "UA",
    releaseDate: "2024-10-31",
    status: "now_showing",
    formats: ["2D", "Dolby Atmos"],
    rating: 8.7,
    isTrending: true,
  },
  {
    _id: "6accbc48254256942bf30dc2",
    title: "Ponniyin Selvan: Part I",
    synopsis: "Vandiyathevan sets out to cross the Chola kingdom with a crucial message while a conspiracy brews to overthrow Emperor Sundara Chola.",
    posterUrl: "/images/movies/ponniyin-selvan-1-poster.jpg",
    bannerUrl: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1600&q=80",
    trailerUrl: "https://www.youtube.com/watch?v=D4qAQYLGZVM",
    genre: ["Action", "Adventure", "Drama"],
    language: ["Tamil", "Telugu", "Hindi", "Malayalam"],
    duration: 167,
    certification: "UA",
    releaseDate: "2022-09-30",
    status: "now_showing",
    formats: ["2D", "IMAX 2D"],
    rating: 8.5,
    isTrending: false,
  },
  {
    _id: "6accbc48254256942bf30dc3",
    title: "Ponniyin Selvan: Part II",
    synopsis: "Arulmozhi Varman continues his journey to reclaim the Chola crown as secrets of the past unfold and the empire faces internal rebellion.",
    posterUrl: "/images/movies/ponniyin-selvan-2-poster.jpg",
    bannerUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80",
    trailerUrl: "https://www.youtube.com/watch?v=EYhkP_m3YcE",
    genre: ["Action", "Adventure", "Drama"],
    language: ["Tamil", "Telugu", "Hindi", "Malayalam"],
    duration: 164,
    certification: "UA",
    releaseDate: "2023-04-28",
    status: "now_showing",
    formats: ["2D", "IMAX 2D"],
    rating: 8.4,
    isTrending: false,
  },
  {
    _id: "6accbc48254256942bf30dc6",
    title: "Dragon",
    synopsis: "A young college graduate navigates ambition, career chaos, and unexpected romance while taking on life with unstoppable wit and grit.",
    posterUrl: "/images/movies/dragon-poster.jpg",
    bannerUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1600&q=80",
    trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w",
    genre: ["Action", "Comedy", "Drama"],
    language: ["Tamil", "Telugu"],
    duration: 152,
    certification: "UA",
    releaseDate: "2025-02-21",
    status: "coming_soon",
    formats: ["2D", "3D"],
    rating: 8.5,
    isTrending: false,
  },
  {
    _id: "6accbc48254256942bf30dc4",
    title: "Retro",
    synopsis: "A stylized romantic gangster saga set against vintage coastal landscapes, exploring love, laughter, and high-octane warfare.",
    posterUrl: "/images/movies/retro-poster.jpg",
    bannerUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80",
    trailerUrl: "https://www.youtube.com/watch?v=OKBMCL-frPU",
    genre: ["Action", "Drama", "Romance"],
    language: ["Tamil", "Telugu", "Hindi"],
    duration: 155,
    certification: "UA",
    releaseDate: "2025-05-01",
    status: "coming_soon",
    formats: ["2D", "Dolby Atmos"],
    rating: 8.6,
    isTrending: true,
  },
  {
    _id: "6accbc48254256942bf30dc7",
    title: "Good Bad Ugly",
    synopsis: "An explosive action entertainer set across international criminal syndicates where three morally conflicted operatives collide in an epic heist duel.",
    posterUrl: "/images/movies/good-bad-ugly-poster.jpg",
    bannerUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80",
    trailerUrl: "https://www.youtube.com/watch?v=kQDd1AhGIHk",
    genre: ["Action", "Comedy", "Thriller"],
    language: ["Tamil", "Telugu", "Hindi"],
    duration: 158,
    certification: "UA",
    releaseDate: "2025-04-10",
    status: "coming_soon",
    formats: ["2D", "IMAX 2D"],
    rating: 8.8,
    isTrending: true,
  },
  {
    _id: "6accbc48254256942bf30dc8",
    title: "Viduthalai: Part 1",
    synopsis: "A rookie police constable stationed at a remote outpost is caught in a moral conflict between institutional brutality and a separatist rebel leader.",
    posterUrl: "/images/movies/viduthalai-poster.jpg",
    bannerUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80",
    trailerUrl: "https://www.youtube.com/watch?v=5XJ7eUuCgls",
    genre: ["Crime", "Drama", "Thriller"],
    language: ["Tamil"],
    duration: 150,
    certification: "A",
    releaseDate: "2023-03-31",
    status: "now_showing",
    formats: ["2D"],
    rating: 8.7,
    isTrending: false,
  }
];

const FALLBACK_DEMO_THEATRES = [
  {
    _id: "6accbc48254256942bf30dc9",
    name: "CineVerse Grand IMAX (Demo)",
    brand: "CineVerse IMAX",
    address: "Express Avenue Mall, Whites Road, Royapettah",
    city: "Chennai",
    state: "Tamil Nadu",
    pinCode: "600014",
    location: { type: "Point", coordinates: [80.2612, 13.0583] },
    amenities: ["IMAX Laser", "Dolby Atmos 7.1", "Recliner Seats", "Parking", "Food & Beverage"],
    rating: 4.8,
    distanceKm: 2.4,
    isDemoData: true,
  },
  {
    _id: "6accbc48254256942bf30dca",
    name: "CineVerse Luxe Nexus (Demo)",
    brand: "CineVerse Luxe",
    address: "Nexus Vijaya Mall, Arcot Road, Vadapalani",
    city: "Chennai",
    state: "Tamil Nadu",
    pinCode: "600026",
    location: { type: "Point", coordinates: [80.2091, 13.0500] },
    amenities: ["Dolby Atmos", "RGB 4K Laser", "Recliner Seats", "Cafeteria", "Valet Parking"],
    rating: 4.7,
    distanceKm: 4.8,
    isDemoData: true,
  },
  {
    _id: "6accbc48254256942bf30dcb",
    name: "CineVerse PVR Forum (Demo)",
    brand: "CineVerse Cinemas",
    address: "Forum South Bangalore, Konanakunte Cross",
    city: "Bengaluru",
    state: "Karnataka",
    pinCode: "560062",
    location: { type: "Point", coordinates: [77.5707, 12.8893] },
    amenities: ["IMAX", "Dolby Atmos", "Recliners", "Cafeteria", "Parking"],
    rating: 4.9,
    distanceKm: 6.2,
    isDemoData: true,
  }
];

const FALLBACK_DEMO_COUPONS = [
  {
    _id: "c1",
    code: "CINEVERSE50",
    description: "Get 50% discount up to ₹150 on your ticket subtotal",
    minOrderValue: 200,
  },
  {
    _id: "c2",
    code: "WEEKEND100",
    description: "Flat ₹100 OFF on orders above ₹400 for weekend movies",
    minOrderValue: 400,
  },
  {
    _id: "c3",
    code: "FIRSTSHOW",
    description: "20% OFF for first-time CineVerse movie lovers",
    minOrderValue: 150,
  }
];

const HomePage = () => {
  const { selectedCity, detectedArea, userCoords, openLocationModal } = useLocationContext();

  const [trendingMovies, setTrendingMovies] = useState([]);
  const [nowShowingMovies, setNowShowingMovies] = useState([]);
  const [comingSoonMovies, setComingSoonMovies] = useState([]);
  const [nearbyTheatres, setNearbyTheatres] = useState([]);
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingDemoFallback, setIsUsingDemoFallback] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Search & Filter State on Homepage
  const [homeSearch, setHomeSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');

  const genresList = ['All', 'Action', 'Sci-Fi', 'Thriller', 'Drama', 'Comedy', 'Adventure'];
  const languagesList = ['All', 'Tamil', 'Telugu', 'Hindi', 'English'];

  const fetchHomeData = async () => {
    setIsLoading(true);
    setApiError(null);
    setIsUsingDemoFallback(false);

    try {
      const [trendingRes, nowShowingRes, comingSoonRes, couponsRes] = await Promise.all([
        api.get('/movies?isTrending=true&limit=6').catch(() => null),
        api.get('/movies?status=now_showing&limit=8').catch(() => null),
        api.get('/movies?status=coming_soon&limit=6').catch(() => null),
        api.get('/coupons/active').catch(() => null),
      ]);

      const parseArray = (res) => {
        if (!res) return null;
        if (Array.isArray(res)) return res;
        if (Array.isArray(res.data?.data)) return res.data.data;
        if (Array.isArray(res.data)) return res.data;
        return null;
      };

      const trending = parseArray(trendingRes);
      const nowShowing = parseArray(nowShowingRes);
      const comingSoon = parseArray(comingSoonRes);
      const coupons = parseArray(couponsRes);

      if (trending && trending.length > 0) {
        setTrendingMovies(trending);
      } else {
        const fallbackTrending = FALLBACK_DEMO_MOVIES.filter((m) => m.isTrending);
        setTrendingMovies(fallbackTrending.length > 0 ? fallbackTrending : FALLBACK_DEMO_MOVIES.slice(0, 3));
      }

      if (nowShowing && nowShowing.length > 0) {
        setNowShowingMovies(nowShowing);
      } else {
        setNowShowingMovies(FALLBACK_DEMO_MOVIES.filter((m) => m.status === 'now_showing'));
        setIsUsingDemoFallback(true);
      }

      if (comingSoon && comingSoon.length > 0) {
        setComingSoonMovies(comingSoon);
      } else {
        setComingSoonMovies(FALLBACK_DEMO_MOVIES.filter((m) => m.status === 'coming_soon'));
      }

      if (coupons && coupons.length > 0) {
        setActiveCoupons(coupons);
      } else {
        setActiveCoupons(FALLBACK_DEMO_COUPONS);
      }

      // Fetch nearby theatres with geospatial coordinates
      try {
        const theatreRes = await api.get(
          `/theatres/nearby?lat=${userCoords.lat}&lng=${userCoords.lng}&radius=25`
        );
        const list =
          theatreRes?.data?.theatres ||
          theatreRes?.data?.data?.theatres ||
          theatreRes?.theatres ||
          (Array.isArray(theatreRes?.data) ? theatreRes.data : null);

        if (Array.isArray(list) && list.length > 0) {
          setNearbyTheatres(list.slice(0, 3));
        } else {
          throw new Error('No nearby theatres returned');
        }
      } catch {
        // Fallback to city search or demo list
        try {
          const cityRes = await api.get(`/theatres?city=${selectedCity}`);
          const cityList =
            Array.isArray(cityRes?.data)
              ? cityRes.data
              : Array.isArray(cityRes?.data?.data)
              ? cityRes.data.data
              : Array.isArray(cityRes)
              ? cityRes
              : [];

          if (cityList.length > 0) {
            setNearbyTheatres(cityList.slice(0, 3));
          } else {
            setNearbyTheatres(FALLBACK_DEMO_THEATRES);
          }
        } catch {
          setNearbyTheatres(FALLBACK_DEMO_THEATRES);
        }
      }
    } catch (err) {
      console.error('[Home Data Error]:', err);
      setApiError('Notice: Live movie server connection is limited. Displaying verified demo showcase data.');
      setTrendingMovies(FALLBACK_DEMO_MOVIES.filter((m) => m.isTrending));
      setNowShowingMovies(FALLBACK_DEMO_MOVIES.filter((m) => m.status === 'now_showing'));
      setComingSoonMovies(FALLBACK_DEMO_MOVIES.filter((m) => m.status === 'coming_soon'));
      setNearbyTheatres(FALLBACK_DEMO_THEATRES);
      setActiveCoupons(FALLBACK_DEMO_COUPONS);
      setIsUsingDemoFallback(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, [selectedCity, userCoords]);

  // Filter Now Showing Movies by search query, genre, and language
  const filteredNowShowing = useMemo(() => {
    return nowShowingMovies.filter((movie) => {
      // Search query
      if (homeSearch.trim()) {
        const query = homeSearch.toLowerCase().trim();
        const matchesTitle = movie.title?.toLowerCase().includes(query);
        const matchesSynopsis = movie.synopsis?.toLowerCase().includes(query);
        const genres = movie.genre || movie.genres || [];
        const matchesGenre = genres.some((g) => g.toLowerCase().includes(query));
        if (!matchesTitle && !matchesSynopsis && !matchesGenre) return false;
      }
      // Genre filter
      if (selectedGenre !== 'All') {
        const genres = movie.genre || movie.genres || [];
        if (!genres.includes(selectedGenre)) return false;
      }
      // Language filter
      if (selectedLanguage !== 'All') {
        const langs = movie.language || movie.languages || [];
        if (!langs.includes(selectedLanguage)) return false;
      }
      return true;
    });
  }, [nowShowingMovies, homeSearch, selectedGenre, selectedLanguage]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Demo Showcase Notice if operating with fallback data */}
      {isUsingDemoFallback && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs shadow-sm">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Seeded Showcase Mode:</strong> Displaying verified demo catalogue and cinemas for {selectedCity}.
            </span>
          </div>
          <button
            onClick={fetchHomeData}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-semibold transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      )}

      {/* Cinematic Hero Showcase Banner */}
      {trendingMovies.length > 0 && <HeroBanner featuredMovies={trendingMovies} />}

      {/* Integrated Movie Search & Filter Control Bar */}
      <div className="p-5 sm:p-6 rounded-3xl glass-panel border border-white/10 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={homeSearch}
              onChange={(e) => setHomeSearch(e.target.value)}
              placeholder="Search movies by title, genre, or director..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-violet-500"
            />
            {homeSearch && (
              <button
                onClick={() => setHomeSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Location Badge */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cine-800/80 border border-white/10 text-xs text-slate-300">
            <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
            <span>Showing in <strong>{detectedArea ? `${detectedArea}, ${selectedCity}` : selectedCity}</strong></span>
            <button
              onClick={openLocationModal}
              className="ml-2 text-violet-400 hover:text-violet-300 font-bold underline"
            >
              Change
            </button>
          </div>
        </div>

        {/* Filter Category Chips */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/5">
          {/* Genre Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Genre:
            </span>
            {genresList.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                  selectedGenre === g
                    ? 'bg-violet-600 text-white shadow-glow-violet'
                    : 'bg-cine-800/80 hover:bg-cine-700/80 text-slate-300 border border-white/5'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Language Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Language:
            </span>
            {languagesList.map((l) => (
              <button
                key={l}
                onClick={() => setSelectedLanguage(l)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                  selectedLanguage === l
                    ? 'bg-teal-500 text-white shadow-glow-teal'
                    : 'bg-cine-800/80 hover:bg-cine-700/80 text-slate-300 border border-white/5'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Now Showing Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400">
              <Flame className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black font-display text-white">Now Showing</h2>
              <p className="text-xs text-slate-400">
                Playing in {selectedCity} theatres today • Showing {filteredNowShowing.length} movies
              </p>
            </div>
          </div>

          <Link
            to="/movies?status=now_showing"
            className="flex items-center gap-1.5 text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors"
          >
            <span>View Complete Catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredNowShowing.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {filteredNowShowing.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="p-10 rounded-2xl glass-panel border border-white/10 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
            <p className="text-white font-bold text-sm">No movies match your current search and filters.</p>
            <p className="text-xs text-slate-400">
              Try switching your genre or language filter, or clear your search term.
            </p>
            <button
              onClick={() => {
                setHomeSearch('');
                setSelectedGenre('All');
                setSelectedLanguage('All');
              }}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* Nearby Theatres Preview */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black font-display text-white">Nearby Cinema Complexes</h2>
              <p className="text-xs text-slate-400">
                Theatres near {detectedArea ? `${detectedArea}, ` : ''}{selectedCity} with live available showtimes
              </p>
            </div>
          </div>

          <Link
            to="/theatres"
            className="flex items-center gap-1.5 text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors"
          >
            <span>Explore on Map</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {nearbyTheatres.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {nearbyTheatres.map((theatre) => (
              <TheatreCard key={theatre._id} theatre={theatre} />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl glass-panel border border-white/10 text-center text-xs text-slate-400">
            No partner theatres found in this vicinity. Select a different city from the navbar.
          </div>
        )}
      </section>

      {/* Coming Soon Preview */}
      {comingSoonMovies.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-black font-display text-white">Coming Soon</h2>
                <p className="text-xs text-slate-400">Highly anticipated upcoming theatrical blockbusters</p>
              </div>
            </div>

            <Link
              to="/movies?status=coming_soon"
              className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <span>View All Upcoming</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {comingSoonMovies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </section>
      )}

      {/* Promotional Offers Banner */}
      {activeCoupons.length > 0 && (
        <section className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5">
            <Tag className="w-5 h-5 text-teal-400" />
            <h3 className="text-xl font-bold font-display text-white">Exclusive Promo Codes</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {activeCoupons.map((coupon) => (
              <div
                key={coupon._id}
                className="p-4 rounded-2xl bg-cine-800/80 border border-white/10 flex flex-col justify-between"
              >
                <div>
                  <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/40">
                    {coupon.code}
                  </span>
                  <p className="text-xs text-slate-300 mt-2.5 font-medium">{coupon.description}</p>
                </div>
                <div className="text-[10px] text-slate-500 mt-3 pt-2 border-t border-white/5">
                  Valid on checkouts above ₹{coupon.minOrderValue || 200}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
