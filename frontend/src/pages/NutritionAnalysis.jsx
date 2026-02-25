import { useState, useEffect } from 'react'
import api from '../services/api'
import Layout from '../components/Layout'

function NutritionAnalysis({ user, onLogout }) {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('today')

  useEffect(() => {
    fetchAnalysis()
  }, [period])

  const fetchAnalysis = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/api/analysis/${period}?userId=${user.userId}`)
      setAnalysis(response.data)
    } catch (err) {
      console.error('Error fetching analysis:', err)
    } finally {
      setLoading(false)
    }
  }

  const getNutrientColor = (percentage) => {
    if (percentage >= 80) return 'var(--color-success)'
    if (percentage >= 50) return 'var(--color-warning)'
    return 'var(--color-danger)'
  }

  const getNutrientStatus = (percentage) => {
    if (percentage >= 100) return 'Sufficient'
    if (percentage >= 80) return 'Adequate'
    if (percentage >= 50) return 'Low'
    return 'Deficient'
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Nutrition Analysis</h1>
          <p>Detailed breakdown of your nutrient intake</p>
        </div>
        <div className="period-selector">
          {['today', 'week'].map(p => (
            <button
              key={p}
              className={`period-btn ${period === p ? 'active' : ''}`}
              onClick={() => setPeriod(p)}
            >
              {p === 'today' ? 'Today' : 'This Week'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading analysis...</div>
      ) : !analysis ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <p>No meals logged for this period. Start logging meals to see your nutrition analysis!</p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary stat cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-row">
                <div>
                  <div className="stat-label">Total Calories</div>
                  <div className="stat-value">{Math.round(analysis.totalCalories)}</div>
                  <div className="stat-meta">kcal</div>
                </div>
                <div className="stat-icon teal">🔥</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-row">
                <div>
                  <div className="stat-label">Meals Logged</div>
                  <div className="stat-value">{analysis.mealCount}</div>
                  <div className="stat-meta">{period === 'today' ? 'today' : 'this week'}</div>
                </div>
                <div className="stat-icon green">🍽️</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-row">
                <div>
                  <div className="stat-label">Nutrient Score</div>
                  <div className="stat-value" style={{ color: getNutrientColor(analysis.overallScore) }}>
                    {Math.round(analysis.overallScore)}%
                  </div>
                  <div className="stat-meta">of daily needs</div>
                </div>
                <div className="stat-icon amber">⚡</div>
              </div>
            </div>
          </div>

          {/* Macronutrients */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Macronutrients</div>
                <div className="card-subtitle">Protein, carbs, and fat breakdown</div>
              </div>
            </div>
            <div className="nutrient-grid">
              {analysis.macronutrients && analysis.macronutrients.map(nutrient => (
                <div key={nutrient.name} className="nutrient-bar-item">
                  <div className="nutrient-bar-header">
                    <span className="nutrient-bar-name">{nutrient.name}</span>
                    <span className="nutrient-bar-value">
                      {nutrient.consumed.toFixed(1)}g / {nutrient.recommended.toFixed(0)}g
                    </span>
                  </div>
                  <div className="nutrient-bar-track">
                    <div
                      className="nutrient-bar-fill"
                      style={{
                        width: `${Math.min(nutrient.percentage, 100)}%`,
                        backgroundColor: getNutrientColor(nutrient.percentage)
                      }}
                    />
                  </div>
                  <div className="nutrient-bar-footer">
                    <span style={{ color: getNutrientColor(nutrient.percentage), fontWeight: 500 }}>
                      {getNutrientStatus(nutrient.percentage)}
                    </span>
                    <span style={{ color: 'var(--color-text-muted)' }}>{Math.round(nutrient.percentage)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vitamins & Minerals */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Vitamins & Minerals</div>
                <div className="card-subtitle">Micronutrient levels</div>
              </div>
            </div>
            <div className="nutrient-grid">
              {analysis.micronutrients && analysis.micronutrients.map(nutrient => (
                <div key={nutrient.name} className="nutrient-bar-item">
                  <div className="nutrient-bar-header">
                    <span className="nutrient-bar-name">{nutrient.name}</span>
                    <span className="nutrient-bar-value">
                      {nutrient.consumed.toFixed(1)}{nutrient.unit} / {nutrient.recommended.toFixed(0)}{nutrient.unit}
                    </span>
                  </div>
                  <div className="nutrient-bar-track">
                    <div
                      className="nutrient-bar-fill"
                      style={{
                        width: `${Math.min(nutrient.percentage, 100)}%`,
                        backgroundColor: getNutrientColor(nutrient.percentage)
                      }}
                    />
                  </div>
                  <div className="nutrient-bar-footer">
                    <span style={{ color: getNutrientColor(nutrient.percentage), fontWeight: 500 }}>
                      {getNutrientStatus(nutrient.percentage)}
                    </span>
                    <span style={{ color: 'var(--color-text-muted)' }}>{Math.round(nutrient.percentage)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Recommendations</div>
                  <div className="card-subtitle">Personalised suggestions to improve your diet</div>
                </div>
              </div>
              <div className="recommendations-list">
                {analysis.recommendations.map((rec, index) => (
                  <div key={index} className="recommendation-item">
                    <div className={`rec-priority ${rec.priority === 'HIGH' ? 'high' : rec.priority === 'MEDIUM' ? 'medium' : 'low'}`} />
                    <div className="rec-content">
                      <strong>{rec.nutrient}</strong>
                      <p>{rec.message}</p>
                      {rec.foods && rec.foods.length > 0 && (
                        <p className="rec-foods">
                          Try: {rec.foods.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  )
}

export default NutritionAnalysis
