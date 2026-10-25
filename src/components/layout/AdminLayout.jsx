import React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Film,
  LayoutDashboard,
  Clapperboard,
  Building2,
  CalendarDays,
  Ticket,
  Users,
  Tag,
  LogOut,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Play,
  Utensils,
} from 'lucide-react';
import AccessDeniedBanner from '../common/AccessDeniedBanner';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Movies Catalogue', to: '/admin/movies', icon: Clapperboard },
    { label: 'Trailer Manager', to: '/admin/trailers', icon: Play },
    { label: 'Theatres & Screens', to: '/admin/theatres', icon: Building2 },
    { label: 'Showtimes', to: '/admin/shows', icon: CalendarDays },
    { label: 'Snacks & Concessions', to: '/admin/snacks', icon: Utensils },
    { label: 'Coupons & Offers', to: '/admin/coupons', icon: Tag },
    { label: 'User Management', to: '/admin/users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-navy-950 text-navy-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-navy-900 border-r border-navy-800 flex flex-col shrink-0">
        {/* Brand */}
        <div className="p-5 border-b border-navy-800 flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent-primary to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight block">CineVerse AI</span>
              <span className="text-[10px] text-accent-secondary font-semibold uppercase tracking-wider block">Admin Console</span>
            </div>
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="p-4 space-y-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-accent-primary text-white shadow-md shadow-accent-primary/20'
                      : 'text-navy-300 hover:bg-navy-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <div className="pt-4 border-t border-navy-800 mt-4">
            <Link
              to="/"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-navy-400 hover:bg-navy-800 hover:text-white transition"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Customer Front-End</span>
            </Link>
          </div>
        </nav>

        {/* Admin User Footer */}
        <div className="p-4 border-t border-navy-800 bg-navy-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-xs shrink-0">
                A
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-navy-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-navy-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Banner */}
        <header className="h-16 border-b border-navy-800 px-6 flex items-center justify-between bg-navy-900/60 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-white">Privileged Session</span>
            <span className="text-navy-500">|</span>
            <span className="text-navy-400">Database Role: <strong className="text-accent-secondary">admin</strong></span>
          </div>

          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-[11px] text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Simulated Demo Environment</span>
          </div>
        </header>

        <AccessDeniedBanner />

        {/* Page Outlet */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
