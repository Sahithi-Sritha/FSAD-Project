import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import api from '../services/api';
import { getFoodEmoji, MEAL_TYPE_CONFIG } from '../utils/foodIcons';
import {
  FiPlus, FiActivity, FiBarChart2, FiMessageSquare,
  FiTrendingUp, FiTarget, FiZap, FiDroplet
} from 'react-icons/fi';

const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay: i * 0.07, ease: [0.4, 0, 0.2, 1] },
});

export default function Dashboard({ user, onLogout }) {
  const [meals, setMeals] = useState([]);
  const [goals, setGoals] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [mRes, gRes] = await Promise.all([
          api.get(`/api/dietary-entries/today?userId=${user.id}`),
          api.get(`/api/goals?userId=${user.id}`),
        ]);
        setMeals(mRes.data);
        setGoals(gRes.data);
      } catch { /* silent */ }
      setLoading(false);
    };
    load();
  }, [user.id]);

  /* ── Calculations ─────────────────────────────────── */
  const totals = meals.reduce(
    (t, m) => ({
      calories: t.calories + (m.calories || 0),
      protein:  t.protein  + (m.protein  || 0),
      carbs:    t.carbs    + (m.carbs    || 0),
      fat:      t.fat      + (m.fat      || 0),
      fiber:    t.fiber    + (m.fiber    || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  );

  const calGoal  = goals?.dailyCalorieGoal  || 2000;
  const protGoal = goals?.dailyProteinGoal  || 50;
  const carbGoal = goals?.dailyCarbGoal     || 300;
  const fatGoal  = goals?.dailyFatGoal      || 65;

  const calPct  = Math.min((totals.calories / calGoal) * 100, 100);
  const calRemain = Math.max(calGoal - totals.calories, 0);

  /* BMI */
  const bmi = (() => {
    const stored = localStorage.getItem('userBMI');
    if (stored) return parseFloat(stored);
    if (user.weightKg && user.heightCm)
      return +(user.weightKg / ((user.heightCm / 100) ** 2)).toFixed(1);
    return null;
  })();
  const bmiLabel =
    bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
  const bmiColor =
    bmi < 18.5 ? 'text-amber-500' : bmi < 25 ? 'text-emerald-500' : bmi < 30 ? 'text-orange-500' : 'text-rose-500';
  const bmiBg =
    bmi < 18.5 ? 'from-amber-500/10 to-amber-500/5' : bmi < 25 ? 'from-emerald-500/10 to-emerald-500/5' : bmi < 30 ? 'from-orange-500/10 to-orange-500/5' : 'from-rose-500/10 to-rose-500/5';

  /* Calorie ring SVG params */
  const ringR = 70, ringC = 2 * Math.PI * ringR;
  const ringOffset = ringC - (calPct / 100) * ringC;

  /* Macro bar helper */
  const MacroBar = ({ label, value, goal, color, icon: Icon }) => {
    const pct = Math.min((value / goal) * 100, 100);
    return (
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-slate-600 dark:text-slate-300">{label}</span>
            <span className="text-slate-400">{Math.round(value)}g / {goal}g</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="progress-fill h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, var(--tw-gradient-stops))` }}>
              <div className={`h-full rounded-full ${color}`} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* Quick actions */
  const quickActions = [
    { to: '/nutrition', icon: FiActivity,     label: 'Analysis',  bg: 'from-emerald-500 to-teal-500' },
    { to: '/ai-chat',   icon: FiMessageSquare, label: 'NutriBot',  bg: 'from-brand-500 to-purple-500' },
    { to: '/charts',    icon: FiBarChart2,    label: 'Charts',    bg: 'from-amber-500 to-orange-500' },
    { to: '/goals',     icon: FiTarget,       label: 'Goals',     bg: 'from-rose-500 to-pink-500' },
  ];

  /* ── Skeleton ─────────────────────────────────────── */
  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 animate-pulse">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-32 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />
          ))}
          <div className="md:col-span-2 h-72 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />
          <div className="md:col-span-2 h-72 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      {/* ── Header ──────────────────────────────────── */}
      <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Welcome back, <span className="gradient-text">{user.username}</span> 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Here's your nutrition snapshot for today
          </p>
        </div>
        <Link to="/log-food" className="btn-primary self-start sm:self-auto">
          <FiPlus className="w-4 h-4" /> Log Meal
        </Link>
      </motion.div>

      {/* ── Stat Cards (top row) ────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Calories',  value: Math.round(totals.calories), goal: calGoal,  unit: 'kcal', color: 'from-orange-500 to-amber-500',  icon: FiZap },
          { label: 'Protein',   value: Math.round(totals.protein),  goal: protGoal, unit: 'g',    color: 'from-rose-500 to-pink-500',     icon: FiTrendingUp },
          { label: 'Carbs',     value: Math.round(totals.carbs),    goal: carbGoal, unit: 'g',    color: 'from-blue-500 to-cyan-500',     icon: FiDroplet },
          { label: 'Fat',       value: Math.round(totals.fat),      goal: fatGoal,  unit: 'g',    color: 'from-purple-500 to-violet-500', icon: FiTarget },
        ].map((s, i) => {
          const pct = Math.min((s.value / s.goal) * 100, 100);
          return (
            <motion.div key={s.label} {...fadeUp(i + 1)} className="glass-card p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg`}>
                  <s.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-semibold text-slate-400">{Math.round(pct)}%</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}<span className="text-xs font-normal text-slate-400 ml-1">{s.unit}</span></p>
              <p className="text-xs text-slate-400 mt-0.5">{s.label} · of {s.goal}{s.unit}</p>
              <div className="mt-3 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + i * 0.05, ease: [0.4, 0, 0.2, 1] }}
                  className={`h-full rounded-full bg-gradient-to-r ${s.color}`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Middle Section (ring + macros/bmi) ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Calorie Ring */}
        <motion.div {...fadeUp(5)} className="glass-card p-6 flex flex-col items-center justify-center lg:col-span-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Calorie Budget</p>
          <div className="relative">
            <svg width="170" height="170" className="transform -rotate-90">
              <defs>
                <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              <circle cx="85" cy="85" r={ringR} fill="none" strokeWidth="10" className="calorie-ring-bg" />
              <motion.circle
                cx="85" cy="85" r={ringR} fill="none" strokeWidth="10"
                stroke="url(#calorieGradient)"
                strokeLinecap="round"
                strokeDasharray={ringC}
                initial={{ strokeDashoffset: ringC }}
                animate={{ strokeDashoffset: ringOffset }}
                transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">{Math.round(calPct)}%</span>
              <span className="text-xs text-slate-400">{calRemain} kcal left</span>
            </div>
          </div>
          <div className="mt-4 flex gap-6 text-center">
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{Math.round(totals.calories)}</p>
              <p className="text-[10px] text-slate-400 uppercase">Consumed</p>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{calGoal}</p>
              <p className="text-[10px] text-slate-400 uppercase">Goal</p>
            </div>
          </div>
        </motion.div>

        {/* Macros + BMI */}
        <motion.div {...fadeUp(6)} className="glass-card p-6 lg:col-span-2 flex flex-col gap-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Macro Breakdown</h3>
            <div className="space-y-4">
              <MacroBar label="Protein" value={totals.protein} goal={protGoal} color="bg-gradient-to-r from-rose-500 to-pink-500" icon={FiTrendingUp} />
              <MacroBar label="Carbs"   value={totals.carbs}   goal={carbGoal} color="bg-gradient-to-r from-blue-500 to-cyan-500"  icon={FiDroplet} />
              <MacroBar label="Fat"     value={totals.fat}     goal={fatGoal}  color="bg-gradient-to-r from-purple-500 to-violet-500" icon={FiTarget} />
            </div>
          </div>

          {bmi && (
            <div className={`rounded-xl bg-gradient-to-r ${bmiBg} p-4 flex items-center gap-4`}>
              <div className="w-14 h-14 rounded-xl bg-white/80 dark:bg-slate-900/50 flex flex-col items-center justify-center">
                <span className={`text-xl font-bold ${bmiColor}`}>{bmi}</span>
                <span className="text-[9px] text-slate-400 uppercase">BMI</span>
              </div>
              <div>
                <p className={`text-sm font-semibold ${bmiColor}`}>{bmiLabel}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {bmi < 25 ? 'Great job maintaining a healthy weight!' : 'Consider adjusting your nutrition goals'}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Today's Meals ───────────────────────────── */}
      <motion.div {...fadeUp(7)} className="glass-card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Today's Meals</h3>
          <Link to="/history" className="text-xs font-medium text-brand-500 hover:text-brand-600 transition-colors">
            View All →
          </Link>
        </div>
        {meals.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
              <FiPlus className="w-6 h-6 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-sm text-slate-400">No meals logged yet today</p>
            <Link to="/log-food" className="btn-primary mt-4 text-xs px-4 py-2">Log your first meal</Link>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory -mx-1 px-1">
            {meals.map((m) => {
              const cfg = MEAL_TYPE_CONFIG[m.mealType] || MEAL_TYPE_CONFIG.SNACK;
              return (
                <div
                  key={m.id}
                  className="snap-start flex-shrink-0 w-40 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/40 hover:shadow-md transition-all"
                >
                  <div className="text-2xl mb-2">{getFoodEmoji(m.foodName)}</div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{m.foodName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{m.portionSize}g</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-xs">{cfg.emoji}</span>
                    <span className="text-xs text-slate-400">{cfg.label}</span>
                  </div>
                  <p className="text-sm font-bold text-brand-600 dark:text-brand-400 mt-1">{Math.round(m.calories)} kcal</p>
                </div>
              );
            })}
            {/* Add card */}
            <Link
              to="/log-food"
              className="snap-start flex-shrink-0 w-40 p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 hover:text-brand-500 hover:border-brand-300 dark:hover:border-brand-600 transition-all"
            >
              <FiPlus className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Add Meal</span>
            </Link>
          </div>
        )}
      </motion.div>

      {/* ── Quick Actions ───────────────────────────── */}
      <motion.div {...fadeUp(8)} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="glass-card-hover p-4 flex flex-col items-center gap-3 text-center group"
          >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${a.bg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
              <a.icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{a.label}</span>
          </Link>
        ))}
      </motion.div>
    </Layout>
  );
}
