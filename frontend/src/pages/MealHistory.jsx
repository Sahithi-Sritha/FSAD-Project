import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import Layout from '../components/Layout'

function MealHistory({ user, onLogout }) {
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMealHistory()
  }, [])

  const fetchMealHistory = async () => {
    try {
      const response = await api.get(`/api/entries?userId=${user.userId}`)
      setMeals(response.data)
    } catch (err) {
      console.error('Error fetching meal history:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this meal entry?')) return
    try {
      await api.delete(`/api/entries/${entryId}?userId=${user.userId}`)
      setMeals(meals.filter(m => m.id !== entryId))
    } catch (err) {
      console.error('Error deleting entry:', err)
      alert('Failed to delete meal entry')
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Group meals by date
  const groupedMeals = meals.reduce((groups, meal) => {
    const date = meal.consumedAt?.substring(0, 10) || 'Unknown'
    if (!groups[date]) groups[date] = []
    groups[date].push(meal)
    return groups
  }, {})

  return (
    <Layout user={user} onLogout={onLogout}>
      <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem' }}>
        ← Back to Dashboard
      </Link>

      <div className="page-header">
        <h1>Meal History</h1>
        <p>View all your logged meals</p>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">All Meals</div>
            <div className="card-subtitle">{meals.length} meal{meals.length !== 1 ? 's' : ''} logged</div>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading your meal history...</div>
        ) : meals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p>No meals logged yet</p>
            <Link to="/log-food">
              <button className="btn btn-primary">Log Your First Meal</button>
            </Link>
          </div>
        ) : (
          Object.entries(groupedMeals).map(([date, dateMeals]) => (
            <div key={date} className="date-section">
              <div className="date-section-title">
                {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="meal-list">
                {dateMeals.map((meal) => {
                  const mealType = (meal.mealType || '').toLowerCase()
                  const kcal = Math.round((meal.foodItem?.nutrientProfile?.calories || 0) * meal.portionSize)
                  const np = meal.foodItem?.nutrientProfile
                  return (
                    <div key={meal.id} className="meal-item">
                      <div className="meal-left">
                        <div className={`meal-color-dot ${mealType}`} />
                        <div>
                          <div className="meal-name">{meal.foodItem?.name}</div>
                          <div className="meal-meta">
                            <span className={`meal-badge ${mealType}`}>{meal.mealType}</span>
                            <span>{meal.portionSize} serving{meal.portionSize !== 1 ? 's' : ''}</span>
                            {np && (
                              <span>
                                P: {(np.protein * meal.portionSize).toFixed(1)}g · 
                                C: {(np.carbohydrates * meal.portionSize).toFixed(1)}g · 
                                F: {(np.fat * meal.portionSize).toFixed(1)}g
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="meal-right">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="meal-calories">{kcal} kcal</span>
                          <button 
                            onClick={() => handleDelete(meal.id)} 
                            className="btn-delete"
                            title="Delete entry"
                          >
                            ✕
                          </button>
                        </div>
                        <span className="meal-time">{formatTime(meal.consumedAt)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  )
}

export default MealHistory
