// import React, { useState } from 'react';
// import './Auth.css';
// import { useNavigate } from 'react-router-dom';

// function Register() {
//   const [form, setForm] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     username: '',
//     password: '',
//     role: 'CUSTOMER',
//   });
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');

//     try {
//       const res = await fetch('http://localhost:8040/api/customers/sign-up', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(form),
//       });

//       if (!res.ok) throw new Error('Registration failed');
//       const data = await res.json();
//       console.log('Registration success:', data);
//       navigate('/login');
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   return (
//     <div className="auth-container">
//       <h2>Register</h2>
//       <form onSubmit={handleSubmit} className="auth-form">
//         <input name="name" type="text" placeholder="Full Name" required onChange={handleChange} />
//         <input name="email" type="email" placeholder="Email" required onChange={handleChange} />
//         <input name="phone" type="text" placeholder="Phone" required onChange={handleChange} />
//         <input name="username" type="text" placeholder="Username" required onChange={handleChange} />
//         <input name="password" type="password" placeholder="Password" required onChange={handleChange} />
//         <select name="role" onChange={handleChange}>
//           <option value="CUSTOMER">Customer</option>
//           <option value="ADMIN">Admin</option>
//           <option value="TRAVEL_COMPANY">Travel Company</option>
//         </select>
//         <button type="submit">Register</button>
//         {error && <p className="auth-error">{error}</p>}
//       </form>
//       <p className="auth-switch">
//         Don’t have an account?{' '}
//         <span onClick={() => navigate('/login')}>Login here</span>
//       </p>
//     </div>
//   );
// }

// export default Register;


// new1


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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(''); // Clear error on input change
  };

  const validateForm = () => {
    if (!form.name.trim()) return 'Full name is required';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return 'Valid email is required';
    if (!form.phone.match(/^\+?\d{10,15}$/)) return 'Valid phone number is required';
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
      navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
    } catch (err) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Enter full name"
            value={form.name}
            onChange={handleChange}
            required
            aria-describedby="name-error"
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter email"
            value={form.email}
            onChange={handleChange}
            required
            aria-describedby="email-error"
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            name="phone"
            type="text"
            placeholder="Enter phone number"
            value={form.phone}
            onChange={handleChange}
            required
            aria-describedby="phone-error"
          />
        </div>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="Enter username"
            value={form.username}
            onChange={handleChange}
            required
            autoComplete="username"
            aria-describedby="username-error"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter password"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
            aria-describedby="password-error"
          />
        </div>
        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select id="role" name="role" value={form.role} onChange={handleChange} aria-describedby="role-error">
            <option value="CUSTOMER">Customer</option>
            <option value="ADMIN">Admin</option>
            <option value="TRAVEL_COMPANY">Travel Company</option>
          </select>
        </div>
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
        {error && (
          <p id="form-error" className="auth-error" role="alert">
            {error}
          </p>
        )}
      </form>
      <p className="auth-switch">
        Already have an account?{' '}
        <button
          type="button"
          className="auth-link"
          onClick={() => navigate('/login')}
          aria-label="Navigate to login page"
        >
          Login here
        </button>
      </p>
    </div>
  );
}

export default Register;