// // src/pages/CustomerDashboard.js
// import React from 'react';

// function CustomerDashboard() {
//   return (
//     <div>
//       <h3>Customer Dashboard</h3>
//       <p>This is where you can manage customer information.</p>
//     </div>
//   );
// }

// export default CustomerDashboard;

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function CustomerDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || user?.role?.toLowerCase() !== 'admin') {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div>
      <h3>Customer Dashboard</h3>
      <p>This is where you can manage customer information.</p>
    </div>
  );
}

export default CustomerDashboard;
