import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, X, AlertTriangle } from 'lucide-react';

/**
 * Access Denied Alert Banner
 * Automatically displays friendly access-denied notifications passed via router state
 */
const AccessDeniedBanner = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (location.state?.accessDeniedMessage) {
      setMessage(location.state.accessDeniedMessage);
      setIsVisible(true);

      // Clean state from browser history without refreshing
      window.history.replaceState({}, document.title);

      // Auto dismiss after 8 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  if (!isVisible || !message) return null;

  return (
    <div className="w-full bg-rose-500/15 border-b border-rose-500/30 backdrop-blur-md px-4 py-3 z-50 animate-in slide-in-from-top-2 duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300">
              Access Restricted
            </h4>
            <p className="text-xs sm:text-sm font-medium text-white/95 mt-0.5">
              {message}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="p-1.5 rounded-lg text-rose-300 hover:text-white hover:bg-rose-500/20 transition-colors shrink-0"
          title="Dismiss notification"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AccessDeniedBanner;
