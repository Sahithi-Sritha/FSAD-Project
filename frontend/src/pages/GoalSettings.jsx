import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import api from '../services/api';
import { FiSave, FiTarget, FiZap, FiRefreshCw } from 'react-icons/fi';

const PRESETS = [
  {
    name: 'Weight Loss',
    emoji: '🔥',
    desc: 'Lower calories, moderate protein',
    color: 'from-orange-500 to-amber-500',
    goals: { dailyCalorieGoal: 1500, dailyProteinGoal: 60, dailyCarbGoal: 180, dailyFatGoal: 45, dailyFiberGoal: 30 },
  },
  {
    name: 'Maintenance',
    emoji: '⚖️',
    desc: 'Balanced macro distribution',
    color: 'from-brand-500 to-purple-500',
    goals: { dailyCalorieGoal: 2000, dailyProteinGoal: 50, dailyCarbGoal: 250, dailyFatGoal: 65, dailyFiberGoal: 25 },
  },
  {
    name: 'Muscle Building',
    emoji: '💪',
    desc: 'High protein, higher calories',
    color: 'from-rose-500 to-pink-500',
    goals: { dailyCalorieGoal: 2500, dailyProteinGoal: 100, dailyCarbGoal: 300, dailyFatGoal: 80, dailyFiberGoal: 30 },
  },
  {
    name: 'Balanced Indian',
    emoji: '🍛',
    desc: 'Traditional balanced Indian diet',
    color: 'from-emerald-500 to-teal-500',
    goals: { dailyCalorieGoal: 2000, dailyProteinGoal: 55, dailyCarbGoal: 270, dailyFatGoal: 60, dailyFiberGoal: 32 },
  },
];

const GOAL_FIELDS = [
  { key: 'dailyCalorieGoal', label: 'Calories',  unit: 'kcal', min: 800, max: 5000, step: 50,  color: 'from-orange-500 to-amber-500'  },
  { key: 'dailyProteinGoal', label: 'Protein',   unit: 'g',    min: 10,  max: 200,  step: 5,   color: 'from-rose-500 to-pink-500'     },
  { key: 'dailyCarbGoal',    label: 'Carbs',     unit: 'g',    min: 50,  max: 500,  step: 10,  color: 'from-blue-500 to-cyan-500'     },
  { key: 'dailyFatGoal',     label: 'Fat',       unit: 'g',    min: 10,  max: 200,  step: 5,   color: 'from-purple-500 to-violet-500' },
  { key: 'dailyFiberGoal',   label: 'Fiber',     unit: 'g',    min: 5,   max: 80,   step: 1,   color: 'from-emerald-500 to-teal-500'  },
];

const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay: i * 0.06 },
});

export default function GoalSettings({ user, onLogout }) {
  const [goals, setGoals] = useState({
    dailyCalorieGoal: 2000,
    dailyProteinGoal: 50,
    dailyCarbGoal: 250,
    dailyFatGoal: 65,
    dailyFiberGoal: 25,
  });
  const [original, setOriginal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/api/goals?userId=${user.id}`)
      .then((res) => {
        if (res.data) {
          setGoals(res.data);
          setOriginal(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user.id]);

  const isDirty = useMemo(() => {
    if (!original) return false;
    return GOAL_FIELDS.some((f) => goals[f.key] !== original[f.key]);
  }, [goals, original]);

  const applyPreset = (preset) => {
    setGoals({ ...goals, ...preset.goals });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/api/goals?userId=${user.id}`, goals);
      setOriginal(res.data || goals);
      toast.success('Goals saved!');
    } catch {
      toast.error('Failed to save goals');
    }
    setSaving(false);
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Nutrition Goals</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Set daily targets for your macros and calories
          </p>
        </div>
        {isDirty && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleSave}
            disabled={saving}
            className="btn-primary self-start"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><FiSave className="w-4 h-4" /> Save Goals</>
            )}
          </motion.button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="h-28 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />)}
        </div>
      )}

      {!loading && (
        <>
          {/* Presets */}
          <motion.div {...fadeUp(0)} className="mb-8">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Quick Presets</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className="glass-card-hover p-4 text-left group"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${preset.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                    <span className="text-lg">{preset.emoji}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{preset.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{preset.desc}</p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Goal Sliders */}
          <motion.div {...fadeUp(1)} className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Custom Goals</h3>
              {isDirty && (
                <button
                  onClick={() => setGoals(original)}
                  className="btn-ghost text-xs text-slate-400"
                >
                  <FiRefreshCw className="w-3.5 h-3.5" /> Reset
                </button>
              )}
            </div>
            <div className="space-y-6">
              {GOAL_FIELDS.map((field) => {
                const val = goals[field.key] || field.min;
                const pct = ((val - field.min) / (field.max - field.min)) * 100;
                return (
                  <div key={field.key}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${field.color}`} />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{field.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={val}
                          onChange={(e) => {
                            const v = parseInt(e.target.value) || field.min;
                            setGoals({ ...goals, [field.key]: Math.min(field.max, Math.max(field.min, v)) });
                          }}
                          className="w-20 text-right text-sm font-bold text-slate-900 dark:text-white bg-transparent border-none focus:ring-0 p-0"
                        />
                        <span className="text-xs text-slate-400">{field.unit}</span>
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="range"
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        value={val}
                        onChange={(e) => setGoals({ ...goals, [field.key]: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <div className="absolute top-0 left-0 h-2 rounded-full pointer-events-none overflow-hidden" style={{ width: '100%' }}>
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${field.color} transition-all duration-200`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>{field.min} {field.unit}</span>
                      <span>{field.max} {field.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {isDirty && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800"
              >
                <button onClick={handleSave} disabled={saving} className="btn-primary w-full py-3 text-sm">
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><FiSave className="w-4 h-4" /> Save Goals</>
                  )}
                </button>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </Layout>
  );
}
