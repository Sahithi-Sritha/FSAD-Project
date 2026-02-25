import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import Layout from '../components/Layout'

function Dashboard({ user, onLogout }) {
  const [todaysMeals, setTodaysMeals] = useState([])
  const [totalCalories, setTotalCalories] = useState(0)
  const [macros, setMacros] = useState({ protein: 0, carbs: 0, fat: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTodaysMeals()
  }, [])

  const fetchTodaysMeals = async () => {
    try {
      const response = await api.get(`/api/entries/today?userId=${user.userId}`)
      setTodaysMeals(response.data)
      
      let cals = 0, protein = 0, carbs = 0, fat = 0
      response.data.forEach(entry => {
        const p = entry.portionSize || 1
        const np = entry.foodItem?.nutrientProfile
        if (np) {
          cals += (np.calories || 0) * p
          protein += (np.protein || 0) * p
          carbs += (np.carbohydrates || 0) * p
          fat += (np.fat || 0) * p
        }
      })
      setTotalCalories(Math.round(cals))
      setMacros({ protein: Math.round(protein), carbs: Math.round(carbs), fat: Math.round(fat) })
    } catch (err) {
      console.error('Error fetching meals:', err)
    } finally {
      setLoading(false)
    }
  }

  const calorieGoal = 2000
  const proteinGoal = 150
  const carbsGoal = 250
  const fatGoal = 65
  const caloriePercent = Math.min(Math.round((totalCalories / calorieGoal) * 100), 100)

  // SVG ring calculations
  const radius = 65
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (caloriePercent / 100) * circumference

  const getRingColor = (pct) => {
    if (pct >= 90) return '#059669'
    if (pct >= 50) return '#0f766e'
    return '#14b8a6'
  }

  const getBarColor = (current, goal) => {
    const pct = (current / goal) * 100
    if (pct >= 90) return '#059669'
    if (pct >= 50) return '#0f766e'
    return '#14b8a6'
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Track your daily nutrition intake</p>
      </div>

      {/* Stat cards row */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-card-row">
            <div>
              <div className="stat-label">Calories</div>
              <div className="stat-value">{totalCalories}</div>
              <div className="stat-meta">of {calorieGoal} kcal</div>
            </div>
            <div className="stat-icon teal">🔥</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-row">
            <div>
              <div className="stat-label">Protein</div>
              <div className="stat-value">{macros.protein}g</div>
              <div className="stat-meta">of {proteinGoal}g</div>
            </div>
            <div className="stat-icon green">🥩</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-row">
            <div>
              <div className="stat-label">Carbs</div>
              <div className="stat-value">{macros.carbs}g</div>
              <div className="stat-meta">of {carbsGoal}g</div>
            </div>
            <div className="stat-icon amber">🌾</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-row">
            <div>
              <div className="stat-label">Fats</div>
              <div className="stat-value">{macros.fat}g</div>
              <div className="stat-meta">of {fatGoal}g</div>
            </div>
            <div className="stat-icon blue">💧</div>
          </div>
        </div>
      </div>

      {/* Two-column: Macros progress + Calorie ring */}
      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Daily Macros Progress</div>
              <div className="card-subtitle">Your nutrient intake for today</div>
            </div>
          </div>
          <div className="macro-list">
            {[
              { name: 'Protein', value: macros.protein, goal: proteinGoal },
              { name: 'Carbs', value: macros.carbs, goal: carbsGoal },
              { name: 'Fats', value: macros.fat, goal: fatGoal },
            ].map(({ name, value, goal }) => (
              <div key={name} className="macro-item">
                <div className="macro-item-header">
                  <span className="macro-item-name">{name}</span>
                  <span className="macro-item-value">{value}g / {goal}g</span>
                </div>
                <div className="progress-bar-track">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${Math.min((value / goal) * 100, 100)}%`,
                      backgroundColor: getBarColor(value, goal),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Calorie Progress</div>
              <div className="card-subtitle">Track your daily calorie goal</div>
            </div>
          </div>
          <div className="calorie-ring-wrapper">
            <div className="calorie-ring">
              <svg viewBox="0 0 160 160">
                <circle className="calorie-ring-bg" cx="80" cy="80" r={radius} />
                <circle
                  className="calorie-ring-fill"
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke={getRingColor(caloriePercent)}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <div className="calorie-ring-text">
                <div className="calorie-ring-percent">{caloriePercent}%</div>
                <div className="calorie-ring-label">of goal</div>
              </div>
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              {calorieGoal - totalCalories > 0
                ? `${calorieGoal - totalCalories} calories remaining`
                : 'Goal reached!'
              }
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Link to="/log-food">
              <button className="btn btn-primary">+ Add Meal</button>
            </Link>
          </div>
        </div>
      </div>

      {/* Today's meals */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Today's Meals</div>
            <div className="card-subtitle">{todaysMeals.length} meal{todaysMeals.length !== 1 ? 's' : ''} logged</div>
          </div>
          <Link to="/nutrition">
            <button className="btn btn-outline btn-sm">View Analysis →</button>
          </Link>
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : todaysMeals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🍽️</div>
            <p>No meals logged today. Start tracking your nutrition!</p>
            <Link to="/log-food">
              <button className="btn btn-primary">Log Your First Meal</button>
            </Link>
          </div>
        ) : (
          <div className="meal-list">
            {todaysMeals.map((meal) => {
              const mealType = (meal.mealType || '').toLowerCase()
              const kcal = Math.round((meal.foodItem?.nutrientProfile?.calories || 0) * meal.portionSize)
              return (
                <div key={meal.id} className="meal-item">
                  <div className="meal-left">
                    <div className={`meal-color-dot ${mealType}`} />
                    <div>
                      <div className="meal-name">{meal.foodItem?.name}</div>
                      <div className="meal-meta">
                        <span className={`meal-badge ${mealType}`}>{meal.mealType}</span>
                        <span>{meal.portionSize} serving{meal.portionSize !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  <div className="meal-right">
                    <span className="meal-calories">{kcal} kcal</span>
                    <span className="meal-time">
                      {new Date(meal.consumedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Dashboard
