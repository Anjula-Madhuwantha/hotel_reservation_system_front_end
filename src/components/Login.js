import React, { useState } from 'react';
import './Auth.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!form.username.trim()) return 'Username is required';
    if (!form.password) return 'Password is required';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:8040/api/customers/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await res.json();

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
      } else {
        throw new Error('No token received');
      }

      toast.success('Login successful!');
      const userRole = data.role?.toUpperCase();
      switch (userRole) {
        case 'ADMIN':
          navigate('/admin-dashboard');
          break;
        case 'CUSTOMER':
          navigate('/reservation-dashboard');
          break;
        case 'TRAVEL_COMPANY':
          navigate('/travel-company-dashboard');
          break;
        default:
          throw new Error('Unknown role');
      }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred during login';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <h2 className="auth-title">Sign In</h2>
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              id="username"
              type="text"
              name="username"
              placeholder="Enter username"
              value={form.username}
              onChange={handleChange}
              className="form-input"
              required
              autoComplete="username"
              aria-describedby="username-error"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              className="form-input"
              required
              autoComplete="current-password"
              aria-describedby="password-error"
            />
          </div>
          {error && (
            <p id="form-error" className="auth-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? (
              <span className="spinner"></span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        <p className="auth-switch">
          Don’t have an account?{' '}
          <button
            type="button"
            className="auth-link"
            onClick={() => navigate('/register')}
            aria-label="Navigate to registration page"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;