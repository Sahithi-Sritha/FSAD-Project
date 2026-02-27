import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import FoodLogging from './pages/FoodLogging';
import MealHistory from './pages/MealHistory';
import NutritionAnalysis from './pages/NutritionAnalysis';
import UserProfile from './pages/UserProfile';
import AiChat from './pages/AiChat';
import Charts from './pages/Charts';
import GoalSettings from './pages/GoalSettings';
import './App.css';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  const handleLogin = (userData) => {
    const mapped = { ...userData, id: userData.userId ?? userData.id };
    setUser(mapped);
    localStorage.setItem('token', mapped.token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <ThemeProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'text-sm font-medium',
            style: {
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '14px',
              color: '#1e293b',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            },
            success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            duration: 3000,
          }}
        />
        <Routes>
          <Route path="/login"    element={user ? <Navigate to="/dashboard" /> : <LoginPage onLogin={handleLogin} />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage onRegister={handleLogin} />} />
          <Route path="/dashboard"  element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/log-food"   element={user ? <FoodLogging user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/history"    element={user ? <MealHistory user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/nutrition"  element={user ? <NutritionAnalysis user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/profile"    element={user ? <UserProfile user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} /> : <Navigate to="/login" />} />
          <Route path="/ai-chat"    element={user ? <AiChat user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/charts"     element={user ? <Charts user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/goals"      element={user ? <GoalSettings user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
