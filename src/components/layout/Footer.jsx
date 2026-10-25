import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Heart, MapPin, Film } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-cine-950 border-t border-white/10 pt-16 pb-12 mt-20 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-teal-400 p-0.5 shadow-glow-violet">
                <div className="w-full h-full bg-cine-900 rounded-[6px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                </div>
              </div>
              <span className="text-xl font-black font-display text-white">
                Cine<span className="text-violet-400">Verse</span> <span className="text-teal-400 text-xs">AI</span>
              </span>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              CineVerse AI is a next-generation movie ticket booking platform featuring automatic location detection, live seat locking with Socket.IO, and digital QR tickets.
            </p>
            <div className="flex items-center gap-2 pt-2 text-[11px] text-teal-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Demo Sandbox Mode • Simulated Payments • No Real Money Charged</span>
            </div>
          </div>

          {/* Customer Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Explore Movies</h4>
            <ul className="space-y-2">
              <li><Link to="/movies" className="hover:text-violet-400 transition-colors">Now Showing</Link></li>
              <li><Link to="/movies?status=coming_soon" className="hover:text-violet-400 transition-colors">Coming Soon</Link></li>
              <li><Link to="/watch" className="hover:text-violet-400 transition-colors flex items-center gap-1.5"><span className="text-teal-400 font-bold">•</span><span>Watch Trailers</span></Link></li>
              <li><Link to="/theatres" className="hover:text-violet-400 transition-colors">Nearby Theatres</Link></li>
              <li><Link to="/group-booking" className="hover:text-violet-400 transition-colors">Group Bookings</Link></li>
            </ul>
          </div>

          {/* Cities */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Cinema Hubs</h4>
            <ul className="space-y-2">
              <li><span className="text-slate-300">Chennai (Express Avenue, Nexus)</span></li>
              <li><span className="text-slate-300">Bengaluru (Koramangala Galaxy)</span></li>
              <li><span className="text-slate-300">Coimbatore (Prozone Mall)</span></li>
              <li><span className="text-slate-300">Salem (ARRS Multiplex)</span></li>
              <li><span className="text-slate-300">Madurai (Milan Emall)</span></li>
            </ul>
          </div>

          {/* Account & Help */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Account & Support</h4>
            <ul className="space-y-2">
              <li><Link to="/login" className="hover:text-violet-400 transition-colors">Sign In / Register</Link></li>
              <li><Link to="/my-bookings" className="hover:text-violet-400 transition-colors">Booking History</Link></li>
              <li><Link to="/rewards" className="hover:text-violet-400 transition-colors">Rewards & Coupons</Link></li>
              <li><Link to="/help" className="hover:text-violet-400 transition-colors">FAQs & Support</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} CineVerse AI. Designed for film enthusiasts.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
