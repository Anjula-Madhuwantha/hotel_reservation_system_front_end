// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Loading from './components/Loading';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import ReservationDashboard from './components/ReservationDashboard';
import './App.css';

// Wrapper to handle loading + redirect
function AppLoader() {
  const [loading, setLoading] = useState(true);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setRedirect(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loading />;
  if (redirect) return <Navigate to="/login" />;

  return null;
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<AppLoader />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/reservation-dashboard" element={<ReservationDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
