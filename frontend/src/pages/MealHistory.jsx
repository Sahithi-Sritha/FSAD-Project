import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import api from '../services/api';
import { getFoodEmoji, MEAL_TYPE_CONFIG } from '../utils/foodIcons';
import { FiTrash2, FiCalendar, FiFilter, FiChevronDown } from 'react-icons/fi';

const MEAL_FILTERS = ['ALL', 'BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];

export default function MealHistory({ user, onLogout }) {
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    try {
      const res = await api.get(`/api/dietary-entries/user/${user.id}`);
      setEntries(res.data);
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, [user.id]);

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await api.delete(`/api/dietary-entries/${id}`);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast.success('Entry deleted');
    } catch {
      toast.error('Failed to delete');
    }
    setDeleting(null);
  };

  /* Group by date */
  const filtered = filter === 'ALL' ? entries : entries.filter((e) => e.mealType === filter);
  const grouped = filtered.reduce((acc, e) => {
    const d = new Date(e.entryDate).toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'short', day: 'numeric',
    });
    if (!acc[d]) acc[d] = [];
    acc[d].push(e);
    return acc;
  }, {});

  const dateKeys = Object.keys(grouped);

  return (
    <Layout user={user} onLogout={onLogout}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Meal History</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{entries.length} entries total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
        {MEAL_FILTERS.map((f) => {
          const active = filter === f;
          const cfg = MEAL_TYPE_CONFIG[f];
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all
                ${active
                  ? 'bg-brand-500 text-white shadow-glow-sm'
                  : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-brand-300'}
              `}
            >
              {f === 'ALL' ? <FiFilter className="w-3.5 h-3.5" /> : <span>{cfg?.emoji}</span>}
              {f === 'ALL' ? 'All' : cfg?.label || f}
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
            <FiCalendar className="w-6 h-6 text-slate-300 dark:text-slate-600" />
          </div>
          <p className="text-sm text-slate-400">No meal entries found</p>
        </div>
      )}

      {/* Grouped timeline */}
      {!loading && dateKeys.map((date) => {
        const dayEntries = grouped[date];
        const dayCals = dayEntries.reduce((s, e) => s + (e.calories || 0), 0);
        return (
          <motion.div
            key={date}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            {/* Date header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-brand-500" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{date}</h3>
              <span className="text-xs text-slate-400 ml-auto">{Math.round(dayCals)} kcal</span>
            </div>

            <div className="space-y-2 pl-4 border-l-2 border-slate-100 dark:border-slate-800 ml-1">
              <AnimatePresence>
                {dayEntries.map((entry) => {
                  const cfg = MEAL_TYPE_CONFIG[entry.mealType] || MEAL_TYPE_CONFIG.SNACK;
                  return (
                    <motion.div
                      key={entry.id}
                      layout
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      className="glass-card p-4 flex items-center gap-4"
                    >
                      <div className="text-2xl flex-shrink-0">{getFoodEmoji(entry.foodName)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{entry.foodName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-400">{entry.portionSize}g</span>
                          <span className="text-xs text-slate-300 dark:text-slate-600">·</span>
                          <span className="text-xs text-slate-400">{cfg.emoji} {cfg.label}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-brand-600 dark:text-brand-400">{Math.round(entry.calories)} kcal</p>
                        <div className="flex gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>P:{Math.round(entry.protein || 0)}g</span>
                          <span>C:{Math.round(entry.carbs || 0)}g</span>
                          <span>F:{Math.round(entry.fat || 0)}g</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        disabled={deleting === entry.id}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all flex-shrink-0"
                      >
                        {deleting === entry.id ? (
                          <div className="w-4 h-4 border-2 border-rose-300 border-t-rose-500 rounded-full animate-spin" />
                        ) : (
                          <FiTrash2 className="w-4 h-4" />
                        )}
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}
    </Layout>
  );
}
