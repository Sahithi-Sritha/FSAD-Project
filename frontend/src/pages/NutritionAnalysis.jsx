import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import {
  FiActivity, FiZap, FiTrendingUp, FiAward,
  FiAlertCircle, FiCheckCircle, FiInfo
} from 'react-icons/fi';

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
    if (s >= 80) return { text: 'text-sage-600', bg: 'bg-sage-500', bgLight: 'bg-sage-50' };
    if (s >= 60) return { text: 'text-amber-500', bg: 'bg-amber-500', bgLight: 'bg-amber-50' };
    return { text: 'text-red-500', bg: 'bg-red-500', bgLight: 'bg-red-50' };
  };

  const nutrientBar = (label, value, target, unit, color) => {
    const pct = target > 0 ? Math.min((value / target) * 100, 100) : 0;
    return (
      <div key={label} className="flex items-center gap-3">
        <span className="w-24 text-xs font-medium text-brown-500 truncate">{label}</span>
        <div className="flex-1 h-2 rounded-full bg-cream-200 overflow-hidden">
          <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
        </div>
        <span className="w-20 text-right text-[11px] text-brown-400">
          {typeof value === 'number' ? value.toFixed(1) : value}{unit ? ` ${unit}` : ''}
          {' / '}
          {typeof target === 'number' ? target.toFixed(0) : target}{unit ? ` ${unit}` : ''}
        </span>
      </div>
    );
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Nutrition Analysis</h1>
          <p className="text-sm text-brown-400 mt-1">Deep dive into your nutrient intake</p>
        </div>
        <div className="flex rounded-xl overflow-hidden border border-cream-300 text-xs self-start">
          {['today', 'week'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 font-semibold capitalize transition-colors
                ${period === p ? 'bg-sage-500 text-white' : 'text-brown-400 hover:bg-cream-100'}`}
            >
              {p === 'today' ? 'Today' : 'This Week'}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
          {[1,2,3].map((i) => <div key={i} className="h-28 rounded-2xl bg-cream-200" />)}
          <div className="md:col-span-3 h-64 rounded-2xl bg-cream-200" />
        </div>
      )}

      {!loading && data && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Calories',    value: Math.round(data.totalCalories || 0),     unit: 'kcal', icon: FiZap,        bg: 'bg-sage-50',  accent: 'text-sage-600' },
              { label: 'Total Meals', value: data.mealCount || 0,                       unit: '',     icon: FiActivity,   bg: 'bg-cream-100', accent: 'text-brown-500' },
              { label: 'Diet Score',  value: Math.round(data.overallScore || 0),        unit: '/100', icon: FiAward,      bg: 'bg-sage-50',  accent: 'text-sage-600' },
              { label: 'Nutrients',   value: (data.macronutrients?.length || 0) + (data.micronutrients?.length || 0), unit: 'tracked', icon: FiTrendingUp, bg: 'bg-cream-100', accent: 'text-brown-500' },
            ].map((s) => (
              <div key={s.label} className="card p-5">
                <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                  <s.icon className={`w-4 h-4 ${s.accent}`} />
                </div>
                <p className="text-2xl font-bold text-charcoal">
                  {s.value}<span className="text-xs font-normal text-brown-300 ml-1">{s.unit}</span>
                </p>
                <p className="text-xs text-brown-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Overall Score Banner */}
          <div className="card p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl ${scoreColor(data.overallScore || 0).bgLight} flex items-center justify-center flex-shrink-0`}>
                <span className={`text-2xl font-bold ${scoreColor(data.overallScore || 0).text}`}>
                  {Math.round(data.overallScore || 0)}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-charcoal">Overall Diet Quality Score</h3>
                <p className="text-xs text-brown-400 mt-0.5">
                  {data.overallScore >= 80
                    ? 'Excellent! Your diet is well-balanced.'
                    : data.overallScore >= 60
                    ? 'Good progress! A few areas could improve.'
                    : 'Consider adding more variety to your diet.'}
                </p>
              </div>
              <div className="sm:ml-auto flex-shrink-0">
                <div className="w-32 h-2.5 rounded-full bg-cream-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${scoreColor(data.overallScore || 0).bg} transition-all duration-700`}
                    style={{ width: `${Math.min(data.overallScore || 0, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Macronutrients + Micronutrients */}
          {data.macronutrients && data.macronutrients.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="card p-6">
                <h3 className="text-sm font-semibold text-charcoal mb-4">Macronutrients</h3>
                <div className="space-y-3">
                  {data.macronutrients.map((n) => {
                    const colors = {
                      PROTEIN: 'bg-sage-500',
                      CARBOHYDRATES: 'bg-brown-400',
                      FAT: 'bg-sage-600',
                      FIBER: 'bg-brown-300',
                    };
                    return nutrientBar(
                      n.name,
                      n.consumed || 0,
                      n.recommended || 100,
                      n.unit,
                      colors[n.name?.toUpperCase()] || 'bg-sage-500',
                    );
                  })}
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-sm font-semibold text-charcoal mb-4">Vitamins & Minerals</h3>
                <div className="space-y-3">
                  {(data.micronutrients || []).slice(0, 8)
                    .map((n) => nutrientBar(n.name, n.consumed || 0, n.recommended || 100, n.unit, 'bg-sage-500'))}
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {data.recommendations && data.recommendations.length > 0 && (
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-charcoal mb-4">Recommendations</h3>
              <div className="space-y-3">
                {data.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-cream-50">
                    <div className="mt-0.5">
                      {rec.priority === 'HIGH' ? (
                        <FiAlertCircle className="w-4 h-4 text-amber-500" />
                      ) : rec.priority === 'LOW' ? (
                        <FiCheckCircle className="w-4 h-4 text-sage-500" />
                      ) : (
                        <FiInfo className="w-4 h-4 text-brown-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-charcoal">{rec.message || rec}</p>
                      {rec.foods?.length > 0 && (
                        <p className="text-xs text-brown-400 mt-0.5">Try: {rec.foods.join(', ')}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!loading && !data && (
        <div className="text-center py-20">
          <FiActivity className="w-8 h-8 text-cream-300 mx-auto mb-3" />
          <p className="text-sm text-brown-400">No analysis data available. Log some meals first!</p>
        </div>
      )}
    </Layout>
  );
}
