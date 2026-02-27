import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import api from '../services/api';
import {
  FiUser, FiMail, FiCalendar, FiEdit3, FiSave,
  FiLock, FiTrash2, FiActivity, FiAward, FiZap, FiX
} from 'react-icons/fi';

const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay: i * 0.06 },
});

export default function UserProfile({ user, onLogout, onUpdateUser }) {
  const [stats, setStats] = useState({ totalEntries: 0, activeDays: 0, avgPerDay: 0, totalCalories: 0 });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    age: user?.age || '',
    weightKg: user?.weightKg || '',
    heightCm: user?.heightCm || '',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [showPwForm, setShowPwForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : 'U';

  /* BMI */
  const bmi = form.weightKg && form.heightCm
    ? (parseFloat(form.weightKg) / ((parseFloat(form.heightCm) / 100) ** 2)).toFixed(1)
    : null;
  const bmiColor = !bmi ? '' : parseFloat(bmi) < 18.5 ? 'text-amber-500' : parseFloat(bmi) < 25 ? 'text-emerald-500' : parseFloat(bmi) < 30 ? 'text-orange-500' : 'text-rose-500';

  useEffect(() => {
    api.get(`/api/dietary-entries/user/${user.id}`)
      .then((res) => {
        const entries = res.data;
        const dates = new Set(entries.map((e) => new Date(e.entryDate).toDateString()));
        const totalCal = entries.reduce((s, e) => s + (e.calories || 0), 0);
        setStats({
          totalEntries: entries.length,
          activeDays: dates.size,
          avgPerDay: dates.size > 0 ? (entries.length / dates.size).toFixed(1) : 0,
          totalCalories: Math.round(totalCal),
        });
      })
      .catch(() => {});
  }, [user.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/api/auth/profile/${user.id}`, {
        username: form.username,
        email: form.email,
        age: form.age ? parseInt(form.age) : null,
        weightKg: form.weightKg ? parseFloat(form.weightKg) : null,
        heightCm: form.heightCm ? parseFloat(form.heightCm) : null,
      });
      const updated = { ...user, ...res.data };
      onUpdateUser(updated);
      if (bmi) localStorage.setItem('userBMI', bmi);
      setEditing(false);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast.error('Min 6 characters');
      return;
    }
    setChangingPw(true);
    try {
      await api.put(`/api/auth/change-password/${user.id}`, {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success('Password changed');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPwForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
    setChangingPw(false);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/auth/delete/${user.id}`);
      toast.success('Account deleted');
      onLogout();
    } catch {
      toast.error('Failed to delete account');
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      {/* ── Profile Header ──────────────────────────── */}
      <motion.div {...fadeUp(0)} className="relative glass-card overflow-hidden mb-6">
        {/* Banner gradient */}
        <div className="h-28 bg-gradient-to-r from-brand-600 via-purple-600 to-brand-500" />
        <div className="px-6 pb-6 -mt-10 flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-glow">
            <span className="text-2xl font-bold text-white">{initials}</span>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{user.username}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
          </div>
          {bmi && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur">
              <FiActivity className={`w-4 h-4 ${bmiColor}`} />
              <span className={`text-sm font-bold ${bmiColor}`}>BMI {bmi}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Stats ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Meals',    value: stats.totalEntries, icon: FiZap,    color: 'from-orange-500 to-amber-500' },
          { label: 'Active Days',    value: stats.activeDays,   icon: FiCalendar, color: 'from-emerald-500 to-teal-500' },
          { label: 'Avg Meals/Day',  value: stats.avgPerDay,    icon: FiAward,  color: 'from-brand-500 to-purple-500' },
          { label: 'Total Calories', value: stats.totalCalories, icon: FiActivity, color: 'from-rose-500 to-pink-500' },
        ].map((s, i) => (
          <motion.div key={s.label} {...fadeUp(i + 1)} className="glass-card p-5">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow-lg`}>
              <s.icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Account Info ──────────────────────────── */}
        <motion.div {...fadeUp(5)} className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Account Information</h3>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="btn-ghost text-xs">
                <FiEdit3 className="w-3.5 h-3.5" /> Edit
              </button>
            ) : (
              <button onClick={() => setEditing(false)} className="btn-ghost text-xs text-slate-400">
                <FiX className="w-3.5 h-3.5" /> Cancel
              </button>
            )}
          </div>
          <div className="space-y-4">
            {[
              { icon: FiUser, label: 'Username', key: 'username', type: 'text' },
              { icon: FiMail, label: 'Email',    key: 'email',    type: 'email' },
              { icon: FiCalendar, label: 'Age',   key: 'age',     type: 'number' },
              { icon: FiActivity, label: 'Weight (kg)', key: 'weightKg', type: 'number' },
              { icon: FiActivity, label: 'Height (cm)', key: 'heightCm', type: 'number' },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{f.label}</label>
                {editing ? (
                  <div className="relative">
                    <f.icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={f.type}
                      value={form[f.key]}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      className="input-glass pl-10"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <f.icon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-700 dark:text-slate-200">
                      {form[f.key] || '—'}
                    </span>
                  </div>
                )}
              </div>
            ))}
            {editing && (
              <button onClick={handleSave} disabled={saving} className="btn-primary w-full py-3 text-sm mt-2">
                {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiSave className="w-4 h-4" /> Save Changes</>}
              </button>
            )}
          </div>
        </motion.div>

        {/* ── Security + Danger ─────────────────────── */}
        <div className="space-y-6">
          <motion.div {...fadeUp(6)} className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Security</h3>
              <button onClick={() => setShowPwForm(!showPwForm)} className="btn-ghost text-xs">
                <FiLock className="w-3.5 h-3.5" /> {showPwForm ? 'Cancel' : 'Change Password'}
              </button>
            </div>
            {showPwForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3"
              >
                <input type="password" placeholder="Current password" value={pwForm.currentPassword}
                  onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                  className="input-glass" />
                <input type="password" placeholder="New password (min 6 chars)" value={pwForm.newPassword}
                  onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  className="input-glass" />
                <input type="password" placeholder="Confirm new password" value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                  className="input-glass" />
                <button onClick={handleChangePassword} disabled={changingPw} className="btn-primary w-full py-2.5 text-sm">
                  {changingPw ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Update Password'}
                </button>
              </motion.div>
            )}
          </motion.div>

          <motion.div {...fadeUp(7)} className="glass-card p-6 border-rose-200/50 dark:border-rose-500/10">
            <h3 className="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-2">Danger Zone</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Permanently delete your account and all data. This action cannot be undone.
            </p>
            {!showDeleteConfirm ? (
              <button onClick={() => setShowDeleteConfirm(true)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-600 border border-rose-200 dark:border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all">
                <FiTrash2 className="inline w-4 h-4 mr-1.5 -mt-0.5" /> Delete Account
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button onClick={handleDelete} className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-rose-500 text-white hover:bg-rose-600 transition-colors">
                  Confirm Delete
                </button>
                <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                  Cancel
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
