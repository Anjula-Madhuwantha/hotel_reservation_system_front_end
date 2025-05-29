// src/pages/ReservationDashboard.js
import React, { useState } from 'react';
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch('http://localhost:8040/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Reservation failed');
      const data = await res.json();
      setMessage(`Reservation successful! Reservation ID: ${data.id}`);
      setForm({
        customerId: '',
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
        <input type="number" name="customerId" placeholder="Customer ID" required value={form.customerId} onChange={handleChange} />
        <input type="number" name="roomId" placeholder="Room ID" required value={form.roomId} onChange={handleChange} />
        <input type="date" name="checkInDate" required value={form.checkInDate} onChange={handleChange} />
        <input type="date" name="checkOutDate" required value={form.checkOutDate} onChange={handleChange} />
        <input type="number" name="occupants" placeholder="Occupants" required value={form.occupants} onChange={handleChange} />
        <input type="text" name="creditCardDetails" placeholder="Credit Card Details" value={form.creditCardDetails} onChange={handleChange} />
        <button type="submit">Create Reservation</button>
        {message && <p className="reservation-message">{message}</p>}
      </form>
    </div>
  );
}

export default ReservationDashboard;
