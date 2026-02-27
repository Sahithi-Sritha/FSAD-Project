import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import api from '../services/api';
import {
  getFoodEmoji, getCategoryEmoji, getCategoryColor,
  getCategoryLabel, MEAL_TYPE_CONFIG, CATEGORY_CONFIG,
} from '../utils/foodIcons';
import {
  FiSearch, FiPlus, FiMinus, FiCheck, FiX, FiClock
} from 'react-icons/fi';

const CATEGORIES = Object.keys(CATEGORY_CONFIG);

function getMealSuggestion() {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return 'BREAKFAST';
  if (h >= 11 && h < 15) return 'LUNCH';
  if (h >= 15 && h < 18) return 'SNACK';
  return 'DINNER';
}

export default function FoodLogging({ user, onLogout }) {
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const [query, setQuery] = useState('');
  const [foods, setFoods] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState('ALL');
  const [selected, setSelected] = useState(null);
  const [portion, setPortion] = useState(100);
  const [mealType, setMealType] = useState(getMealSuggestion());
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    api.get('/api/foods').then((r) => {
      setFoods(r.data);
      setFiltered(r.data);
    }).catch(() => {});
  }, []);

  /* Filter on query/category change */
  useEffect(() => {
    let list = foods;
    if (category !== 'ALL') list = list.filter((f) => f.category === category);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((f) => f.name.toLowerCase().includes(q));
    }
    setFiltered(list);
  }, [query, category, foods]);

  /* Calculated macros for selected food */
  const calc = selected
    ? {
        calories: ((selected.caloriesPer100g || 0) * portion) / 100,
        protein:  ((selected.proteinPer100g  || 0) * portion) / 100,
        carbs:    ((selected.carbsPer100g    || 0) * portion) / 100,
        fat:      ((selected.fatPer100g      || 0) * portion) / 100,
      }
    : null;

  const handleLog = async () => {
    if (!selected) return;
    setLogging(true);
    try {
      await api.post('/api/dietary-entries', {
        userId: user.id,
        foodItemId: selected.id,
        portionSize: portion,
        mealType,
      });
      toast.success(`${selected.name} logged!`);
      navigate('/dashboard');
    } catch {
      toast.error('Failed to log meal');
    }
    setLogging(false);
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      {/* ── Header ─────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Log Food</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Search and log what you ate</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── LEFT: Search + Grid ─────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Search */}
          <div className="relative mb-4">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search 111+ Indian foods…"
              className="input-glass pl-11 pr-4 py-3.5"
            />
          </div>

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-1 px-1 snap-x">
            {CATEGORIES.map((c) => {
              const active = category === c;
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`
                    snap-start flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold
                    transition-all duration-200
                    ${active
                      ? 'bg-brand-500 text-white shadow-glow-sm'
                      : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700'}
                  `}
                >
                  <span>{getCategoryEmoji(c)}</span>
                  {getCategoryLabel(c)}
                </button>
              );
            })}
          </div>

          {/* Food grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <p className="text-sm text-slate-400">No foods found</p>
              </div>
            ) : (
              filtered.map((food) => {
                const isSelected = selected?.id === food.id;
                return (
                  <motion.button
                    key={food.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setSelected(food); setPortion(100); }}
                    className={`
                      relative p-4 rounded-xl text-left transition-all duration-200
                      ${isSelected
                        ? 'bg-brand-500/10 dark:bg-brand-500/15 border-2 border-brand-500 shadow-glow-sm'
                        : 'glass-card hover:shadow-glass-lg border-2 border-transparent'}
                    `}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
                        <FiCheck className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className="text-2xl mb-2">{getFoodEmoji(food.name)}</div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{food.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{food.caloriesPer100g} kcal / 100g</p>
                    <div className="mt-2 flex items-center gap-1">
                      <span className="text-[10px]">{getCategoryEmoji(food.category)}</span>
                      <span className="text-[10px] text-slate-400">{getCategoryLabel(food.category)}</span>
                    </div>
                  </motion.button>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT: Confirm Panel ────────────────── */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full lg:w-80 flex-shrink-0"
            >
              <div className="glass-card p-6 lg:sticky lg:top-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Confirm Meal</h3>
                  <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-400 transition-colors">
                    <FiX className="w-4 h-4" />
                  </button>
                </div>

                {/* Food info */}
                <div className="flex items-center gap-3 mb-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-3xl">{getFoodEmoji(selected.name)}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{selected.name}</p>
                    <p className="text-xs text-slate-400">{getCategoryLabel(selected.category)}</p>
                  </div>
                </div>

                {/* Meal type */}
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                    <FiClock className="inline w-3.5 h-3.5 mr-1 -mt-0.5" /> Meal Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(MEAL_TYPE_CONFIG).map(([key, cfg]) => (
                      <button
                        key={key}
                        onClick={() => setMealType(key)}
                        className={`
                          px-3 py-2.5 rounded-xl text-xs font-semibold transition-all
                          ${mealType === key
                            ? 'bg-brand-500 text-white shadow-glow-sm'
                            : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}
                        `}
                      >
                        {cfg.emoji} {cfg.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Portion */}
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">Portion (grams)</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setPortion(Math.max(10, portion - 10))}
                      className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <FiMinus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      value={portion}
                      onChange={(e) => setPortion(Math.max(1, parseInt(e.target.value) || 0))}
                      className="flex-1 text-center input-glass text-lg font-bold"
                    />
                    <button
                      onClick={() => setPortion(portion + 10)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <FiPlus className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Quick portions */}
                  <div className="flex gap-2 mt-2">
                    {[50, 100, 150, 200, 250].map((g) => (
                      <button
                        key={g}
                        onClick={() => setPortion(g)}
                        className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-all
                          ${portion === g ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                      >
                        {g}g
                      </button>
                    ))}
                  </div>
                </div>

                {/* Macro preview */}
                {calc && (
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {[
                      { l: 'Calories', v: `${Math.round(calc.calories)} kcal`, c: 'text-orange-500' },
                      { l: 'Protein',  v: `${calc.protein.toFixed(1)}g`,  c: 'text-rose-500' },
                      { l: 'Carbs',    v: `${calc.carbs.toFixed(1)}g`,    c: 'text-blue-500' },
                      { l: 'Fat',      v: `${calc.fat.toFixed(1)}g`,      c: 'text-purple-500' },
                    ].map((m) => (
                      <div key={m.l} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                        <p className={`text-base font-bold ${m.c}`}>{m.v}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{m.l}</p>
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={handleLog} disabled={logging} className="btn-primary w-full py-3">
                  {logging ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <FiCheck className="w-4 h-4" /> Log {selected.name}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
