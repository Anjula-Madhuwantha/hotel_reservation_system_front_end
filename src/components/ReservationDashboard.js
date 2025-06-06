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
      let errorMessage = 'Failed to fetch reservation';
      if (error.response) {
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
        console.error('No response received:', error.request);
        errorMessage = 'Network error: Unable to reach the server';
      } else {
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

  const getTabIcon = (tabName) => {
    const icons = {
      create: '➕',
      view: '👁️',
      update: '✏️',
      cancel: '❌',
      availableRooms: '🏨'
    };
    return icons[tabName] || '';
  };

  const getTabLabel = (tabName) => {
    const labels = {
      create: 'Create Reservation',
      view: 'View Reservation',
      update: 'Update Reservation',
      cancel: 'Cancel Reservation',
      availableRooms: 'Available Rooms'
    };
    return labels[tabName] || '';
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'create':
        return (
          <div className="form-container">
            <form onSubmit={handleCreateSubmit} className="reservation-form" noValidate>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="customerId" className="form-label">
                    <span className="label-icon">👤</span>
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
                    className="form-input disabled"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="roomId" className="form-label">
                    <span className="label-icon">🏠</span>
                    Room ID
                  </label>
                  <input
                    id="roomId"
                    type="number"
                    name="roomId"
                    placeholder="Room ID"
                    value={createForm.roomId}
                    onChange={handleCreateChange}
                    className="form-input"
                    required
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="checkInDate" className="form-label">
                    <span className="label-icon">📅</span>
                    Check-In Date
                  </label>
                  <input
                    id="checkInDate"
                    type="date"
                    name="checkInDate"
                    value={createForm.checkInDate}
                    onChange={handleCreateChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="checkOutDate" className="form-label">
                    <span className="label-icon">📅</span>
                    Check-Out Date
                  </label>
                  <input
                    id="checkOutDate"
                    type="date"
                    name="checkOutDate"
                    value={createForm.checkOutDate}
                    onChange={handleCreateChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="occupants" className="form-label">
                    <span className="label-icon">👥</span>
                    Occupants
                  </label>
                  <input
                    id="occupants"
                    type="number"
                    name="occupants"
                    placeholder="Number of Occupants"
                    value={createForm.occupants}
                    onChange={handleCreateChange}
                    className="form-input"
                    required
                    min="1"
                  />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="creditCardDetails" className="form-label">
                    <span className="label-icon">💳</span>
                    Credit Card Details
                  </label>
                  <input
                    id="creditCardDetails"
                    type="text"
                    name="creditCardDetails"
                    placeholder="Credit Card Details"
                    value={createForm.creditCardDetails}
                    onChange={handleCreateChange}
                    className="form-input"
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <span>➕</span>
                    Create Reservation
                  </>
                )}
              </button>
            </form>
          </div>
        );
      case 'view':
        return (
          <div className="form-container">
            <form onSubmit={handleViewSubmit} className="reservation-form" noValidate>
              <div className="form-group">
                <label htmlFor="viewReservationId" className="form-label">
                  <span className="label-icon">🔍</span>
                  Reservation ID
                </label>
                <input
                  id="viewReservationId"
                  type="number"
                  name="reservationId"
                  placeholder="Enter Reservation ID"
                  value={viewForm.reservationId}
                  onChange={handleViewChange}
                  className="form-input"
                  required
                  min="1"
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Fetching...
                  </>
                ) : (
                  <>
                    <span>👁️</span>
                    View Reservation
                  </>
                )}
              </button>
              {reservation && (
                <div className="results-container">
                  <h3 className="results-title">
                    <span className="title-icon">📋</span>
                    Reservation Details
                  </h3>
                  <div className="table-container">
                    <table className="modern-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Customer ID</th>
                          <th>Room ID</th>
                          <th>Check-In</th>
                          <th>Check-Out</th>
                          <th>Occupants</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><span className="badge badge-primary">{reservation.id}</span></td>
                          <td>{reservation.customerId}</td>
                          <td>{reservation.roomId}</td>
                          <td>{reservation.checkInDate}</td>
                          <td>{reservation.checkOutDate}</td>
                          <td>{reservation.occupants}</td>
                          <td><span className="badge badge-success">{reservation.reservationStatus}</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </form>
          </div>
        );
      case 'update':
        return (
          <div className="form-container">
            <form onSubmit={handleUpdateSubmit} className="reservation-form" noValidate>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="updateReservationId" className="form-label">
                    <span className="label-icon">🔍</span>
                    Reservation ID
                  </label>
                  <input
                    id="updateReservationId"
                    type="number"
                    name="reservationId"
                    placeholder="Enter Reservation ID"
                    value={updateForm.reservationId}
                    onChange={handleUpdateChange}
                    className="form-input"
                    required
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="updateCustomerId" className="form-label">
                    <span className="label-icon">👤</span>
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
                    className="form-input disabled"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="updateRoomId" className="form-label">
                    <span className="label-icon">🏠</span>
                    Room ID
                  </label>
                  <input
                    id="updateRoomId"
                    type="number"
                    name="roomId"
                    placeholder="Room ID"
                    value={updateForm.roomId}
                    onChange={handleUpdateChange}
                    className="form-input"
                    required
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="updateCheckInDate" className="form-label">
                    <span className="label-icon">📅</span>
                    Check-In Date
                  </label>
                  <input
                    id="updateCheckInDate"
                    type="date"
                    name="checkInDate"
                    value={updateForm.checkInDate}
                    onChange={handleUpdateChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="updateCheckOutDate" className="form-label">
                    <span className="label-icon">📅</span>
                    Check-Out Date
                  </label>
                  <input
                    id="updateCheckOutDate"
                    type="date"
                    name="checkOutDate"
                    value={updateForm.checkOutDate}
                    onChange={handleUpdateChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="updateOccupants" className="form-label">
                    <span className="label-icon">👥</span>
                    Occupants
                  </label>
                  <input
                    id="updateOccupants"
                    type="number"
                    name="occupants"
                    placeholder="Number of Occupants"
                    value={updateForm.occupants}
                    onChange={handleUpdateChange}
                    className="form-input"
                    required
                    min="1"
                  />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="updateCreditCardDetails" className="form-label">
                    <span className="label-icon">💳</span>
                    Credit Card Details
                  </label>
                  <input
                    id="updateCreditCardDetails"
                    type="text"
                    name="creditCardDetails"
                    placeholder="Credit Card Details"
                    value={updateForm.creditCardDetails}
                    onChange={handleUpdateChange}
                    className="form-input"
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <span>✏️</span>
                    Update Reservation
                  </>
                )}
              </button>
            </form>
          </div>
        );
      case 'cancel':
        return (
          <div className="form-container">
            <form onSubmit={handleCancelSubmit} className="reservation-form" noValidate>
              <div className="form-group">
                <label htmlFor="cancelReservationId" className="form-label">
                  <span className="label-icon">🔍</span>
                  Reservation ID
                </label>
                <input
                  id="cancelReservationId"
                  type="number"
                  name="reservationId"
                  placeholder="Enter Reservation ID"
                  value={cancelForm.reservationId}
                  onChange={handleCancelChange}
                  className="form-input"
                  required
                  min="1"
                />
              </div>
              <button type="submit" className="btn btn-danger" disabled={loading}>
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Cancelling...
                  </>
                ) : (
                  <>
                    <span>❌</span>
                    Cancel Reservation
                  </>
                )}
              </button>
            </form>
          </div>
        );
      case 'availableRooms':
        return (
          <div className="form-container">
            <form onSubmit={handleAvailableRoomsSubmit} className="reservation-form" noValidate>
              <div className="form-group">
                <label htmlFor="roomType" className="form-label">
                  <span className="label-icon">🏨</span>
                  Room Type
                </label>
                <select
                  id="roomType"
                  name="roomType"
                  value={availableRoomsForm.roomType}
                  onChange={handleAvailableRoomsChange}
                  className="form-input form-select"
                  required
                >
                  <option value="">Select Room Type</option>
                  {roomTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0) + type.slice(1).toLowerCase().replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Fetching...
                  </>
                ) : (
                  <>
                    <span>🏨</span>
                    View Available Rooms
                  </>
                )}
              </button>
              {availableRooms.length > 0 && (
                <div className="results-container">
                  <h3 className="results-title">
                    <span className="title-icon">🏨</span>
                    Available Rooms ({availableRooms.length})
                  </h3>
                  <div className="table-container">
                    <table className="modern-table">
                      <thead>
                        <tr>
                          <th>Room ID</th>
                          <th>Room Type</th>
                          <th>Price/Night</th>
                          <th>Max Occupants</th>
                        </tr>
                      </thead>
                      <tbody>
                        {availableRooms.map((room) => (
                          <tr key={room.id}>
                            <td><span className="badge badge-primary">{room.id}</span></td>
                            <td><span className="room-type">{room.roomType}</span></td>
                            <td><span className="price">${room.pricePerNight.toFixed(2)}</span></td>
                            <td><span className="occupants">{room.maxOccupants}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {availableRooms.length === 0 && !loading && availableRoomsForm.roomType && (
                <div className="no-results">
                  <span className="no-results-icon">🚫</span>
                  <p>No available rooms found for selected type.</p>
                </div>
              )}
            </form>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="reservation-dashboard">
      {loading && (
        <div className="global-loading">
          <div className="loading-overlay">
            <div className="loading-content">
              <div className="loading-spinner large"></div>
              <p>Processing...</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">
            <span className="title-icon">🏨</span>
            Reservation Management
          </h2>
        </div>
        
        <nav className="sidebar-nav">
          {['create', 'view', 'update', 'cancel', 'availableRooms'].map((tab) => (
            <button
              key={tab}
              className={`sidebar-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              <span className="btn-icon">{getTabIcon(tab)}</span>
              <span className="btn-text">{getTabLabel(tab)}</span>
            </button>
          ))}
        </nav>
      </div>
      
      <div className="content">
        <div className="content-header">
          <h1 className="content-title">
            <span className="title-icon">{getTabIcon(activeTab)}</span>
            {getTabLabel(activeTab)}
          </h1>
        </div>
        
        <div className="content-body">
          {renderTabContent()}
        </div>
      </div>
      
      <ToastContainer 
        position="bottom-right" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default ReservationDashboard;