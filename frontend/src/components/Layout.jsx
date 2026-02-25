import { Link, useLocation } from 'react-router-dom'

function Layout({ user, onLogout, children }) {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const navItems = [
    { path: '/dashboard', icon: '◫', label: 'Dashboard' },
    { path: '/log-food',  icon: '✎', label: 'Log Food' },
    { path: '/history',   icon: '☰', label: 'Meal History' },
    { path: '/nutrition', icon: '◔', label: 'Nutrition' },
    { path: '/profile',   icon: '⚙', label: 'Profile' },
  ]

  const initials = user?.username ? user.username.substring(0, 2) : '??'

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">🌿</div>
          <div className="sidebar-brand-text">
            <h2>Diet Balance</h2>
            <span>Tracker</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ path, icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`sidebar-link ${isActive(path) ? 'active' : ''}`}
            >
              <span className="sidebar-link-icon">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.username}</div>
              <div className="sidebar-user-role">Member</div>
            </div>
          </div>
          <button onClick={onLogout} className="sidebar-logout">
            <span className="sidebar-link-icon">↪</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

export default Layout
