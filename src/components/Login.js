// import React, { useState } from 'react';
// import './Auth.css';
// import { useNavigate } from 'react-router-dom';

// function Login() {
//   const [form, setForm] = useState({ username: '', password: '' });
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');

//     try {
//       const res = await fetch('http://localhost:8040/api/customers/sign-in', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(form),
//       });

//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.message || 'Login failed');
//       }

//       const data = await res.json();

//       // Save token and user info
//       if (data.token) {
//         localStorage.setItem('token', data.token);
//         localStorage.setItem('user', JSON.stringify(data));
//       } else {
//         throw new Error('No token received');
//       }

//       // Role-based redirect with token in state
//       const userRole = data.role?.toLowerCase();
//       if (userRole === 'admin') {
//         navigate('/admin-dashboard', { state: { token: data.token } });
//       } else if (userRole === 'customer') {
//         navigate('/reservation-dashboard', { state: { token: data.token } });
//       } else if (userRole === 'travel_company') {
//         navigate('/travel-campany-dashboard', { state: { token: data.token } });
//       }
//       else {
//         throw new Error('Unknown role');
//       }
//     } catch (err) {
//       setError(err.message || 'An error occurred during login');
//     }
//   };

//   return (
//       <div className="auth-container">
//         <h2>Login</h2>
//         <form onSubmit={handleSubmit} className="auth-form">
//           <div className="form-group">
//             <input
//                 type="text"
//                 name="username"
//                 placeholder="Username"
//                 value={form.username}
//                 onChange={handleChange}
//                 required
//                 autoComplete="username"
//             />
//           </div>
//           <div className="form-group">
//             <input
//                 type="password"
//                 name="password"
//                 placeholder="Password"
//                 value={form.password}
//                 onChange={handleChange}
//                 required
//                 autoComplete="current-password"
//             />
//           </div>
//           <button type="submit" className="auth-button">Login</button>
//           {error && <p className="auth-error">{error}</p>}
//         </form>
//         <p className="auth-switch">
//           Don’t have an account?{' '}
//           <span
//               onClick={() => navigate('/register')}
//               className="auth-link"
//               role="button"
//               tabIndex={0}
//               onKeyDown={(e) => e.key === 'Enter' && navigate('/register')}
//           >
//           Register here
//         </span>
//         </p>
//       </div>
//   );
// }

// export default Login;


// new1


import React, { useState } from 'react';
import './Auth.css';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(''); // Clear error on input change
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

      // Store token (consider using HTTP-only cookies in production)
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
      } else {
        throw new Error('No token received');
      }

      // Role-based redirect
      const userRole = data.role?.toUpperCase();
      switch (userRole) {
        case 'ADMIN':
          navigate('/admin-dashboard', { state: { token: data.token } });
          break;
        case 'CUSTOMER':
          navigate('/reservation-dashboard', { state: { token: data.token } });
          break;
        case 'TRAVEL_COMPANY':
          navigate('/travel-company-dashboard', { state: { token: data.token } });
          break;
        default:
          throw new Error('Unknown role');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            name="username"
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
            type="password"
            name="password"
            placeholder="Enter password"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
            aria-describedby="password-error"
          />
        </div>
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && (
          <p id="form-error" className="auth-error" role="alert">
            {error}
          </p>
        )}
      </form>
      <p className="auth-switch">
        Don’t have an account?{' '}
        <button
          type="button"
          className="auth-link"
          onClick={() => navigate('/register')}
          aria-label="Navigate to registration page"
        >
          Register here
        </button>
      </p>
    </div>
  );
}

export default Login;