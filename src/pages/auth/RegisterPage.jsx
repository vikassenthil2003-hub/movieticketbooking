import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Film, User, Mail, Phone, Lock, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    preferredCity: 'Chennai',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field-specific error as user types
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
    if (field === 'password' && fieldErrors.confirmPassword && value === formData.confirmPassword) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
    }
    if (error) setError('');
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Full name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email address';
    }

    if (formData.phone.trim() && !/^[0-9+\s-]{7,15}$/.test(formData.phone.trim())) {
      errors.phone = 'Please provide a valid mobile number';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const clientErrors = validateForm();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setError(Object.values(clientErrors)[0]);
      return;
    }

    setLoading(true);
    setError('');
    setFieldErrors({});

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        preferredCity: formData.preferredCity,
      });
      navigate('/', { replace: true });
    } catch (err) {
      const serverMessage =
        err.message ||
        err.data?.message ||
        err.response?.data?.message ||
        'Registration failed. Please verify your details.';
      setError(serverMessage);

      if (err.data?.errors) {
        setFieldErrors(err.data.errors);
      }
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
          <h1 className="text-xl font-bold text-white tracking-wide">Create CineVerse Account</h1>
          <p className="text-xs text-navy-400 mt-1">Join thousands of cinema lovers enjoying AI-driven booking</p>
        </div>

        <div className="bg-navy-900/80 border border-navy-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          {/* Security Notice */}
          <div className="mb-5 p-2.5 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center gap-2 text-xs text-accent-secondary">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Public registration creates a secure <strong>Customer</strong> account.</span>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-medium text-navy-300 mb-1.5">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-navy-500 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikas Kumar"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`w-full bg-navy-950/80 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none transition ${
                    fieldErrors.name
                      ? 'border-rose-500/70 focus:border-rose-500'
                      : 'border-navy-800 focus:border-accent-primary'
                  }`}
                />
              </div>
              {fieldErrors.name && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {fieldErrors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-navy-300 mb-1.5">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-navy-500 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full bg-navy-950/80 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none transition ${
                    fieldErrors.email
                      ? 'border-rose-500/70 focus:border-rose-500'
                      : 'border-navy-800 focus:border-accent-primary'
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-navy-300 mb-1.5">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-navy-500 pointer-events-none" />
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className={`w-full bg-navy-950/80 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none transition ${
                      fieldErrors.phone
                        ? 'border-rose-500/70 focus:border-rose-500'
                        : 'border-navy-800 focus:border-accent-primary'
                    }`}
                  />
                </div>
                {fieldErrors.phone && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-navy-300 mb-1.5">Home City</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-navy-500 pointer-events-none" />
                  <select
                    value={formData.preferredCity}
                    onChange={(e) => handleChange('preferredCity', e.target.value)}
                    className="w-full bg-navy-950/80 border border-navy-800 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-accent-primary cursor-pointer"
                  >
                    <option value="Chennai">Chennai</option>
                    <option value="Salem">Salem</option>
                    <option value="Coimbatore">Coimbatore</option>
                    <option value="Madurai">Madurai</option>
                    <option value="Bengaluru">Bengaluru</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-navy-300 mb-1.5">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-navy-500 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className={`w-full bg-navy-950/80 border rounded-xl pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none transition ${
                    fieldErrors.password
                      ? 'border-rose-500/70 focus:border-rose-500'
                      : 'border-navy-800 focus:border-accent-primary'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-navy-500 hover:text-navy-300 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {fieldErrors.password}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-navy-300 mb-1.5">Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-navy-500 pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Repeat your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  className={`w-full bg-navy-950/80 border rounded-xl pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none transition ${
                    fieldErrors.confirmPassword
                      ? 'border-rose-500/70 focus:border-rose-500'
                      : 'border-navy-800 focus:border-accent-primary'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-navy-500 hover:text-navy-300 cursor-pointer"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-accent-primary hover:bg-accent-primary/90 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-accent-primary/30 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-navy-400">
            Already have an account?{' '}
            <Link to="/login" className="text-accent-secondary hover:underline font-semibold">
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
