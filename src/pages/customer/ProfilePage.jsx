import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocationContext } from '../../context/LocationContext';
import { User, Mail, Phone, MapPin, Award, Shield, CheckCircle, Save, KeyRound } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { selectedCity, selectCityManually } = useLocationContext();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    preferredCity: user?.preferredCity || selectedCity || 'Chennai',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [passMsg, setPassMsg] = useState({ type: '', text: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg({ type: '', text: '' });
    try {
      await updateProfile(profileData);
      selectCityManually(profileData.preferredCity);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPassMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPassMsg({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    setPassLoading(true);
    setPassMsg({ type: '', text: '' });
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPassMsg({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPassMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setPassLoading(false);
    }
  };

  const tierColors = {
    Bronze: 'from-amber-700 to-amber-900 border-amber-600/40 text-amber-200',
    Silver: 'from-slate-400 to-slate-600 border-slate-300/40 text-slate-100',
    Gold: 'from-amber-400 to-yellow-600 border-yellow-300/40 text-yellow-100',
    VIP: 'from-purple-600 to-indigo-700 border-purple-400/40 text-purple-100',
  };

  return (
    <div className="min-h-screen py-10 px-4 max-w-5xl mx-auto space-y-8">
      {/* Top Header Card */}
      <div className="bg-navy-900/60 border border-navy-700/60 rounded-2xl p-6 sm:p-8 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center font-bold text-3xl text-white shadow-lg shadow-accent-primary/20">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r border ${tierColors[user?.tier || 'Bronze']}`}>
                {user?.tier || 'Bronze'} Member
              </span>
            </div>
            <p className="text-navy-300 text-sm mt-0.5 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" /> {user?.email}
            </p>
            <p className="text-navy-400 text-xs mt-1">
              Account Role: <span className="text-accent-secondary uppercase font-semibold">{user?.role}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-navy-950/70 border border-navy-800 p-4 rounded-xl">
          <div className="text-center px-3 border-r border-navy-800">
            <p className="text-xs text-navy-400">Reward Points</p>
            <p className="text-2xl font-black text-amber-400">{user?.rewardPoints || 0}</p>
          </div>
          <div className="text-center px-3">
            <p className="text-xs text-navy-400">Referral Code</p>
            <p className="text-sm font-mono font-bold text-accent-secondary tracking-wider">{user?.referralCode || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Details Form */}
        <div className="bg-navy-900/50 border border-navy-800 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-navy-800">
            <User className="w-5 h-5 text-accent-secondary" />
            <h2 className="text-lg font-semibold text-white">Profile Details</h2>
          </div>

          {profileMsg.text && (
            <div className={`p-3 rounded-xl mb-4 text-sm flex items-center gap-2 ${profileMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'}`}>
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-navy-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-navy-500" />
                <input
                  type="text"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full bg-navy-950/80 border border-navy-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-navy-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-navy-500" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-navy-950/40 border border-navy-900 rounded-xl pl-10 pr-4 py-2.5 text-sm text-navy-400 cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-navy-500 mt-1">Email cannot be changed directly.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-navy-300 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-navy-500" />
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full bg-navy-950/80 border border-navy-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-navy-300 mb-1.5">Preferred City</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-navy-500" />
                <select
                  value={profileData.preferredCity}
                  onChange={(e) => setProfileData({ ...profileData, preferredCity: e.target.value })}
                  className="w-full bg-navy-950/80 border border-navy-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-primary"
                >
                  <option value="Chennai">Chennai</option>
                  <option value="Salem">Salem</option>
                  <option value="Coimbatore">Coimbatore</option>
                  <option value="Madurai">Madurai</option>
                  <option value="Bengaluru">Bengaluru</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="w-full mt-2 py-2.5 bg-accent-primary hover:bg-accent-primary/90 text-white font-medium rounded-xl flex items-center justify-center gap-2 text-sm shadow-md transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {profileLoading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-navy-900/50 border border-navy-800 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-navy-800">
            <Shield className="w-5 h-5 text-accent-primary" />
            <h2 className="text-lg font-semibold text-white">Security & Password</h2>
          </div>

          {passMsg.text && (
            <div className={`p-3 rounded-xl mb-4 text-sm flex items-center gap-2 ${passMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'}`}>
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{passMsg.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-navy-300 mb-1.5">Current Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 w-4 h-4 text-navy-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full bg-navy-950/80 border border-navy-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-navy-300 mb-1.5">New Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 w-4 h-4 text-navy-500" />
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full bg-navy-950/80 border border-navy-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-navy-300 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 w-4 h-4 text-navy-500" />
                <input
                  type="password"
                  required
                  placeholder="Repeat new password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full bg-navy-950/80 border border-navy-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={passLoading}
              className="w-full mt-2 py-2.5 bg-navy-800 hover:bg-navy-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 text-sm border border-navy-700 transition disabled:opacity-50"
            >
              <Shield className="w-4 h-4 text-accent-secondary" />
              {passLoading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
