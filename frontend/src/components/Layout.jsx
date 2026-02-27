import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import {
  FiHome, FiPlusCircle, FiClock, FiActivity, FiMessageSquare,
  FiBarChart2, FiTarget, FiUser, FiSun, FiMoon, FiLogOut,
  FiMenu, FiX, FiChevronRight
} from 'react-icons/fi';

const NAV_SECTIONS = [
  {
    label: 'MAIN',
    items: [
      { path: '/dashboard', icon: FiHome,       name: 'Dashboard' },
      { path: '/log-food',  icon: FiPlusCircle,  name: 'Log Food' },
      { path: '/history',   icon: FiClock,       name: 'Meal History' },
    ],
  },
  {
    label: 'INSIGHTS',
    items: [
      { path: '/nutrition', icon: FiActivity,     name: 'Nutrition' },
      { path: '/ai-chat',   icon: FiMessageSquare, name: 'NutriBot AI' },
      { path: '/charts',    icon: FiBarChart2,    name: 'Charts' },
      { path: '/goals',     icon: FiTarget,       name: 'Goals' },
    ],
  },
  {
    label: 'ACCOUNT',
    items: [
      { path: '/profile',   icon: FiUser,         name: 'Profile' },
    ],
  },
];

export default function Layout({ user, onLogout, children }) {
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : 'U';

  const NavContent = ({ onNav }) => (
    <div className="flex flex-col h-full">
      {/* ── Brand ─────────────────────────── */}
      <div className="px-5 pt-7 pb-6">
        <Link to="/dashboard" onClick={onNav} className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center shadow-glow-sm">
            <span className="text-white text-sm font-black tracking-tight">DS</span>
          </div>
          <span className="text-lg font-bold text-white tracking-tight group-hover:text-brand-300 transition-colors">
            DietSphere
          </span>
        </Link>
      </div>

      {/* ── Nav Sections ──────────────────── */}
      <nav className="flex-1 px-3 space-y-6 overflow-y-auto scrollbar-thin">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-2 text-[10px] font-semibold tracking-[0.15em] text-slate-500 uppercase select-none">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onNav}
                    className={`
                      relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium
                      transition-all duration-200 group
                      ${active
                        ? 'text-brand-400 bg-brand-500/[0.12]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'}
                    `}
                  >
                    {/* Active indicator bar */}
                    {active && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-gradient-to-b from-brand-400 to-purple-400"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                    <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${active ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span>{item.name}</span>
                    {active && <FiChevronRight className="ml-auto w-3.5 h-3.5 text-brand-400/60" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Footer ────────────────────────── */}
      <div className="px-3 pb-5 pt-3 border-t border-white/[0.06] space-y-2">
        <button
          onClick={toggleDarkMode}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13px] font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] transition-all"
        >
          {darkMode ? <FiSun className="w-[18px] h-[18px]" /> : <FiMoon className="w-[18px] h-[18px]" />}
          <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button
          onClick={() => { onNav?.(); onLogout(); }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13px] font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/[0.08] transition-all"
        >
          <FiLogOut className="w-[18px] h-[18px]" />
          <span>Sign Out</span>
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-3 px-3 pt-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-glow-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.username}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Mesh background */}
      <div className="mesh-bg" />

      {/* ── Desktop Sidebar ───────────────── */}
      <aside className="hidden lg:flex flex-col w-[240px] fixed inset-y-0 left-0 z-30 glass-sidebar">
        <NavContent />
      </aside>

      {/* ── Mobile Header ─────────────────── */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 flex items-center justify-between px-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/[0.06]">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
            <span className="text-white text-[10px] font-black">DS</span>
          </div>
          <span className="text-sm font-bold text-slate-800 dark:text-white">DietSphere</span>
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors text-slate-500 dark:text-slate-400">
            {darkMode ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
          </button>
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors text-slate-700 dark:text-slate-300">
            <FiMenu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ── Mobile Drawer ─────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
              className="fixed inset-y-0 left-0 z-50 w-[260px] glass-sidebar lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-5 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                <FiX className="w-5 h-5" />
              </button>
              <NavContent onNav={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ──────────────────── */}
      <main className="flex-1 lg:ml-[240px] pt-14 lg:pt-0 min-h-screen">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
