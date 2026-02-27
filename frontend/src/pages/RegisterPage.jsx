import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import {
  FiUser, FiMail, FiLock, FiArrowRight,
  FiEye, FiEyeOff, FiActivity, FiArrowLeft
} from 'react-icons/fi';

const FLOAT_EMOJIS = ['🍛', '🥒', '🍋', '🫑', '🥭', '🍇'];

export default function RegisterPage({ onRegister }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '', email: '', password: '', confirmPassword: '',
    age: '', weightKg: '', heightCm: '',
  });
  const [heightMode, setHeightMode] = useState('cm');
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  /* Height conversion */
  const handleFeetChange = (v) => {
    setFeet(v);
    const cm = Math.round((parseInt(v || 0) * 30.48) + (parseInt(inches || 0) * 2.54));
    setForm((f) => ({ ...f, heightCm: cm || '' }));
  };
  const handleInchesChange = (v) => {
    setInches(v);
    const cm = Math.round((parseInt(feet || 0) * 30.48) + (parseInt(v || 0) * 2.54));
    setForm((f) => ({ ...f, heightCm: cm || '' }));
  };

  /* BMI preview */
  const bmi = useMemo(() => {
    const w = parseFloat(form.weightKg), h = parseFloat(form.heightCm);
    if (w > 0 && h > 0) return (w / ((h / 100) ** 2)).toFixed(1);
    return null;
  }, [form.weightKg, form.heightCm]);

  const bmiInfo = useMemo(() => {
    if (!bmi) return null;
    const v = parseFloat(bmi);
    if (v < 18.5) return { label: 'Underweight', color: 'text-amber-500', bg: 'bg-amber-500' };
    if (v < 25)   return { label: 'Normal',      color: 'text-emerald-500', bg: 'bg-emerald-500' };
    if (v < 30)   return { label: 'Overweight',   color: 'text-orange-500', bg: 'bg-orange-500' };
    return { label: 'Obese', color: 'text-rose-500', bg: 'bg-rose-500' };
  }, [bmi]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      const body = {
        username: form.username, email: form.email, password: form.password,
        age: form.age ? parseInt(form.age) : null,
        weightKg: form.weightKg ? parseFloat(form.weightKg) : null,
        heightCm: form.heightCm ? parseFloat(form.heightCm) : null,
      };
      await api.post('/api/auth/register', body);
      toast.success('Account created! Signing in…');
      const loginRes = await api.post('/api/auth/login', { username: form.username, password: form.password });
      if (bmi) localStorage.setItem('userBMI', bmi);
      onRegister(loginRes.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel ──────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-purple-600 via-brand-600 to-purple-700">
        {FLOAT_EMOJIS.map((emoji, i) => (
          <span
            key={i}
            className="auth-float"
            style={{
              top: `${8 + (i * 16) % 72}%`,
              left: `${6 + (i * 17) % 82}%`,
              animationDelay: `${i * -1.2}s`,
              fontSize: `${1.5 + (i % 3) * 0.5}rem`,
            }}
          >
            {emoji}
          </span>
        ))}
        <div className="relative z-10 flex flex-col justify-center px-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-white text-lg font-black">DS</span>
              </div>
              <span className="text-2xl font-bold text-white">DietSphere</span>
            </div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Start Your<br />
              <span className="text-white/80">Wellness Journey</span>
            </h2>
            <p className="text-white/60 text-sm max-w-sm leading-relaxed">
              Create an account to begin tracking your nutrition with AI-powered insights
              and personalized recommendations.
            </p>
            <div className="mt-10 space-y-3">
              {['BMI-adjusted nutrition goals', 'AI chatbot for dietary advice', 'Comprehensive charts & analytics'].map((f) => (
                <div key={f} className="flex items-center gap-3 text-white/70 text-sm">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-white text-[10px]">✓</span>
                  </div>
                  {f}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-white/[0.06]" />
        <div className="absolute -bottom-40 -left-20 w-96 h-96 rounded-full bg-white/[0.04]" />
      </div>

      {/* ── Right Panel (form) ──────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-white dark:bg-slate-950 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-lg"
        >
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 mb-6 transition-colors">
            <FiArrowLeft className="w-3.5 h-3.5" /> Back to login
          </Link>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Create your account</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Fill in your details to get started
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200/50 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: Username + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Username</label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" value={form.username} onChange={set('username')} className="input-glass pl-10" placeholder="johndoe" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" value={form.email} onChange={set('email')} className="input-glass pl-10" placeholder="john@example.com" required />
                </div>
              </div>
            </div>

            {/* Row 2: Password + Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')}
                    className="input-glass pl-10 pr-10" placeholder="Min. 6 characters" required
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    {showPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} className="input-glass pl-10" placeholder="Repeat password" required />
                </div>
              </div>
            </div>

            {/* Row 3: Age + Weight */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Age <span className="text-slate-400 font-normal">(optional)</span></label>
                <input type="number" value={form.age} onChange={set('age')} className="input-glass" placeholder="e.g. 25" min="1" max="120" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Weight (kg) <span className="text-slate-400 font-normal">(optional)</span></label>
                <input type="number" value={form.weightKg} onChange={set('weightKg')} className="input-glass" placeholder="e.g. 70" min="20" max="300" step="0.1" />
              </div>
            </div>

            {/* Row 4: Height */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Height <span className="text-slate-400 font-normal">(optional)</span></label>
                <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 text-xs">
                  <button type="button" onClick={() => setHeightMode('cm')}
                    className={`px-3 py-1 font-medium transition-colors ${heightMode === 'cm' ? 'bg-brand-500 text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>
                    cm
                  </button>
                  <button type="button" onClick={() => setHeightMode('ft')}
                    className={`px-3 py-1 font-medium transition-colors ${heightMode === 'ft' ? 'bg-brand-500 text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>
                    ft/in
                  </button>
                </div>
              </div>
              {heightMode === 'cm' ? (
                <input type="number" value={form.heightCm} onChange={set('heightCm')} className="input-glass" placeholder="e.g. 175" min="50" max="300" />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" value={feet} onChange={(e) => handleFeetChange(e.target.value)} className="input-glass" placeholder="Feet" min="1" max="8" />
                  <input type="number" value={inches} onChange={(e) => handleInchesChange(e.target.value)} className="input-glass" placeholder="Inches" min="0" max="11" />
                </div>
              )}
            </div>

            {/* BMI Preview */}
            {bmi && bmiInfo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/40 p-4 flex items-center gap-4"
              >
                <div className="flex items-center gap-3">
                  <FiActivity className={`w-5 h-5 ${bmiInfo.color}`} />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">BMI: {bmi}</p>
                    <p className={`text-xs font-medium ${bmiInfo.color}`}>{bmiInfo.label}</p>
                  </div>
                </div>
                <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-amber-400 via-emerald-400 via-50% to-rose-400 relative ml-4">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-slate-900 dark:border-white shadow"
                    style={{ left: `${Math.min(Math.max(((parseFloat(bmi) - 15) / 25) * 100, 0), 100)}%` }}
                  />
                </div>
              </motion.div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm mt-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create Account <FiArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
