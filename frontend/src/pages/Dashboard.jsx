import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { getFoodEmoji, MEAL_TYPE_CONFIG } from '../utils/foodIcons';
import { mapDietaryEntries } from '../utils/apiMappers';
import {
  FiPlus, FiActivity, FiBarChart2, FiMessageSquare,
  FiTrendingUp, FiTarget, FiZap, FiDroplet
} from 'react-icons/fi';

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
        setMeals(mapDietaryEntries(mRes.data));
        setGoals(gRes.data);
      } catch { /* silent */ }
      setLoading(false);
    };
    load();
  }, [user.id]);

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

  const calGoal  = goals?.calorieGoal  || 2000;
  const protGoal = goals?.proteinGoal  || 50;
  const carbGoal = goals?.carbsGoal    || 300;
  const fatGoal  = goals?.fatGoal      || 65;

  const calPct   = Math.min((totals.calories / calGoal) * 100, 100);
  const calRemain = Math.max(calGoal - totals.calories, 0);

  const bmi = (() => {
    const stored = localStorage.getItem('userBMI');
    if (stored) return parseFloat(stored);
    if (user.weightKg && user.heightCm)
      return +(user.weightKg / ((user.heightCm / 100) ** 2)).toFixed(1);
    return null;
  })();
  const bmiLabel = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
  const bmiColor = bmi < 18.5 ? 'text-amber-500' : bmi < 25 ? 'text-sage-600' : bmi < 30 ? 'text-orange-500' : 'text-red-500';

  const ringR = 70, ringC = 2 * Math.PI * ringR;
  const ringOffset = ringC - (calPct / 100) * ringC;

  const MacroBar = ({ label, value, goal, color }) => {
    const pct = Math.min((value / goal) * 100, 100);
    return (
      <div className="flex items-center gap-3">
        <span className="w-20 text-xs font-medium text-brown-500">{label}</span>
        <div className="flex-1 h-2 rounded-full bg-cream-200 overflow-hidden">
          <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
        </div>
        <span className="w-20 text-right text-xs text-brown-400">{Math.round(value)}g / {goal}g</span>
      </div>
    );
  };

  const quickActions = [
    { to: '/nutrition', icon: FiActivity,      label: 'Analysis',  bg: 'bg-sage-500' },
    { to: '/ai-chat',   icon: FiMessageSquare, label: 'NutriBot',  bg: 'bg-brown-500' },
    { to: '/charts',    icon: FiBarChart2,     label: 'Charts',    bg: 'bg-sage-600' },
    { to: '/goals',     icon: FiTarget,        label: 'Goals',     bg: 'bg-brown-400' },
  ];

  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 animate-pulse">
          {[1,2,3,4].map((i) => <div key={i} className="h-32 rounded-2xl bg-cream-200" />)}
          <div className="md:col-span-2 h-72 rounded-2xl bg-cream-200" />
          <div className="md:col-span-2 h-72 rounded-2xl bg-cream-200" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal">
            Welcome back, <span className="text-sage-600">{user.username}</span> 👋
          </h1>
          <p className="mt-1 text-sm text-brown-400">Here's your nutrition snapshot for today</p>
        </div>
        <Link to="/log-food" className="btn-primary self-start sm:self-auto">
          <FiPlus className="w-4 h-4" /> Log Meal
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Calories', value: Math.round(totals.calories), goal: calGoal,  unit: 'kcal', icon: FiZap,        bg: 'bg-sage-50',  accent: 'text-sage-600' },
          { label: 'Protein',  value: Math.round(totals.protein),  goal: protGoal, unit: 'g',    icon: FiTrendingUp, bg: 'bg-cream-100', accent: 'text-brown-500' },
          { label: 'Carbs',    value: Math.round(totals.carbs),    goal: carbGoal, unit: 'g',    icon: FiDroplet,    bg: 'bg-sage-50',  accent: 'text-sage-600' },
          { label: 'Fat',      value: Math.round(totals.fat),      goal: fatGoal,  unit: 'g',    icon: FiTarget,     bg: 'bg-cream-100', accent: 'text-brown-500' },
        ].map((s) => {
          const pct = Math.min((s.value / s.goal) * 100, 100);
          return (
            <div key={s.label} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-4 h-4 ${s.accent}`} />
                </div>
                <span className="text-xs font-semibold text-brown-300">{Math.round(pct)}%</span>
              </div>
              <p className="text-2xl font-bold text-charcoal">{s.value}<span className="text-xs font-normal text-brown-300 ml-1">{s.unit}</span></p>
              <p className="text-xs text-brown-400 mt-0.5">{s.label} · of {s.goal}{s.unit}</p>
              <div className="mt-3 h-1.5 rounded-full bg-cream-200 overflow-hidden">
                <div className="h-full rounded-full bg-sage-500 transition-all duration-700" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle: Ring + Macros */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Calorie Ring */}
        <div className="card p-6 flex flex-col items-center justify-center lg:col-span-1">
          <p className="text-xs font-semibold text-brown-400 uppercase tracking-wider mb-4">Calorie Budget</p>
          <div className="relative">
            <svg width="170" height="170" className="transform -rotate-90">
              <circle cx="85" cy="85" r={ringR} fill="none" strokeWidth="10" stroke="#ede4d5" />
              <circle
                cx="85" cy="85" r={ringR} fill="none" strokeWidth="10"
                stroke="#5fad7e"
                strokeLinecap="round"
                strokeDasharray={ringC}
                strokeDashoffset={ringOffset}
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-charcoal">{Math.round(calPct)}%</span>
              <span className="text-xs text-brown-400">{calRemain} kcal left</span>
            </div>
          </div>
          <div className="mt-4 flex gap-6 text-center">
            <div>
              <p className="text-lg font-bold text-charcoal">{Math.round(totals.calories)}</p>
              <p className="text-[10px] text-brown-400 uppercase">Consumed</p>
            </div>
            <div className="w-px h-8 bg-cream-200" />
            <div>
              <p className="text-lg font-bold text-charcoal">{calGoal}</p>
              <p className="text-[10px] text-brown-400 uppercase">Goal</p>
            </div>
          </div>
        </div>

        {/* Macros + BMI */}
        <div className="card p-6 lg:col-span-2 flex flex-col gap-6">
          <div>
            <h3 className="text-sm font-semibold text-charcoal mb-4">Macro Breakdown</h3>
            <div className="space-y-4">
              <MacroBar label="Protein" value={totals.protein} goal={protGoal} color="bg-sage-500" />
              <MacroBar label="Carbs"   value={totals.carbs}   goal={carbGoal} color="bg-brown-400" />
              <MacroBar label="Fat"     value={totals.fat}     goal={fatGoal}  color="bg-sage-600" />
            </div>
          </div>

          {bmi && (
            <div className="rounded-xl bg-cream-100 p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white flex flex-col items-center justify-center">
                <span className={`text-xl font-bold ${bmiColor}`}>{bmi}</span>
                <span className="text-[9px] text-brown-400 uppercase">BMI</span>
              </div>
              <div>
                <p className={`text-sm font-semibold ${bmiColor}`}>{bmiLabel}</p>
                <p className="text-xs text-brown-400 mt-0.5">
                  {bmi < 25 ? 'Great job maintaining a healthy weight!' : 'Consider adjusting your nutrition goals'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Today's Meals */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-charcoal">Today's Meals</h3>
          <Link to="/history" className="text-xs font-medium text-sage-600 hover:text-sage-700 transition-colors">View All →</Link>
        </div>
        {meals.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-cream-100 flex items-center justify-center mx-auto mb-3">
              <FiPlus className="w-6 h-6 text-cream-300" />
            </div>
            <p className="text-sm text-brown-400">No meals logged yet today</p>
            <Link to="/log-food" className="btn-primary mt-4 text-xs px-4 py-2 inline-flex">Log your first meal</Link>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory -mx-1 px-1">
            {meals.map((m) => {
              const cfg = MEAL_TYPE_CONFIG[m.mealType] || MEAL_TYPE_CONFIG.SNACK;
              return (
                <div key={m.id} className="snap-start flex-shrink-0 w-40 p-4 rounded-xl bg-cream-50 border border-cream-200 hover:shadow-soft transition-all">
                  <div className="text-2xl mb-2">{getFoodEmoji(m.foodName)}</div>
                  <p className="text-sm font-semibold text-charcoal truncate">{m.foodName}</p>
                  <p className="text-xs text-brown-300 mt-0.5">{m.portionSize}g</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-xs">{cfg.emoji}</span>
                    <span className="text-xs text-brown-300">{cfg.label}</span>
                  </div>
                  <p className="text-sm font-bold text-sage-600 mt-1">{Math.round(m.calories)} kcal</p>
                </div>
              );
            })}
            <Link
              to="/log-food"
              className="snap-start flex-shrink-0 w-40 p-4 rounded-xl border-2 border-dashed border-cream-300 flex flex-col items-center justify-center text-brown-300 hover:text-sage-500 hover:border-sage-300 transition-all"
            >
              <FiPlus className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Add Meal</span>
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map((a) => (
          <Link key={a.to} to={a.to} className="card p-4 flex flex-col items-center gap-3 text-center hover:shadow-soft transition-shadow">
            <div className={`w-11 h-11 rounded-xl ${a.bg} flex items-center justify-center`}>
              <a.icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-brown-500">{a.label}</span>
          </Link>
        ))}
      </div>
    </Layout>
  );
}
