// // src/App.js
// import React, { useEffect, useState } from 'react';
// import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
// import Loading from './components/Loading';
// import Login from './components/Login';
// import Register from './components/Register';
// import AdminDashboard from './components/AdminDashboard';
// import ReservationDashboard from './components/ReservationDashboard';
// import RoomDashboard from './components/RoomDashboard';
// import CustomerDashboard from './components/CustomerDashboard';
// import './App.css';

// // Wrapper to handle loading + redirect
// function AppLoader() {
//   const [loading, setLoading] = useState(true);
//   const [redirect, setRedirect] = useState(false);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setLoading(false);
//       setRedirect(true);
//     }, 2000);
//     return () => clearTimeout(timer);
//   }, []);

//   if (loading) return <Loading />;
//   if (redirect) return <Navigate to="/login" />;

//   return null;
// }

// function App() {
//   return (
//     <Router>
//       <div className="App">
//         <Routes>
//           <Route path="/" element={<AppLoader />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />
//           <Route path="/admin-dashboard" element={<AdminDashboard />} />
//           <Route path="/reservation-dashboard" element={<ReservationDashboard />} />
//           <Route path="/room-dashboard" element={<RoomDashboard />} />
//           <Route path="/customer-dashboard" element={<CustomerDashboard />} />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;


// new1
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Loading from './components/Loading';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import ReservationDashboard from './components/ReservationDashboard';
import RoomDashboard from './components/RoomDashboard';
import CustomerDashboard from './components/CustomerDashboard';
import Reports from './components/Reports';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="App">
      {loading ? (
        <Loading />
      ) : (
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/reservation-dashboard" element={<ReservationDashboard />} />
            <Route path="/room-dashboard" element={<RoomDashboard />} />
            <Route path="/customer-dashboard" element={<CustomerDashboard />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </Router>
      )}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}

export default App;