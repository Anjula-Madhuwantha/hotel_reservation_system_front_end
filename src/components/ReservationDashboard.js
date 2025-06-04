// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './ReservationDashboard.css';

// function ReservationDashboard() {
//   const [form, setForm] = useState({
//     customerId: '',
//     roomId: '',
//     checkInDate: '',
//     checkOutDate: '',
//     occupants: '',
//     creditCardDetails: '',
//   });
//   const [message, setMessage] = useState('');
//   const navigate = useNavigate();

//   useEffect(() => {
//     // Check authentication and role
//     const token = localStorage.getItem('token');
//     const user = JSON.parse(localStorage.getItem('user'));

//     if (!token || user?.role?.toLowerCase() !== 'customer') {
//       navigate('/login');
//     } else {
//       // Auto-fill customerId from user object
//       const customerId = user?.customerId || user?.id || '';
//       if (customerId) {
//         setForm((prev) => ({ ...prev, customerId }));
//       } else {
//         setMessage('Error: Customer ID not found in user data');
//       }
//     }
//   }, [navigate]);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMessage('');

//     try {
//       const token = localStorage.getItem('token');
//       const res = await fetch('http://localhost:8040/api/reservations', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         },
//         body: JSON.stringify(form),
//       });

//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.message || 'Reservation failed');
//       }

//       const data = await res.json();
//       setMessage(`Reservation successful! Reservation ID: ${data.id}`);
//       setForm({
//         customerId: form.customerId, // Preserve customerId
//         roomId: '',
//         checkInDate: '',
//         checkOutDate: '',
//         occupants: '',
//         creditCardDetails: '',
//       });
//     } catch (err) {
//       setMessage(`Error: ${err.message}`);
//     }
//   };

//   return (
//       <div className="reservation-container">
//         <h2>Reservation Dashboard</h2>
//         <form onSubmit={handleSubmit} className="reservation-form">
//           <div className="form-group">
//             <input
//                 type="number"
//                 name="customerId"
//                 placeholder="Customer ID"
//                 required
//                 value={form.customerId}
//                 onChange={handleChange}
//                 disabled // Disable to prevent manual changes
//             />
//           </div>
//           <div className="form-group">
//             <input
//                 type="number"
//                 name="roomId"
//                 placeholder="Room ID"
//                 required
//                 value={form.roomId}
//                 onChange={handleChange}
//             />
//           </div>
//           <div className="form-group">
//             <input
//                 type="date"
//                 name="checkInDate"
//                 required
//                 value={form.checkInDate}
//                 onChange={handleChange}
//             />
//           </div>
//           <div className="form-group">
//             <input
//                 type="date"
//                 name="checkOutDate"
//                 required
//                 value={form.checkOutDate}
//                 onChange={handleChange}
//             />
//           </div>
//           <div className="form-group">
//             <input
//                 type="number"
//                 name="occupants"
//                 placeholder="Occupants"
//                 required
//                 value={form.occupants}
//                 onChange={handleChange}
//             />
//           </div>
//           <div className="form-group">
//             <input
//                 type="text"
//                 name="creditCardDetails"
//                 placeholder="Credit Card Details"
//                 value={form.creditCardDetails}
//                 onChange={handleChange}
//             />
//           </div>
//           <button type="submit" className="reservation-button">Create Reservation</button>
//           {message && <p className="reservation-message">{message}</p>}
//         </form>
//       </div>
//   );
// }

// export default ReservationDashboard;


// new1

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import Loading from './Loading';
import 'react-toastify/dist/ReactToastify.css';
import './ReservationDashboard.css';

const ReservationDashboard = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [form, setForm] = useState({
    customerId: '',
    roomId: '',
    checkInDate: '',
    checkOutDate: '',
    occupants: '',
    creditCardDetails: '',
    reservationId: '',
  });
  const [reservations, setReservations] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const ROOM_TYPES = ['STANDARD', 'SUITE', 'RESIDENTIAL_SUITE'];

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !['customer', 'admin'].includes(user?.role?.toLowerCase())) {
      toast.error('Unauthorized access. Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      const customerId = user?.customerId || user?.id || '';
      if (customerId) {
        setForm((prev) => ({ ...prev, customerId }));
        fetchUserReservations(customerId);
      } else {
        toast.error('Error: Customer ID not found in user data');
      }
    }
  }, [navigate]);

  // Fetch user's reservations
  const fetchUserReservations = async (customerId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8040/api/reservations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter reservations by customerId (assuming backend doesn't filter by user)
      const userReservations = response.data.filter(
        (res) => res.customerId === customerId
      );
      setReservations(userReservations);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch reservations');
    } finally {
      setLoading(false);
    }
  };

  // Fetch available rooms
  const fetchAvailableRooms = async (roomType) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8040/api/rooms/available?roomType=${roomType}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAvailableRooms(response.data);
      toast.success(`Available ${roomType.replace('_', ' ')} rooms fetched`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch available rooms');
    } finally {
      setLoading(false);
    }
  };

  // Form input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Reset form
  const resetForm = () => {
    setForm({
      customerId: form.customerId,
      roomId: '',
      checkInDate: '',
      checkOutDate: '',
      occupants: '',
      creditCardDetails: '',
      reservationId: '',
    });
  };

  // Validate form
  const validateForm = (isUpdate = false) => {
    if (!form.customerId) {
      toast.error('Customer ID is required');
      return false;
    }
    if (!form.roomId) {
      toast.error('Room selection is required');
      return false;
    }
    if (!form.checkInDate) {
      toast.error('Check-in date is required');
      return false;
    }
    if (!form.checkOutDate) {
      toast.error('Check-out date is required');
      return false;
    }
    if (new Date(form.checkInDate) < new Date().setHours(0, 0, 0, 0)) {
      toast.error('Check-in date must be today or in the future');
      return false;
    }
    if (new Date(form.checkOutDate) <= new Date(form.checkInDate)) {
      toast.error('Check-out date must be after check-in date');
      return false;
    }
    if (!form.occupants || form.occupants < 1) {
      toast.error('Occupants must be at least 1');
      return false;
    }
    if (isUpdate && !form.reservationId) {
      toast.error('Reservation ID is required for update');
      return false;
    }
    return true;
  };

  // API Calls
  const createReservation = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8040/api/reservations', form, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success(`Reservation created! ID: ${response.data.id}`);
      resetForm();
      fetchUserReservations(form.customerId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create reservation');
    } finally {
      setLoading(false);
    }
  };

  const updateReservation = async (e) => {
    e.preventDefault();
    if (!validateForm(true)) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:8040/api/reservations/${form.reservationId}`, form, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success(`Reservation ${response.data.id} updated successfully`);
      resetForm();
      fetchUserReservations(form.customerId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update reservation');
    } finally {
      setLoading(false);
    }
  };

  const cancelReservation = async (reservationId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8040/api/reservations/${reservationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Reservation canceled successfully');
      fetchUserReservations(form.customerId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel reservation');
    } finally {
      setLoading(false);
    }
  };

  const checkIn = async (reservationId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:8040/api/reservations/check-in',
        { reservationId },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(`Checked in for reservation ${response.data.id}`);
      fetchUserReservations(form.customerId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  const checkOut = async (reservationId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:8040/api/reservations/check-out',
        { reservationId, optionalCharges: 0.0, paymentMethod: 'CREDIT_CARD' },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(`Checked out for reservation ${response.data.reservationId}. Amount: $${response.data.amount}`);
      fetchUserReservations(form.customerId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to check out');
    } finally {
      setLoading(false);
    }
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'create':
        return (
          <form onSubmit={createReservation} className="reservation-form">
            <div className="mb-4">
              <label className="block text-sm font-medium">Customer ID</label>
              <input
                type="number"
                name="customerId"
                value={form.customerId}
                onChange={handleChange}
                className="input"
                disabled
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Room</label>
              <select
                name="roomId"
                value={form.roomId}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Select a room</option>
                {availableRooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.roomNumber} ({room.roomType.replace('_', ' ')}, Max: {room.maxOccupants}, ${room.pricePerNight}/night)
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Room Type</label>
              <select
                onChange={(e) => fetchAvailableRooms(e.target.value)}
                className="input"
              >
                <option value="">Select Room Type</option>
                {ROOM_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Check-In Date</label>
              <input
                type="date"
                name="checkInDate"
                value={form.checkInDate}
                onChange={handleChange}
                className="input"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Check-Out Date</label>
              <input
                type="date"
                name="checkOutDate"
                value={form.checkOutDate}
                onChange={handleChange}
                className="input"
                required
                min={form.checkInDate || new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Occupants</label>
              <input
                type="number"
                name="occupants"
                value={form.occupants}
                onChange={handleChange}
                className="input"
                required
                min="1"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Credit Card Details (Optional)</label>
              <input
                type="text"
                name="creditCardDetails"
                value={form.creditCardDetails}
                onChange={handleChange}
                className="input"
                placeholder="Enter card details for confirmed status"
              />
            </div>
            <button type="submit" className="btn btn-primary">Create Reservation</button>
          </form>
        );
      case 'update':
        return (
          <form onSubmit={updateReservation} className="reservation-form">
            <div className="mb-4">
              <label className="block text-sm font-medium">Reservation ID</label>
              <input
                type="number"
                name="reservationId"
                value={form.reservationId}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Customer ID</label>
              <input
                type="number"
                name="customerId"
                value={form.customerId}
                onChange={handleChange}
                className="input"
                disabled
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Room</label>
              <select
                name="roomId"
                value={form.roomId}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Select a room</option>
                {availableRooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.roomNumber} ({room.roomType.replace('_', ' ')}, Max: {room.maxOccupants}, ${room.pricePerNight}/night)
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Room Type</label>
              <select
                onChange={(e) => fetchAvailableRooms(e.target.value)}
                className="input"
              >
                <option value="">Select Room Type</option>
                {ROOM_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Check-In Date</label>
              <input
                type="date"
                name="checkInDate"
                value={form.checkInDate}
                onChange={handleChange}
                className="input"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Check-Out Date</label>
              <input
                type="date"
                name="checkOutDate"
                value={form.checkOutDate}
                onChange={handleChange}
                className="input"
                required
                min={form.checkInDate || new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Occupants</label>
              <input
                type="number"
                name="occupants"
                value={form.occupants}
                onChange={handleChange}
                className="input"
                required
                min="1"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Credit Card Details (Optional)</label>
              <input
                type="text"
                name="creditCardDetails"
                value={form.creditCardDetails}
                onChange={handleChange}
                className="input"
                placeholder="Enter card details for confirmed status"
              />
            </div>
            <button type="submit" className="btn btn-primary">Update Reservation</button>
          </form>
        );
      case 'view':
        return (
          <div>
            <h3 className="text-lg font-medium mb-4">Your Reservations</h3>
            {reservations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table-auto w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2">ID</th>
                      <th className="px-4 py-2">Room Number</th>
                      <th className="px-4 py-2">Check-In</th>
                      <th className="px-4 py-2">Check-Out</th>
                      <th className="px-4 py-2">Occupants</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((res) => (
                      <tr key={res.id} className="border-b">
                        <td className="px-4 py-2">{res.id}</td>
                        <td className="px-4 py-2">{res.roomId}</td>
                        <td className="px-4 py-2">{res.checkInDate}</td>
                        <td className="px-4 py-2">{res.checkOutDate}</td>
                        <td className="px-4 py-2">{res.occupants}</td>
                        <td className="px-4 py-2">{res.reservationStatus}</td>
                        <td className="px-4 py-2">
                          {res.reservationStatus === 'PENDING' || res.reservationStatus === 'CONFIRMED' ? (
                            <>
                              <button
                                onClick={() => cancelReservation(res.id)}
                                className="btn btn-danger mr-2"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => checkIn(res.id)}
                                className="btn btn-primary"
                                disabled={res.reservationStatus !== 'CONFIRMED'}
                              >
                                Check In
                              </button>
                            </>
                          ) : res.reservationStatus === 'CHECKED_IN' ? (
                            <button
                              onClick={() => checkOut(res.id)}
                              className="btn btn-primary"
                            >
                              Check Out
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No reservations found.</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="reservation-dashboard">
      {loading && <Loading />}
      <div className="sidebar">
        <h2 className="text-xl font-bold mb-4">Reservation Management</h2>
        <button
          className={`sidebar-btn ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Create Reservation
        </button>
        <button
          className={`sidebar-btn ${activeTab === 'update' ? 'active' : ''}`}
          onClick={() => setActiveTab('update')}
        >
          Update Reservation
        </button>
        <button
          className={`sidebar-btn ${activeTab === 'view' ? 'active' : ''}`}
          onClick={() => setActiveTab('view')}
        >
          View Reservations
        </button>
      </div>
      <div className="content">
        <h2 className="text-2xl font-bold mb-4">
          {activeTab.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())} Reservation
        </h2>
        {renderTabContent()}
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default ReservationDashboard;