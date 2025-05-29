import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReservationDashboard.css';

function ReservationDashboard() {
  const [form, setForm] = useState({
    customerId: '',
    roomId: '',
    checkInDate: '',
    checkOutDate: '',
    occupants: '',
    creditCardDetails: '',
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication and role
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || user?.role?.toLowerCase() !== 'customer') {
      navigate('/login');
    } else {
      // Auto-fill customerId from user object
      const customerId = user?.customerId || user?.id || '';
      if (customerId) {
        setForm((prev) => ({ ...prev, customerId }));
      } else {
        setMessage('Error: Customer ID not found in user data');
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8040/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Reservation failed');
      }

      const data = await res.json();
      setMessage(`Reservation successful! Reservation ID: ${data.id}`);
      setForm({
        customerId: form.customerId, // Preserve customerId
        roomId: '',
        checkInDate: '',
        checkOutDate: '',
        occupants: '',
        creditCardDetails: '',
      });
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  return (
      <div className="reservation-container">
        <h2>Reservation Dashboard</h2>
        <form onSubmit={handleSubmit} className="reservation-form">
          <div className="form-group">
            <input
                type="number"
                name="customerId"
                placeholder="Customer ID"
                required
                value={form.customerId}
                onChange={handleChange}
                disabled // Disable to prevent manual changes
            />
          </div>
          <div className="form-group">
            <input
                type="number"
                name="roomId"
                placeholder="Room ID"
                required
                value={form.roomId}
                onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <input
                type="date"
                name="checkInDate"
                required
                value={form.checkInDate}
                onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <input
                type="date"
                name="checkOutDate"
                required
                value={form.checkOutDate}
                onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <input
                type="number"
                name="occupants"
                placeholder="Occupants"
                required
                value={form.occupants}
                onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <input
                type="text"
                name="creditCardDetails"
                placeholder="Credit Card Details"
                value={form.creditCardDetails}
                onChange={handleChange}
            />
          </div>
          <button type="submit" className="reservation-button">Create Reservation</button>
          {message && <p className="reservation-message">{message}</p>}
        </form>
      </div>
  );
}

export default ReservationDashboard;