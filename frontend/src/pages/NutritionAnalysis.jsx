import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import api from '../services/api';
import {
  FiActivity, FiZap, FiTrendingUp, FiAward,
  FiAlertCircle, FiCheckCircle, FiInfo
} from 'react-icons/fi';

const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay: i * 0.06 },
});

export default function NutritionAnalysis({ user, onLogout }) {
  const [period, setPeriod] = useState('today');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/analysis/${period}?userId=${user.id}`);
        setData(res.data);
      } catch { /* silent */ }
      setLoading(false);
    };
    load();
  }, [period, user.id]);

  const scoreColor = (s) => {
    if (s >= 80) return { text: 'text-emerald-500', bg: 'bg-emerald-500', bgLight: 'bg-emerald-500/10' };
    if (s >= 60) return { text: 'text-amber-500',   bg: 'bg-amber-500',   bgLight: 'bg-amber-500/10' };
    return { text: 'text-rose-500', bg: 'bg-rose-500', bgLight: 'bg-rose-500/10' };
  };

  const nutrientBar = (label, value, target, color) => {
    const pct = target > 0 ? Math.min((value / target) * 100, 100) : 0;
    return (
      <div key={label} className="flex items-center gap-3">
        <span className="w-24 text-xs font-medium text-slate-600 dark:text-slate-300 truncate">{label}</span>
        <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8 }}
            className={`h-full rounded-full ${color}`}
          />
        </div>
        <span className="w-20 text-right text-[11px] text-slate-400">
          {typeof value === 'number' ? value.toFixed(1) : value} / {typeof target === 'number' ? target.toFixed(0) : target}
        </span>
      </div>
    );
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Nutrition Analysis</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Deep dive into your nutrient intake
          </p>
        </div>
        <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 text-xs self-start">
          {['today', 'week'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 font-semibold capitalize transition-colors
                ${period === p
                  ? 'bg-brand-500 text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              {p === 'today' ? 'Today' : 'This Week'}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-28 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />)}
          <div className="md:col-span-3 h-64 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />
        </div>
      )}

      {!loading && data && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Calories',    value: Math.round(data.totalCalories || 0),     unit: 'kcal', icon: FiZap,        color: 'from-orange-500 to-amber-500' },
              { label: 'Total Meals', value: data.totalMeals || 0,                     unit: '',     icon: FiActivity,   color: 'from-brand-500 to-purple-500' },
              { label: 'Diet Score',  value: Math.round(data.overallScore || 0),        unit: '/100', icon: FiAward,      color: 'from-emerald-500 to-teal-500' },
              { label: 'Nutrients',   value: data.nutrientAnalyses?.length || 0,        unit: 'tracked', icon: FiTrendingUp, color: 'from-rose-500 to-pink-500' },
            ].map((s, i) => (
              <motion.div key={s.label} {...fadeUp(i)} className="glass-card p-5">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow-lg`}>
                  <s.icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {s.value}<span className="text-xs font-normal text-slate-400 ml-1">{s.unit}</span>
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Overall Score Banner */}
          <motion.div {...fadeUp(4)} className="glass-card p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl ${scoreColor(data.overallScore || 0).bgLight} flex items-center justify-center flex-shrink-0`}>
                <span className={`text-2xl font-bold ${scoreColor(data.overallScore || 0).text}`}>
                  {Math.round(data.overallScore || 0)}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Overall Diet Quality Score</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {data.overallScore >= 80
                    ? 'Excellent! Your diet is well-balanced.'
                    : data.overallScore >= 60
                    ? 'Good progress! A few areas could improve.'
                    : 'Consider adding more variety to your diet.'}
                </p>
              </div>
              <div className="sm:ml-auto flex-shrink-0">
                <div className="w-32 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(data.overallScore || 0, 100)}%` }}
                    transition={{ duration: 1 }}
                    className={`h-full rounded-full ${scoreColor(data.overallScore || 0).bg}`}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Macronutrients */}
          {data.nutrientAnalyses && data.nutrientAnalyses.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Macros */}
              <motion.div {...fadeUp(5)} className="glass-card p-6">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Macronutrients</h3>
                <div className="space-y-3">
                  {data.nutrientAnalyses
                    .filter((n) => ['PROTEIN', 'CARBOHYDRATES', 'FAT', 'FIBER'].includes(n.nutrientName?.toUpperCase()))
                    .map((n) => {
                      const colors = {
                        PROTEIN: 'bg-rose-500',
                        CARBOHYDRATES: 'bg-blue-500',
                        FAT: 'bg-purple-500',
                        FIBER: 'bg-emerald-500',
                      };
                      return nutrientBar(
                        n.nutrientName,
                        n.currentIntake || 0,
                        n.recommendedIntake || 100,
                        colors[n.nutrientName?.toUpperCase()] || 'bg-brand-500',
                      );
                    })}
                </div>
              </motion.div>

              {/* Micros */}
              <motion.div {...fadeUp(6)} className="glass-card p-6">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Vitamins & Minerals</h3>
                <div className="space-y-3">
                  {data.nutrientAnalyses
                    .filter((n) => !['PROTEIN', 'CARBOHYDRATES', 'FAT', 'FIBER', 'CALORIES'].includes(n.nutrientName?.toUpperCase()))
                    .slice(0, 8)
                    .map((n) => nutrientBar(n.nutrientName, n.currentIntake || 0, n.recommendedIntake || 100, 'bg-brand-500'))}
                </div>
              </motion.div>
            </div>
          )}

          {/* Recommendations */}
          {data.recommendations && data.recommendations.length > 0 && (
            <motion.div {...fadeUp(7)} className="glass-card p-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Recommendations</h3>
              <div className="space-y-3">
                {data.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div className="mt-0.5">
                      {rec.type === 'WARNING' ? (
                        <FiAlertCircle className="w-4 h-4 text-amber-500" />
                      ) : rec.type === 'SUCCESS' ? (
                        <FiCheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <FiInfo className="w-4 h-4 text-brand-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-slate-700 dark:text-slate-200">{rec.message || rec}</p>
                      {rec.detail && <p className="text-xs text-slate-400 mt-0.5">{rec.detail}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}

      {!loading && !data && (
        <div className="text-center py-20">
          <FiActivity className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No analysis data available. Log some meals first!</p>
        </div>
      )}
    </Layout>
  );
}
