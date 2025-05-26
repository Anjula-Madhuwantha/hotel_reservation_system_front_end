// src/pages/Login.js
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

      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      console.log('Login success:', data);
      navigate('/'); // redirect to home or dashboard
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="text"
          name="username"
          placeholder="Username"
          required
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          onChange={handleChange}
        />
        <button type="submit">Login</button>
        {error && <p className="auth-error">{error}</p>}
      </form>
      <p className="auth-switch">
        Don’t have an account?{' '}
        <span onClick={() => navigate('/register')}>Register here</span>
      </p>
    </div>
  );
}

export default Login;
