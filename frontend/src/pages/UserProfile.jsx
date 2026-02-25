import { useState, useEffect } from 'react'
import api from '../services/api'
import Layout from '../components/Layout'

function UserProfile({ user, onLogout, onUpdateUser }) {
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({ age: '', email: '' })
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetchProfile()
    fetchStats()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await api.get(`/api/auth/profile?userId=${user.userId}`)
      setProfile(response.data)
      setFormData({ age: response.data.age, email: response.data.email })
    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get(`/api/entries?userId=${user.userId}`)
      const meals = response.data
      const uniqueDays = new Set(meals.map(m => m.consumedAt?.substring(0, 10)))
      setStats({
        totalMeals: meals.length,
        activeDays: uniqueDays.size,
        avgMealsPerDay: uniqueDays.size > 0 ? (meals.length / uniqueDays.size).toFixed(1) : 0
      })
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      const response = await api.put(`/api/auth/profile?userId=${user.userId}`, formData)
      setProfile(response.data)
      setEditing(false)
      setSuccess('Profile updated successfully!')
      const storedUser = JSON.parse(localStorage.getItem('user'))
      storedUser.email = response.data.email
      localStorage.setItem('user', JSON.stringify(storedUser))
      if (onUpdateUser) onUpdateUser(storedUser)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile')
    }
  }

  if (loading) return <Layout user={user} onLogout={onLogout}><div className="loading">Loading profile...</div></Layout>

  const initials = profile?.username ? profile.username.charAt(0).toUpperCase() : '?'

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your account information and view activity</p>
      </div>

      {success && <div className="success">{success}</div>}
      {error && <div className="error">{error}</div>}

      {/* Profile banner */}
      <div className="card" style={{ textAlign: 'center', paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'var(--color-primary)', color: '#fff',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem'
        }}>
          {initials}
        </div>
        <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-text)' }}>{profile?.username}</h2>
        <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{profile?.email}</p>
        <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
          Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
          }) : 'N/A'}
        </p>
      </div>

      <div className="profile-grid">
        {/* Stats Row */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Activity Summary</div>
              <div className="card-subtitle">Your tracking history at a glance</div>
            </div>
          </div>
          <div className="profile-stats">
            <div className="profile-stat-item">
              <div className="profile-stat-value" style={{ color: 'var(--color-primary)' }}>
                {stats?.totalMeals || 0}
              </div>
              <div className="profile-stat-label">Total Meals</div>
            </div>
            <div className="profile-stat-item">
              <div className="profile-stat-value" style={{ color: 'var(--color-success)' }}>
                {stats?.activeDays || 0}
              </div>
              <div className="profile-stat-label">Active Days</div>
            </div>
            <div className="profile-stat-item">
              <div className="profile-stat-value" style={{ color: 'var(--color-warning)' }}>
                {stats?.avgMealsPerDay || 0}
              </div>
              <div className="profile-stat-label">Avg Meals/Day</div>
            </div>
          </div>
        </div>

        {/* Account Info Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Account Information</div>
              <div className="card-subtitle">View and edit your details</div>
            </div>
            {!editing && (
              <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>
                Edit
              </button>
            )}
          </div>

          {!editing ? (
            <div className="profile-info">
              <div className="profile-field">
                <span className="profile-label">Username</span>
                <span className="profile-value">{profile?.username}</span>
              </div>
              <div className="profile-field">
                <span className="profile-label">Email</span>
                <span className="profile-value">{profile?.email}</span>
              </div>
              <div className="profile-field">
                <span className="profile-label">Age</span>
                <span className="profile-value">{profile?.age} years</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label>Username</label>
                <input type="text" value={profile?.username} disabled />
                <small style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Username cannot be changed</small>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default UserProfile
