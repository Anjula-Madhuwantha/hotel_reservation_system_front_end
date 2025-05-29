import React, { useState } from 'react';
import './Auth.css';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

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

      // Save token and user info
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
      } else {
        throw new Error('No token received');
      }

      // Role-based redirect with token in state
      const userRole = data.role?.toLowerCase();
      if (userRole === 'admin') {
        navigate('/admin-dashboard', { state: { token: data.token } });
      } else if (userRole === 'customer') {
        navigate('/reservation-dashboard', { state: { token: data.token } });
      } else {
        throw new Error('Unknown role');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    }
  };

  return (
      <div className="auth-container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
                type="text"
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                required
                autoComplete="username"
            />
          </div>
          <div className="form-group">
            <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
            />
          </div>
          <button type="submit" className="auth-button">Login</button>
          {error && <p className="auth-error">{error}</p>}
        </form>
        <p className="auth-switch">
          Don’t have an account?{' '}
          <span
              onClick={() => navigate('/register')}
              className="auth-link"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/register')}
          >
          Register here
        </span>
        </p>
      </div>
  );
}

export default Login;