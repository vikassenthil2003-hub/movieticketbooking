import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Search,
  Sparkles,
  User as UserIcon,
  LogOut,
  Ticket,
  Bookmark,
  Award,
  Users,
  ShieldAlert,
  ChevronDown,
  Menu,
  X,
  Building2,
  Play,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocationContext } from '../../context/LocationContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isTheatre, logout } = useAuth();
  const { selectedCity, selectedDistrict, detectedArea, openLocationModal } = useLocationContext();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-teal-400 p-0.5 shadow-glow-violet group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-cine-900 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-violet-400" />
              </div>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black font-display tracking-tight text-white group-hover:text-violet-400 transition-colors">
                Cine<span className="text-violet-400">Verse</span>
              </span>
              <span className="ml-1.5 text-[10px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                AI
              </span>
            </div>
          </Link>

          {/* District / City Location Trigger */}
          <button
            onClick={openLocationModal}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-cine-800/80 hover:bg-cine-700/80 border border-white/10 text-slate-300 hover:text-white transition-all text-xs font-semibold"
            title="Change Cinema District / Location"
          >
            <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span className="truncate max-w-[170px]">
              {detectedArea ? `${detectedArea}, ` : ''}{selectedCity}
              {selectedDistrict && selectedDistrict.toLowerCase() !== selectedCity.toLowerCase() ? ` (${selectedDistrict})` : ''}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>
        </div>

        {/* Search Bar (Desktop) */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative mx-4">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movies, genres, languages..."
            className="w-full pl-10 pr-4 py-2 rounded-full glass-input text-xs sm:text-sm placeholder:text-slate-500"
          />
        </form>

        {/* Right Navigation Controls */}
        <div className="flex items-center gap-3">

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-300">
            <Link to="/movies" className="hover:text-violet-400 transition-colors">
              Movies
            </Link>
            <Link to="/watch" className="hover:text-violet-400 transition-colors flex items-center gap-1">
              <Play className="w-3 h-3 fill-violet-400 text-violet-400" />
              <span>Trailers</span>
            </Link>
            <Link to="/theatres" className="hover:text-violet-400 transition-colors">
              Theatres
            </Link>
            {!isAdmin && (
              <Link to="/group-booking" className="hover:text-violet-400 transition-colors">
                Group Booking
              </Link>
            )}
            {!isAdmin && (
              <Link to="/rewards" className="hover:text-violet-400 transition-colors">
                Rewards
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-600/30 border border-violet-500/40 text-violet-300 hover:text-white hover:bg-violet-600/50 transition-colors font-bold shadow-glow-violet"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-violet-400" />
                <span>Admin Console</span>
              </Link>
            )}
          </nav>

          {/* User Auth Controls */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-cine-800 border border-white/10 hover:border-violet-500/50 transition-all text-xs font-semibold"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-600 to-teal-400 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-slate-200 truncate max-w-[100px]">{user.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:inline" />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel shadow-2xl border border-white/15 py-2 z-50 text-xs font-medium divide-y divide-white/10 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-4 py-3">
                    <div className="font-bold text-white truncate">{user.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-violet-500/20 text-violet-300">
                        {user.role}
                      </span>
                      {!isAdmin && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                          {user.membershipTier || 'Silver'} • {user.rewardPoints || 0} pts
                        </span>
                      )}
                      {isAdmin && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">
                          Administrator
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Customer Links - Hidden for Admins */}
                  {!isAdmin && (
                    <div className="py-1">
                      <Link
                        to="/my-bookings"
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <Ticket className="w-4 h-4 text-teal-400" />
                        <span>My Bookings</span>
                      </Link>
                      <Link
                        to="/watchlist"
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <Bookmark className="w-4 h-4 text-violet-400" />
                        <span>Watchlist</span>
                      </Link>
                      <Link
                        to="/rewards"
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <Award className="w-4 h-4 text-amber-400" />
                        <span>Rewards & Offers</span>
                      </Link>
                    </div>
                  )}

                  {/* Profile Settings (All users) */}
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>Profile Settings</span>
                    </Link>
                  </div>

                  {/* Privileged Dashboard Links */}
                  {(isAdmin || isTheatre) && (
                    <div className="py-1 bg-violet-950/20">
                      {isAdmin && (
                        <>
                          <Link
                            to="/admin/dashboard"
                            className="flex items-center gap-2.5 px-4 py-2 text-violet-300 hover:text-white hover:bg-violet-600/30 transition-colors font-bold"
                          >
                            <ShieldAlert className="w-4 h-4 text-violet-400" />
                            <span>Admin Dashboard</span>
                          </Link>
                          <Link
                            to="/admin/movies"
                            className="flex items-center gap-2.5 px-4 py-1.5 text-slate-300 hover:text-white hover:bg-violet-600/20 transition-colors text-[11px]"
                          >
                            <span>Manage Movies</span>
                          </Link>
                          <Link
                            to="/admin/theatres"
                            className="flex items-center gap-2.5 px-4 py-1.5 text-slate-300 hover:text-white hover:bg-violet-600/20 transition-colors text-[11px]"
                          >
                            <span>Manage Theatres</span>
                          </Link>
                          <Link
                            to="/admin/shows"
                            className="flex items-center gap-2.5 px-4 py-1.5 text-slate-300 hover:text-white hover:bg-violet-600/20 transition-colors text-[11px]"
                          >
                            <span>Manage Showtimes</span>
                          </Link>
                          <Link
                            to="/admin/trailers"
                            className="flex items-center gap-2.5 px-4 py-1.5 text-slate-300 hover:text-white hover:bg-violet-600/20 transition-colors text-[11px]"
                          >
                            <span>Manage Trailers</span>
                          </Link>
                        </>
                      )}
                      {isTheatre && (
                        <Link
                          to="/theatre/dashboard"
                          className="flex items-center gap-2.5 px-4 py-2 text-teal-300 hover:text-white hover:bg-teal-600/30 transition-colors font-bold"
                        >
                          <Building2 className="w-4 h-4 text-teal-400" />
                          <span>Theatre Dashboard</span>
                        </Link>
                      )}
                    </div>
                  )}

                  <div className="py-1">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold tracking-wide shadow-glow-violet transition-all"
            >
              Sign In
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 lg:hidden"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-cine-900/95 px-5 py-4 space-y-4 animate-in slide-in-from-top-2">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies..."
              className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs"
            />
          </form>

          {/* Mobile City Selector */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              openLocationModal();
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-cine-800 border border-white/10 text-xs font-semibold text-slate-200"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-400" />
              <span>Location: {detectedArea ? `${detectedArea}, ` : ''}{selectedCity}{selectedDistrict && selectedDistrict.toLowerCase() !== selectedCity.toLowerCase() ? ` (${selectedDistrict})` : ''}</span>
            </div>
            <span className="text-[10px] text-violet-400 font-bold uppercase">Change</span>
          </button>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <Link
              to="/movies"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-3 rounded-xl bg-cine-800 border border-white/5 hover:border-violet-500 text-slate-200"
            >
              Movies
            </Link>
            <Link
              to="/watch"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-3 rounded-xl bg-cine-800 border border-white/5 hover:border-violet-500 text-slate-200 flex items-center justify-between"
            >
              <span>Trailers</span>
              <Play className="w-3.5 h-3.5 fill-violet-400 text-violet-400" />
            </Link>
            <Link
              to="/theatres"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-3 rounded-xl bg-cine-800 border border-white/5 hover:border-violet-500 text-slate-200"
            >
              Theatres
            </Link>
            {!isAdmin ? (
              <>
                <Link
                  to="/group-booking"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-3 rounded-xl bg-cine-800 border border-white/5 hover:border-violet-500 text-slate-200"
                >
                  Group Booking
                </Link>
                <Link
                  to="/rewards"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-3 rounded-xl bg-cine-800 border border-white/5 hover:border-violet-500 text-slate-200"
                >
                  Rewards
                </Link>
              </>
            ) : (
              <Link
                to="/admin/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="col-span-2 p-3 rounded-xl bg-violet-600/30 border border-violet-500/40 text-violet-300 font-bold flex items-center justify-center gap-2"
              >
                <ShieldAlert className="w-4 h-4 text-violet-400" />
                <span>Admin Console</span>
              </Link>
            )}
          </div>

          {/* Mobile Auth Actions */}
          <div className="pt-2 border-t border-white/10">
            {!isAuthenticated ? (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-glow-violet transition-all"
              >
                <UserIcon className="w-4 h-4" />
                <span>Sign In / Login</span>
              </Link>
            ) : (
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 text-xs font-bold transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out ({user?.name || user?.email || 'Account'})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
