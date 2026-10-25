import React, { useState, useEffect } from 'react';
import { Award, Gift, Copy, Check, Tag, Sparkles, Clock, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import api from '../../services/api';

const RewardsPage = () => {
  const [rewardsData, setRewardsData] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rewRes, coupRes] = await Promise.all([
          api.get('/users/rewards'),
          api.get('/coupons/active'),
        ]);
        setRewardsData(rewRes.data);
        setCoupons(coupRes.data || []);
      } catch (err) {
        console.error('[Rewards Fetch Error]:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const copyToClipboard = (text, isRef = false) => {
    navigator.clipboard.writeText(text);
    if (isRef) {
      setCopiedReferral(true);
      setTimeout(() => setCopiedReferral(false), 2000);
    } else {
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-black font-display text-white">Rewards & Loyalty Program</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Earn points on every booking, climb cinema membership tiers, and unlock exclusive discounts
        </p>
      </div>

      {/* Loyalty Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-violet-900/60 via-cine-800 to-amber-900/40 border border-white/10 glass-panel shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-wider">
              {rewardsData?.membershipTier || 'Silver'} Member
            </span>
            <span className="text-xs text-slate-400">Demo Points</span>
          </div>
          <div className="text-4xl sm:text-5xl font-black font-display text-white tracking-tight">
            {rewardsData?.rewardPoints || 0} <span className="text-lg font-bold text-amber-400">Pts</span>
          </div>
          <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
            Every 1 Point = ₹1 Discount on your ticket bookings. Earn 5% back in points on every confirmed ticket.
          </p>
        </div>

        {/* Referral Card */}
        <div className="p-5 rounded-2xl bg-cine-900/80 border border-white/10 space-y-2 text-left sm:text-right min-w-[240px]">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Your Referral Code
          </span>
          <div className="flex items-center justify-between sm:justify-end gap-2">
            <span className="font-mono text-base font-extrabold text-teal-300">
              {rewardsData?.referralCode || 'CINE2026'}
            </span>
            <button
              onClick={() => copyToClipboard(rewardsData?.referralCode || 'CINE2026', true)}
              className="p-1.5 rounded-lg bg-cine-800 hover:bg-cine-700 text-slate-300 hover:text-white transition-colors"
              title="Copy referral code"
            >
              {copiedReferral ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] text-slate-400">Give ₹50, Get 50 points on friend's signup.</p>
        </div>
      </div>

      {/* Available Coupons */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-teal-400" />
          <h2 className="text-xl font-bold font-display text-white">Active Promo Vouchers</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {coupons.map((coupon) => (
            <div
              key={coupon._id}
              className="p-5 rounded-2xl glass-card flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40">
                    {coupon.code}
                  </span>
                  <button
                    onClick={() => copyToClipboard(coupon.code)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    title="Copy Promo Code"
                  >
                    {copiedCode === coupon.code ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <h4 className="font-bold text-white text-sm mt-3">{coupon.description}</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Min Order: ₹{coupon.minOrderValue} • Max OFF: ₹{coupon.maxDiscount}
                </p>
              </div>

              <div className="text-[10px] text-slate-500 pt-2 border-t border-white/5">
                Valid until {new Date(coupon.validUntil).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reward History */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-violet-400" />
          <h2 className="text-xl font-bold font-display text-white">Points Activity History</h2>
        </div>

        {rewardsData?.history && rewardsData.history.length > 0 ? (
          <div className="rounded-2xl glass-panel border border-white/10 overflow-hidden divide-y divide-white/5 text-xs">
            {rewardsData.history.map((tx) => (
              <div key={tx._id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl ${
                      tx.type === 'earned' || tx.type === 'bonus'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {tx.type === 'earned' || tx.type === 'bonus' ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-white">{tx.description}</div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(tx.createdAt).toLocaleDateString()} at{' '}
                      {new Date(tx.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                <div
                  className={`font-mono font-bold text-sm ${
                    tx.points > 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {tx.points > 0 ? `+${tx.points}` : tx.points} Pts
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl glass-panel border border-white/10 text-xs text-slate-400">
            No point transactions recorded yet. Complete your first ticket booking to earn points!
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardsPage;
