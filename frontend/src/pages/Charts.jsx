import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import api from '../services/api';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { FiBarChart2, FiTrendingUp } from 'react-icons/fi';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f43f5e', '#8b5cf6'];
const PERIODS = [
  { value: 7,  label: '7 Days' },
  { value: 14, label: '14 Days' },
  { value: 30, label: '30 Days' },
];

const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay: i * 0.06 },
});

const ChartCard = ({ title, children, delay = 0 }) => (
  <motion.div {...fadeUp(delay)} className="glass-card p-5">
    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">{title}</h3>
    <div className="h-64">{children}</div>
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-xl border border-white/30 dark:border-white/[0.06] shadow-glass-lg p-3 text-xs">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500 dark:text-slate-400">{p.name}:</span>
          <span className="font-medium text-slate-700 dark:text-slate-200">{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function Charts({ user, onLogout }) {
  const [days, setDays] = useState(7);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/charts?userId=${user.id}&days=${days}`);
        setData(res.data);
      } catch { /* silent */ }
      setLoading(false);
    };
    load();
  }, [days, user.id]);

  /* Derived data */
  const dailyData = data?.dailyData || [];
  const macroTotal = data?.macroTotals || {};
  const mealTypeDist = data?.mealTypeDistribution || {};
  const topFoods = data?.topFoods || [];
  const nutrientRadar = data?.nutrientRadar || [];

  const macroPieData = [
    { name: 'Protein', value: macroTotal.protein || 0 },
    { name: 'Carbs',   value: macroTotal.carbs   || 0 },
    { name: 'Fat',     value: macroTotal.fat     || 0 },
  ].filter((d) => d.value > 0);

  const mealTypePieData = Object.entries(mealTypeDist).map(([name, value]) => ({ name, value }));

  return (
    <Layout user={user} onLogout={onLogout}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Charts & Analytics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Visual insights into your nutrition data
          </p>
        </div>
        <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 text-xs self-start">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setDays(p.value)}
              className={`px-4 py-2 font-semibold transition-colors
                ${days === p.value
                  ? 'bg-brand-500 text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="h-80 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />)}
        </div>
      )}

      {!loading && data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 1: Calorie Trend */}
          <ChartCard title="Calorie Trend" delay={0}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f033" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="calories" name="Calories" stroke="#6366f1" strokeWidth={2.5} fill="url(#calGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 2: Macro Stacked Bar */}
          <ChartCard title="Macro Distribution (Daily)" delay={1}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f033" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="protein" name="Protein" stackId="a" fill="#ec4899" radius={[0, 0, 0, 0]} />
                <Bar dataKey="carbs"   name="Carbs"   stackId="a" fill="#06b6d4" />
                <Bar dataKey="fat"     name="Fat"     stackId="a" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 3: Macro Pie */}
          <ChartCard title="Macro Split (Total)" delay={2}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={macroPieData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {macroPieData.map((_, i) => (
                    <Cell key={i} fill={['#ec4899', '#06b6d4', '#a855f7'][i]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 4: Meal Type Pie */}
          <ChartCard title="Meal Type Breakdown" delay={3}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mealTypePieData}
                  cx="50%" cy="50%"
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {mealTypePieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 5: Nutrient Radar */}
          {nutrientRadar.length > 0 && (
            <ChartCard title="Nutrient Balance" delay={4}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={nutrientRadar}>
                  <PolarGrid stroke="#e2e8f033" />
                  <PolarAngleAxis dataKey="nutrient" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <PolarRadiusAxis tick={{ fontSize: 9 }} stroke="#94a3b8" />
                  <Radar name="Intake" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {/* 6: Top Foods */}
          {topFoods.length > 0 && (
            <ChartCard title="Most Logged Foods" delay={5}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topFoods.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f033" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Times Logged" fill="#6366f1" radius={[0, 6, 6, 0]}>
                    {topFoods.slice(0, 8).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </div>
      )}

      {!loading && !data && (
        <div className="text-center py-20">
          <FiBarChart2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No chart data available. Log some meals first!</p>
        </div>
      )}
    </Layout>
  );
}
