// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import CustomerDashboard from './CustomerDashboard';
// import RoomDashboard from './RoomDashboard';
// import './AdminDashboard.css';

// function AdminDashboard() {
//   const [activeTab, setActiveTab] = useState('customer');
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     localStorage.removeItem('token'); // Remove the saved token
//     navigate('/login'); // Redirect to login page
//   };

//   return (
//     <div className="admin-dashboard">
//       <div className="dashboard-header">
//         <h2>Admin Dashboard</h2>
//         <button className="logout-btn" onClick={handleLogout}>Logout</button>
//       </div>

//       <div className="tab-buttons">
//         <button
//           className={activeTab === 'customer' ? 'active' : ''}
//           onClick={() => setActiveTab('customer')}
//         >
//           Customer Dashboard
//         </button>
//         <button
//           className={activeTab === 'room' ? 'active' : ''}
//           onClick={() => setActiveTab('room')}
//         >
//           Room Dashboard
//         </button>
//       </div>

//       <div className="tab-content">
//         {activeTab === 'customer' && <CustomerDashboard />}
//         {activeTab === 'room' && <RoomDashboard />}
//       </div>
//     </div>
//   );
// }

// export default AdminDashboard;


// new
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerDashboard from './CustomerDashboard';
import RoomDashboard from './RoomDashboard';
import './AdminDashboard.css';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('customer');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || user?.role?.toLowerCase() !== 'admin') {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2>Admin Dashboard</h2>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <div className="tab-buttons">
        <button
          className={activeTab === 'customer' ? 'active' : ''}
          onClick={() => setActiveTab('customer')}
        >
          Customer Dashboard
        </button>
        <button
          className={activeTab === 'room' ? 'active' : ''}
          onClick={() => setActiveTab('room')}
        >
          Room Dashboard
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'customer' && <CustomerDashboard />}
        {activeTab === 'room' && <RoomDashboard />}
      </div>
    </div>
  );
}

export default AdminDashboard;
