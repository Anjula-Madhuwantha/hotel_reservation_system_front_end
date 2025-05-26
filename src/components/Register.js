// src/pages/Register.js
import React, { useState } from 'react';
import './Auth.css';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:8040/api/customers/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Registration failed');
      const data = await res.json();
      console.log('Registration success:', data);
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input name="name" type="text" placeholder="Full Name" required onChange={handleChange} />
        <input name="email" type="email" placeholder="Email" required onChange={handleChange} />
        <input name="phone" type="text" placeholder="Phone" required onChange={handleChange} />
        <input name="username" type="text" placeholder="Username" required onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" required onChange={handleChange} />
        <select name="role" onChange={handleChange}>
          <option value="CUSTOMER">Customer</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button type="submit">Register</button>
        {error && <p className="auth-error">{error}</p>}
      </form>
      <p className="auth-switch">
        Don’t have an account?{' '}
        <span onClick={() => navigate('/login')}>Login here</span>
      </p>
    </div>
  );
}

export default Register;
