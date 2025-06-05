import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ReservationDashboard.css';

function ReservationDashboard() {
  const [activeTab, setActiveTab] = useState('create');
  const [createForm, setCreateForm] = useState({
    customerId: '',
    roomId: '',
    checkInDate: '',
    checkOutDate: '',
    occupants: '',
    creditCardDetails: '',
  });
  const [viewForm, setViewForm] = useState({ reservationId: '' });
  const [updateForm, setUpdateForm] = useState({
    reservationId: '',
    roomId: '',
    checkInDate: '',
    checkOutDate: '',
    occupants: '',
    creditCardDetails: '',
  });
  const [cancelForm, setCancelForm] = useState({ reservationId: '' });
  const [availableRoomsForm, setAvailableRoomsForm] = useState({ roomType: '' });
  const [reservation, setReservation] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const roomTypes = ['STANDARD', 'RESIDENTIAL_SUITE', 'SUITE'];

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !['ADMIN', 'CUSTOMER'].includes(user?.role?.toUpperCase())) {
      toast.error('Unauthorized access. Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      const customerId = user?.customerId || user?.id || '';
      if (customerId) {
        setCreateForm((prev) => ({ ...prev, customerId }));
        setUpdateForm((prev) => ({ ...prev, customerId }));
      } else {
        toast.error('Customer ID not found in user data');
      }
    }
  }, [navigate]);

  // Form input handlers
  const handleCreateChange = ({ target }) => {
    setCreateForm((prev) => ({ ...prev, [target.name]: target.value }));
  };

  const handleViewChange = ({ target }) => {
    setViewForm((prev) => ({ ...prev, [target.name]: target.value }));
  };

  const handleUpdateChange = ({ target }) => {
    setUpdateForm((prev) => ({ ...prev, [target.name]: target.value }));
  };

  const handleCancelChange = ({ target }) => {
    setCancelForm((prev) => ({ ...prev, [target.name]: target.value }));
  };

  const handleAvailableRoomsChange = ({ target }) => {
    setAvailableRoomsForm((prev) => ({ ...prev, [target.name]: target.value }));
  };

  // Validate create/update form
  const validateReservationForm = (form) => {
    if (!form.customerId) return 'Customer ID is required';
    if (!form.roomId || form.roomId < 1) return 'Valid Room ID is required';
    if (!form.checkInDate) return 'Check-in date is required';
    if (!form.checkOutDate) return 'Check-out date is required';
    if (new Date(form.checkInDate) >= new Date(form.checkOutDate)) return 'Check-out date must be after check-in date';
    if (!form.occupants || form.occupants < 1) return 'Number of occupants must be at least 1';
    return '';
  };

  // Reset forms
  const resetCreateForm = () => {
    setCreateForm((prev) => ({
      customerId: prev.customerId,
      roomId: '',
      checkInDate: '',
      checkOutDate: '',
      occupants: '',
      creditCardDetails: '',
    }));
  };

  const resetUpdateForm = () => {
    setUpdateForm((prev) => ({
      customerId: prev.customerId,
      reservationId: '',
      roomId: '',
      checkInDate: '',
      checkOutDate: '',
      occupants: '',
      creditCardDetails: '',
    }));
  };

  // API Calls
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateReservationForm(createForm);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:8040/api/reservations',
        {
          ...createForm,
          roomId: parseInt(createForm.roomId),
          occupants: parseInt(createForm.occupants),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(`Reservation created successfully! Reservation ID: ${response.data.id}`);
      resetCreateForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create reservation');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubmit = async (e) => {
    e.preventDefault();
    if (!viewForm.reservationId || viewForm.reservationId < 1) {
      toast.error('Valid Reservation ID is required');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      // Log request details for debugging
      console.log('Fetching reservation with ID:', viewForm.reservationId);
      console.log('Token:', token);

      const response = await axios.get(
        `http://localhost:8040/api/reservations/${viewForm.reservationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('Response data:', response.data);
      setReservation(response.data);
      toast.success('Reservation fetched successfully');
    } catch (error) {
      // Enhanced error handling
      let errorMessage = 'Failed to fetch reservation';
      if (error.response) {
        // Server responded with a status other than 2xx
        const { status, data } = error.response;
        console.error('Error response:', { status, data });
        if (status === 401) {
          errorMessage = 'Unauthorized: Invalid or expired token';
          toast.error(errorMessage);
          setTimeout(() => navigate('/login'), 2000);
          return;
        } else if (status === 403) {
          errorMessage = 'Forbidden: You do not have permission to view this reservation';
        } else if (status === 404) {
          errorMessage = 'Reservation not found';
        } else {
          errorMessage = data?.message || errorMessage;
        }
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response received:', error.request);
        errorMessage = 'Network error: Unable to reach the server';
      } else {
        // Other errors (e.g., setup error)
        console.error('Error:', error.message);
        errorMessage = error.message;
      }
      toast.error(errorMessage);
      setReservation(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!updateForm.reservationId || updateForm.reservationId < 1) {
      toast.error('Valid Reservation ID is required');
      return;
    }
    const validationError = validateReservationForm(updateForm);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:8040/api/reservations/${updateForm.reservationId}`,
        {
          ...updateForm,
          roomId: parseInt(updateForm.roomId),
          occupants: parseInt(updateForm.occupants),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(`Reservation ID ${response.data.id} updated successfully`);
      resetUpdateForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update reservation');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelForm.reservationId || cancelForm.reservationId < 1) {
      toast.error('Valid Reservation ID is required');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:8040/api/reservations/${cancelForm.reservationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(`Reservation ID ${cancelForm.reservationId} cancelled successfully`);
      setCancelForm({ reservationId: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel reservation');
    } finally {
      setLoading(false);
    }
  };

  const handleAvailableRoomsSubmit = async (e) => {
    e.preventDefault();
    if (!availableRoomsForm.roomType) {
      toast.error('Room type is required');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8040/api/rooms/available', {
        headers: { Authorization: `Bearer ${token}` },
        params: { roomType: availableRoomsForm.roomType },
      });
      setAvailableRooms(response.data);
      toast.success('Available rooms fetched successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch available rooms');
      setAvailableRooms([]);
    } finally {
      setLoading(false);
    }
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'create':
        return (
          <form onSubmit={handleCreateSubmit} className="reservation-form" noValidate>
            <div className="mb-4">
              <label htmlFor="customerId" className="block text-sm font-medium">
                Customer ID
              </label>
              <input
                id="customerId"
                type="number"
                name="customerId"
                placeholder="Customer ID"
                value={createForm.customerId}
                onChange={handleCreateChange}
                disabled
                className="input"
                required
                aria-describedby="customerId-error"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="roomId" className="block text-sm font-medium">
                Room ID
              </label>
              <input
                id="roomId"
                type="number"
                name="roomId"
                placeholder="Room ID"
                value={createForm.roomId}
                onChange={handleCreateChange}
                className="input"
                required
                min="1"
                aria-describedby="roomId-error"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="checkInDate" className="block text-sm font-medium">
                Check-In Date
              </label>
              <input
                id="checkInDate"
                type="date"
                name="checkInDate"
                value={createForm.checkInDate}
                onChange={handleCreateChange}
                className="input"
                required
                aria-describedby="checkInDate-error"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="checkOutDate" className="block text-sm font-medium">
                Check-Out Date
              </label>
              <input
                id="checkOutDate"
                type="date"
                name="checkOutDate"
                value={createForm.checkOutDate}
                onChange={handleCreateChange}
                className="input"
                required
                aria-describedby="checkOutDate-error"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="occupants" className="block text-sm font-medium">
                Occupants
              </label>
              <input
                id="occupants"
                type="number"
                name="occupants"
                placeholder="Number of Occupants"
                value={createForm.occupants}
                onChange={handleCreateChange}
                className="input"
                required
                min="1"
                aria-describedby="occupants-error"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="creditCardDetails" className="block text-sm font-medium">
                Credit Card Details
              </label>
              <input
                id="creditCardDetails"
                type="text"
                name="creditCardDetails"
                placeholder="Credit Card Details"
                value={createForm.creditCardDetails}
                onChange={handleCreateChange}
                className="input"
                aria-describedby="creditCardDetails-error"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Reservation'}
            </button>
          </form>
        );
      case 'view':
        return (
          <form onSubmit={handleViewSubmit} className="reservation-form" noValidate>
            <div className="mb-4">
              <label htmlFor="viewReservationId" className="block text-sm font-medium">
                Reservation ID
              </label>
              <input
                id="viewReservationId"
                type="number"
                name="reservationId"
                placeholder="Enter Reservation ID"
                value={viewForm.reservationId}
                onChange={handleViewChange}
                className="input"
                required
                min="1"
                aria-describedby="reservationId-error"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Fetching...' : 'View Reservation'}
            </button>
            {reservation && (
              <div className="mt-6">
                <h3 className="text-lg font-bold mb-4">Reservation Details</h3>
                <div className="overflow-x-auto">
                  <table className="table-auto w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-2">ID</th>
                        <th className="px-4 py-2">Customer ID</th>
                        <th className="px-4 py-2">Room ID</th>
                        <th className="px-4 py-2">Check-In</th>
                        <th className="px-4 py-2">Check-Out</th>
                        <th className="px-4 py-2">Occupants</th>
                        <th className="px-4 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="px-4 py-2">{reservation.id}</td>
                        <td className="px-4 py-2">{reservation.customerId}</td>
                        <td className="px-4 py-2">{reservation.roomId}</td>
                        <td className="px-4 py-2">{reservation.checkInDate}</td>
                        <td className="px-4 py-2">{reservation.checkOutDate}</td>
                        <td className="px-4 py-2">{reservation.occupants}</td>
                        <td className="px-4 py-2">{reservation.reservationStatus}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </form>
        );
      case 'update':
        return (
          <form onSubmit={handleUpdateSubmit} className="reservation-form" noValidate>
            <div className="mb-4">
              <label htmlFor="updateReservationId" className="block text-sm font-medium">
                Reservation ID
              </label>
              <input
                id="updateReservationId"
                type="number"
                name="reservationId"
                placeholder="Enter Reservation ID"
                value={updateForm.reservationId}
                onChange={handleUpdateChange}
                className="input"
                required
                min="1"
                aria-describedby="reservationId-error"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="updateCustomerId" className="block text-sm font-medium">
                Customer ID
              </label>
              <input
                id="updateCustomerId"
                type="number"
                name="customerId"
                placeholder="Customer ID"
                value={updateForm.customerId}
                onChange={handleUpdateChange}
                disabled
                className="input"
                required
                aria-describedby="customerId-error"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="updateRoomId" className="block text-sm font-medium">
                Room ID
              </label>
              <input
                id="updateRoomId"
                type="number"
                name="roomId"
                placeholder="Room ID"
                value={updateForm.roomId}
                onChange={handleUpdateChange}
                className="input"
                required
                min="1"
                aria-describedby="roomId-error"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="updateCheckInDate" className="block text-sm font-medium">
                Check-In Date
              </label>
              <input
                id="updateCheckInDate"
                type="date"
                name="checkInDate"
                value={updateForm.checkInDate}
                onChange={handleUpdateChange}
                className="input"
                required
                aria-describedby="checkInDate-error"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="updateCheckOutDate" className="block text-sm font-medium">
                Check-Out Date
              </label>
              <input
                id="updateCheckOutDate"
                type="date"
                name="checkOutDate"
                value={updateForm.checkOutDate}
                onChange={handleUpdateChange}
                className="input"
                required
                aria-describedby="checkOutDate-error"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="updateOccupants" className="block text-sm font-medium">
                Occupants
              </label>
              <input
                id="updateOccupants"
                type="number"
                name="occupants"
                placeholder="Number of Occupants"
                value={updateForm.occupants}
                onChange={handleUpdateChange}
                className="input"
                required
                min="1"
                aria-describedby="occupants-error"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="updateCreditCardDetails" className="block text-sm font-medium">
                Credit Card Details
              </label>
              <input
                id="updateCreditCardDetails"
                type="text"
                name="creditCardDetails"
                placeholder="Credit Card Details"
                value={updateForm.creditCardDetails}
                onChange={handleUpdateChange}
                className="input"
                aria-describedby="creditCardDetails-error"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Reservation'}
            </button>
          </form>
        );
      case 'cancel':
        return (
          <form onSubmit={handleCancelSubmit} className="reservation-form" noValidate>
            <div className="mb-4">
              <label htmlFor="cancelReservationId" className="block text-sm font-medium">
                Reservation ID
              </label>
              <input
                id="cancelReservationId"
                type="number"
                name="reservationId"
                placeholder="Enter Reservation ID"
                value={cancelForm.reservationId}
                onChange={handleCancelChange}
                className="input"
                required
                min="1"
                aria-describedby="reservationId-error"
              />
            </div>
            <button type="submit" className="btn btn-danger" disabled={loading}>
              {loading ? 'Cancelling...' : 'Cancel Reservation'}
            </button>
          </form>
        );
      case 'availableRooms':
        return (
          <form onSubmit={handleAvailableRoomsSubmit} className="reservation-form" noValidate>
            <div className="mb-4">
              <label htmlFor="roomType" className="block text-sm font-medium">
                Room Type
              </label>
              <select
                id="roomType"
                name="roomType"
                value={availableRoomsForm.roomType}
                onChange={handleAvailableRoomsChange}
                className="input"
                required
                aria-describedby="roomType-error"
              >
                <option value="">Select Room Type</option>
                {roomTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Fetching...' : 'View Available Rooms'}
            </button>
            {availableRooms.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-bold mb-4">Available Rooms</h3>
                <div className="overflow-x-auto">
                  <table className="table-auto w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-2">Room ID</th>
                        <th className="px-4 py-2">Room Type</th>
                        <th className="px-4 py-2">Price/Night</th>
                        <th className="px-4 py-2">Max Occupants</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availableRooms.map((room) => (
                        <tr key={room.id} className="border-b">
                          <td className="px-4 py-2">{room.id}</td>
                          <td className="px-4 py-2">{room.roomType}</td>
                          <td className="px-4 py-2">${room.pricePerNight.toFixed(2)}</td>
                          <td className="px-4 py-2">{room.maxOccupants}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {availableRooms.length === 0 && !loading && availableRoomsForm.roomType && (
              <p className="mt-4 text-gray-500">No available rooms found for selected type.</p>
            )}
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <div className="reservation-dashboard">
      {loading && <div className="loading">Loading...</div>}
      <div className="sidebar">
        <h2 className="text-xl font-bold mb-4">Reservation Management</h2>
        <button
          className={`sidebar-btn ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Create Reservation
        </button>
        <button
          className={`sidebar-btn ${activeTab === 'view' ? 'active' : ''}`}
          onClick={() => setActiveTab('view')}
        >
          View Reservation
        </button>
        <button
          className={`sidebar-btn ${activeTab === 'update' ? 'active' : ''}`}
          onClick={() => setActiveTab('update')}
        >
          Update Reservation
        </button>
        <button
          className={`sidebar-btn ${activeTab === 'cancel' ? 'active' : ''}`}
          onClick={() => setActiveTab('cancel')}
        >
          Cancel Reservation
        </button>
        <button
          className={`sidebar-btn ${activeTab === 'availableRooms' ? 'active' : ''}`}
          onClick={() => setActiveTab('availableRooms')}
        >
          Available Rooms
        </button>
      </div>
      <div className="content">
        <h2 className="text-2xl font-bold mb-4">
          {activeTab === 'availableRooms'
            ? 'Available Rooms'
            : activeTab.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())}
        </h2>
        {renderTabContent()}
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}

export default ReservationDashboard;