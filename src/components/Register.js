import React, { useState } from 'react';
import './Auth.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    role: 'CUSTOMER',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!form.name.trim()) return 'Full name is required';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return 'Valid email is required';
    if (!form.phone.match(/^\+?\d{10,15}$/)) return 'Valid phone number is required (10-15 digits)';
    if (!form.username.trim()) return 'Username is required';
    if (!form.password || form.password.length < 6) return 'Password must be at least 6 characters';
    if (!['CUSTOMER', 'ADMIN', 'TRAVEL_COMPANY'].includes(form.role)) return 'Invalid role selected';
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
      const res = await fetch('http://localhost:8040/api/customers/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      await res.json();
      toast.success('Registration successful! Please sign in.');
      navigate('/login');
    } catch (err) {
      const errorMessage = err.message || 'An error occurred during registration';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <h2 className="auth-title">Create Account</h2>
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="name" className="form-label">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter full name"
              value={form.name}
              onChange={handleChange}
              className="form-input"
              required
              aria-describedby="name-error"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter email"
              value={form.email}
              onChange={handleChange}
              className="form-input"
              required
              aria-describedby="email-error"
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone" className="form-label">Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="text"
              placeholder="Enter phone number"
              value={form.phone}
              onChange={handleChange}
              className="form-input"
              required
              aria-describedby="phone-error"
            />
          </div>
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              id="username"
              name="username"
              type="text"
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
              name="password"
              type="password"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              className="form-input"
              required
              autoComplete="new-password"
              aria-describedby="password-error"
            />
          </div>
          <div className="form-group">
            <label htmlFor="role" className="form-label">Role</label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className="form-input"
              aria-describedby="role-error"
            >
              <option value="CUSTOMER">Customer</option>
              {/* <option value="ADMIN">Admin</option> */}
              <option value="TRAVEL_COMPANY">Travel Agency</option>
            </select>
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
              'Register'
            )}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account?{' '}
          <button
            type="button"
            className="auth-link"
            onClick={() => navigate('/login')}
            aria-label="Navigate to login page"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;