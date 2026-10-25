import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Film, Mail, KeyRound, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, Info } from 'lucide-react';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter token & new password
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [devToken, setDevToken] = useState(null);

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSuccessMsg(res.data.message || 'Reset code generated.');
      if (res.data.resetToken) {
        setDevToken(res.data.resetToken);
        setToken(res.data.resetToken); // auto-fill for dev convenience
      }
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not find an account with that email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/reset-password', {
        token,
        password: newPassword,
      });
      setSuccessMsg('Your password has been reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired reset token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 flex items-center justify-center relative overflow-hidden bg-navy-950">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-20 pointer-events-auto">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-accent-primary via-indigo-500 to-accent-secondary flex items-center justify-center shadow-lg shadow-accent-primary/20 group-hover:scale-105 transition">
              <Film className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              Cine<span className="text-accent-secondary">Verse</span> AI
            </span>
          </Link>
          <h1 className="text-xl font-bold text-white tracking-wide">Password Recovery</h1>
          <p className="text-xs text-navy-400 mt-1">
            {step === 1 ? 'Enter your registered email to receive a recovery code' : 'Set your new password'}
          </p>
        </div>

        <div className="bg-navy-900/80 border border-navy-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {devToken && (
            <div className="mb-5 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-indigo-200">
                <Info className="w-4 h-4 text-accent-secondary" />
                <span>Development Reset Token</span>
              </div>
              <p className="text-[11px] text-indigo-300/80">
                Email delivery is running in development mode. Your 6-character recovery token is:{' '}
                <strong className="text-white font-mono bg-navy-950 px-2 py-0.5 rounded">{devToken}</strong>
              </p>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestToken} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-navy-300 mb-1.5">Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-navy-500" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-navy-950/80 border border-navy-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-accent-primary hover:bg-accent-primary/90 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-accent-primary/30 transition disabled:opacity-50"
              >
                {loading ? 'Generating Code...' : 'Send Recovery Code'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-navy-300 mb-1.5">Recovery Token</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 w-4 h-4 text-navy-500" />
                  <input
                    type="text"
                    required
                    placeholder="Enter reset token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full bg-navy-950/80 border border-navy-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white font-mono tracking-wider focus:outline-none focus:border-accent-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-navy-300 mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-navy-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-navy-950/80 border border-navy-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-accent-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-navy-500 hover:text-navy-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-navy-300 mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-navy-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-navy-950/80 border border-navy-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-accent-primary hover:bg-accent-primary/90 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-accent-primary/30 transition disabled:opacity-50"
              >
                {loading ? 'Updating Password...' : 'Reset Password'}
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-navy-400">
            Remember your credentials?{' '}
            <Link to="/login" className="text-accent-secondary hover:underline font-semibold">
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
