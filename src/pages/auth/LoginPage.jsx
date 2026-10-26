import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Film, Shield, Building2, User, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Dynamically initialize mode: inspect URL search params, pathname, or redirected source path
  const initialMode = () => {
    try {
      const searchParams = new URLSearchParams(location.search);
      const paramMode = searchParams.get('mode') || searchParams.get('portal');
      if (paramMode && ['admin', 'theatre', 'user'].includes(paramMode.toLowerCase())) {
        return paramMode.toLowerCase();
      }
      const fromPath = location.state?.from?.pathname || '';
      if (fromPath.startsWith('/admin')) return 'admin';
      if (fromPath.startsWith('/theatre')) return 'theatre';

      const currentPath = location.pathname.toLowerCase();
      if (currentPath.includes('/admin')) return 'admin';
      if (currentPath.includes('/theatre')) return 'theatre';
    } catch {
      // Fallback to default
    }
    return 'user';
  };

  // Mode can be: 'user', 'admin', 'theatre'
  const [loginMode, setLoginMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Destination after login
  const from = location.state?.from?.pathname || '/';

  const handleModeChange = (mode) => {
    setLoginMode(mode);
    setError('');
  };

  // In development mode only, provide non-privileged demo login helpers
  const isDev =
    process.env.NODE_ENV !== 'production' ||
    (typeof import.meta !== 'undefined' && import.meta.env?.DEV);

  const demoAccounts = {
    user: {
      email:
        process.env.REACT_APP_DEMO_CUSTOMER_EMAIL ||
        process.env.VITE_DEMO_CUSTOMER_EMAIL ||
        (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DEMO_CUSTOMER_EMAIL) ||
        'customer@cineverse.com',
      password: isDev ? 'Customer@CineVerse2026' : '',
    },
    admin: {
      email:
        process.env.REACT_APP_DEMO_ADMIN_EMAIL ||
        process.env.VITE_DEMO_ADMIN_EMAIL ||
        (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DEMO_ADMIN_EMAIL) ||
        'admin@cineverse.com',
      password: isDev
        ? process.env.REACT_APP_DEMO_ADMIN_PASSWORD ||
          process.env.VITE_DEMO_ADMIN_PASSWORD ||
          (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DEMO_ADMIN_PASSWORD) ||
          'Admin@CineVerse2026'
        : '',
    },
    theatre: {
      email:
        process.env.REACT_APP_DEMO_THEATRE_EMAIL ||
        process.env.VITE_DEMO_THEATRE_EMAIL ||
        (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DEMO_THEATRE_EMAIL) ||
        'theatre@cineverse.com',
      password: isDev
        ? process.env.REACT_APP_DEMO_THEATRE_PASSWORD ||
          process.env.VITE_DEMO_THEATRE_PASSWORD ||
          (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DEMO_THEATRE_PASSWORD) ||
          'Theatre@CineVerse2026'
        : '',
    },
  };

  const handleDemoFill = (mode) => {
    setLoginMode(mode);
    const creds = demoAccounts[mode];
    if (creds) {
      setEmail(creds.email);
      setPassword(creds.password || '');
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(email, password, loginMode);
      // Redirect based on actual verified role returned from server
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'theatre') {
        navigate('/theatre/dashboard', { replace: true });
      } else {
        navigate(from === '/login' ? '/' : from, { replace: true });
      }
    } catch (err) {
      const serverMessage =
        err.message ||
        err.data?.message ||
        err.response?.data?.message ||
        'Authentication failed. Please verify your credentials and try again.';
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 flex items-center justify-center relative overflow-hidden bg-navy-950">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-20 pointer-events-auto">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-accent-primary via-indigo-500 to-accent-secondary flex items-center justify-center shadow-lg shadow-accent-primary/20 group-hover:scale-105 transition">
              <Film className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              Cine<span className="text-accent-secondary">Verse</span> AI
            </span>
          </Link>
          <h1 className="text-xl font-bold text-white tracking-wide">Sign In to Your Account</h1>
          <p className="text-xs text-navy-400 mt-1">Unified access portal with server-verified permissions</p>
        </div>

        {/* Unified Card Container */}
        <div className="bg-navy-900/80 border border-navy-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          {/* Segmented Mode Selector - Mandated Single Login Page */}
          <div className="mb-6">
            <p className="text-xs font-medium text-navy-300 mb-2 text-center">Select Login Portal</p>
            <div className="grid grid-cols-3 p-1 rounded-xl bg-navy-950 border border-navy-800">
              <button
                type="button"
                onClick={() => handleModeChange('user')}
                className={`py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                  loginMode === 'user'
                    ? 'bg-accent-primary text-white shadow-md'
                    : 'text-navy-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Customer</span>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('admin')}
                className={`py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                  loginMode === 'admin'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-navy-400 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('theatre')}
                className={`py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                  loginMode === 'theatre'
                    ? 'bg-accent-secondary text-navy-950 font-bold shadow-md'
                    : 'text-navy-400 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Theatre</span>
              </button>
            </div>

            {/* Mode Banner */}
            <div className="mt-3 py-1.5 px-3 rounded-lg text-[11px] flex items-center justify-between border bg-navy-950/60 border-navy-800 text-navy-300">
              <span>
                Mode:{' '}
                <strong className="text-white capitalize">
                  {loginMode === 'user' ? 'Customer Account' : loginMode === 'admin' ? 'System Administrator' : 'Theatre Partner'}
                </strong>
              </span>
              <span className="text-[10px] text-accent-secondary font-mono">Role-Verified</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex flex-col gap-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span className="leading-relaxed">{error}</span>
              </div>
              {error.includes('Admin Login') && loginMode !== 'admin' && (
                <button
                  type="button"
                  onClick={() => handleModeChange('admin')}
                  className="self-start mt-1 px-3 py-1 text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition shadow flex items-center gap-1 cursor-pointer"
                >
                  <Shield className="w-3 h-3" />
                  <span>Switch to Admin Mode &rarr;</span>
                </button>
              )}
              {error.includes('Theatre') && loginMode !== 'theatre' && (
                <button
                  type="button"
                  onClick={() => handleModeChange('theatre')}
                  className="self-start mt-1 px-3 py-1 text-[11px] font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition shadow flex items-center gap-1 cursor-pointer"
                >
                  <Building2 className="w-3 h-3" />
                  <span>Switch to Theatre Mode &rarr;</span>
                </button>
              )}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4.5">
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-slate-300 mb-1.5 cursor-pointer">
                {loginMode === 'user' ? 'Email or Mobile Number' : 'Authorized Staff Email'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  autoFocus
                  autoComplete="username"
                  placeholder={
                    loginMode === 'admin'
                      ? 'admin@cineverse.com'
                      : loginMode === 'theatre'
                      ? 'theatre@cineverse.com'
                      : 'name@example.com'
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-cine-900 border border-cine-700 hover:border-cine-600 focus:border-violet-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-xs font-semibold text-slate-300 cursor-pointer">
                  Password
                </label>
                {loginMode === 'user' && (
                  <Link
                    to="/forgot-password"
                    className="text-xs text-teal-400 hover:underline"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-cine-900 border border-cine-700 hover:border-cine-600 focus:border-violet-500 rounded-xl pl-10 pr-11 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all font-mono tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-teal-400" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <label htmlFor="remember-me" className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  id="remember-me"
                  name="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-cine-900 border-cine-700 text-violet-600 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-violet-600"
                />
                <span className="text-slate-300">Remember this device</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg disabled:opacity-50 mt-2 ${
                loginMode === 'admin'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/30'
                  : loginMode === 'theatre'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-navy-950 font-black shadow-teal-500/20'
                  : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-glow-violet'
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying credentials...</span>
                </div>
              ) : (
                <>
                  <span>
                    Sign In as {loginMode === 'user' ? 'Customer' : loginMode === 'admin' ? 'Admin' : 'Theatre'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Assistant (Development only) */}
          {isDev && (
            <div className="mt-6 pt-5 border-t border-navy-800/80">
              <p className="text-[11px] text-navy-400 mb-2 font-medium">Quick Demo Login Helpers (Dev Mode):</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoFill('user')}
                  className="px-2.5 py-1 text-[11px] bg-violet-500/10 border border-violet-500/30 text-violet-300 rounded-lg hover:bg-violet-500/20 transition flex items-center gap-1 cursor-pointer"
                >
                  <User className="w-3 h-3" /> Fill Customer
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('admin')}
                  className="px-2.5 py-1 text-[11px] bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded-lg hover:bg-indigo-500/20 transition flex items-center gap-1 cursor-pointer"
                >
                  <Shield className="w-3 h-3" /> Fill Admin Email
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('theatre')}
                  className="px-2.5 py-1 text-[11px] bg-teal-500/10 border border-teal-500/30 text-teal-300 rounded-lg hover:bg-teal-500/20 transition flex items-center gap-1 cursor-pointer"
                >
                  <Building2 className="w-3 h-3" /> Fill Theatre Email
                </button>
              </div>
            </div>
          )}

          {/* Registration Footer */}
          <div className="mt-6 text-center text-xs text-navy-400">
            {loginMode === 'user' ? (
              <p>
                Don't have an account?{' '}
                <Link to="/register" className="text-accent-secondary hover:underline font-semibold">
                  Register here
                </Link>
              </p>
            ) : (
              <p className="text-[11px] text-navy-500">
                Staff credentials are provisioned by system administration. Public registration grants user role only.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
