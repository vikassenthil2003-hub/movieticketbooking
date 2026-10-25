import React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Film,
  Building2,
  QrCode,
  Calendar,
  LogOut,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

const TheatreLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Theatre Shows & Stats', to: '/theatre/dashboard', icon: Building2 },
    { label: 'Gate QR Ticket Scanner', to: '/theatre/verify-ticket', icon: QrCode },
  ];

  return (
    <div className="min-h-screen bg-navy-950 text-navy-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-navy-900 border-r border-navy-800 flex flex-col shrink-0">
        <div className="p-5 border-b border-navy-800 flex items-center justify-between">
          <Link to="/theatre/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent-secondary to-teal-400 flex items-center justify-center text-navy-950 shadow-md font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight block">CineVerse AI</span>
              <span className="text-[10px] text-accent-secondary font-semibold uppercase tracking-wider block">Theatre Portal</span>
            </div>
          </Link>
        </div>

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
                      ? 'bg-accent-secondary text-navy-950 font-bold shadow-md shadow-accent-secondary/20'
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
              <span>Customer Portal</span>
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-navy-800 bg-navy-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 font-bold text-xs shrink-0">
                T
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Theatre Staff'}</p>
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

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-navy-800 px-6 flex items-center justify-between bg-navy-900/60 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs">
            <ShieldCheck className="w-4 h-4 text-accent-secondary" />
            <span className="font-semibold text-white">Authorized Theatre Operator Session</span>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TheatreLayout;
