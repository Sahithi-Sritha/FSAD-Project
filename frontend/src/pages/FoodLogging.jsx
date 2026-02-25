import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import Layout from '../components/Layout'

function FoodLogging({ user, onLogout }) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [foods, setFoods] = useState([])
  const [selectedFood, setSelectedFood] = useState(null)
  const [portionSize, setPortionSize] = useState(1)
  const [mealType, setMealType] = useState('BREAKFAST')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    searchFoods('')
  }, [])

  const searchFoods = async (query) => {
    try {
      const response = await api.get(`/api/foods/search?query=${query}`)
      setFoods(response.data)
    } catch (err) {
      console.error('Error searching foods:', err)
    }
  }

  const handleSearch = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    searchFoods(query)
  }

  const handleSelectFood = (food) => {
    setSelectedFood(food)
  }

  const handleLogMeal = async () => {
    if (!selectedFood) return

    setLoading(true)
    try {
      await api.post(`/api/entries?userId=${user.userId}`, {
        foodItemId: selectedFood.id,
        portionSize: parseFloat(portionSize),
        mealType: mealType
      })
      
      setSuccess(true)
      setTimeout(() => {
        navigate('/dashboard')
      }, 1500)
    } catch (err) {
      console.error('Error logging meal:', err)
      alert('Failed to log meal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem' }}>
        ← Back to Dashboard
      </Link>

      <div className="page-header">
        <h1>Log Food</h1>
        <p>Search and add a meal to your daily log</p>
      </div>

      {success && (
        <div className="success">
          Meal logged successfully! Redirecting to dashboard...
        </div>
      )}

      {/* Search card */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Search for Food</div>
            <div className="card-subtitle">Select a food item from our database</div>
          </div>
        </div>

        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search for foods (e.g., apple, chicken, rice)..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        <div className="food-list">
          {foods.map((food) => (
            <div
              key={food.id}
              className={`food-item ${selectedFood?.id === food.id ? 'selected' : ''}`}
              onClick={() => handleSelectFood(food)}
            >
              <div className="food-info">
                <h3>{food.name}</h3>
                <p>{food.description}</p>
              </div>
              <div className="food-nutrients">
                <span className="food-nutrient-chip">{Math.round(food.calories)} kcal</span>
                <span className="food-nutrient-chip">{food.protein}g protein</span>
                <span className="food-nutrient-chip">{food.carbohydrates}g carbs</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Meal details card */}
      {selectedFood && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Meal Details</div>
              <div className="card-subtitle">Configure your portion and meal type</div>
            </div>
          </div>

          <div className="form-group">
            <label>Selected Food</label>
            <input type="text" value={selectedFood.name} disabled />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Portion Size (servings)</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={portionSize}
                onChange={(e) => setPortionSize(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Meal Type</label>
              <select value={mealType} onChange={(e) => setMealType(e.target.value)}>
                <option value="BREAKFAST">Breakfast</option>
                <option value="LUNCH">Lunch</option>
                <option value="DINNER">Dinner</option>
                <option value="SNACK">Snack</option>
              </select>
            </div>
          </div>

          {/* Nutrient preview */}
          <div className="nutrient-preview">
            <div className="nutrient-preview-item">
              <div className="nutrient-preview-value">{Math.round(selectedFood.calories * portionSize)}</div>
              <div className="nutrient-preview-label">Calories</div>
            </div>
            <div className="nutrient-preview-item">
              <div className="nutrient-preview-value">{(selectedFood.protein * portionSize).toFixed(1)}g</div>
              <div className="nutrient-preview-label">Protein</div>
            </div>
            <div className="nutrient-preview-item">
              <div className="nutrient-preview-value">{(selectedFood.carbohydrates * portionSize).toFixed(1)}g</div>
              <div className="nutrient-preview-label">Carbs</div>
            </div>
            <div className="nutrient-preview-item">
              <div className="nutrient-preview-value">{(selectedFood.fat * portionSize).toFixed(1)}g</div>
              <div className="nutrient-preview-label">Fat</div>
            </div>
          </div>

          <button
            onClick={handleLogMeal}
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading ? 'Logging...' : 'Log This Meal'}
          </button>
        </div>
      )}
    </Layout>
  )
}

export default FoodLogging
