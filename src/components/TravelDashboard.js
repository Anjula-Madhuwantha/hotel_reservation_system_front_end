import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './TravelDashboard.css';

const TravelDashboard = () => {
  const [activeTab, setActiveTab] = useState('createBooking');
  const [bookingForm, setBookingForm] = useState({
    travelCompanyName: '',
    startDate: '',
    endDate: '',
    numberOfRooms: 1,
    discountedRate: 10,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !['ADMIN', 'CUSTOMER', 'TRAVEL_COMPANY'].includes(user?.role?.toUpperCase())) {
      toast.error('Unauthorized access. Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [navigate]);

  // Form input handler
  const handleBookingChange = ({ target }) => {
    const { name, value } = target;
    setBookingForm((prev) => ({ ...prev, [name]: value }));
  };

  // Validate booking form
  const validateBookingForm = () => {
    if (!bookingForm.travelCompanyName.trim()) return 'Travel company name is required';
    if (!bookingForm.startDate) return 'Start date is required';
    if (!bookingForm.endDate) return 'End date is required';
    if (bookingForm.numberOfRooms < 1) return 'Number of rooms must be at least 1';
    if (bookingForm.discountedRate < 0) return 'Discounted rate cannot be negative';
    if (new Date(bookingForm.startDate) >= new Date(bookingForm.endDate)) return 'End date must be after start date';
    return '';
  };

  // Reset booking form
  const resetBookingForm = () => {
    setBookingForm({
      travelCompanyName: '',
      startDate: '',
      endDate: '',
      numberOfRooms: 1,
      discountedRate: 0,
    });
  };

  // API Call for creating block booking
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    const validationError = validateBookingForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:8040/api/reservations/block-booking',
        {
          ...bookingForm,
          numberOfRooms: parseInt(bookingForm.numberOfRooms),
          discountedRate: parseFloat(bookingForm.discountedRate),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success('Block booking created successfully');
      resetBookingForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create block booking');
    } finally {
      setLoading(false);
    }
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'createBooking':
        return (
          <form onSubmit={handleCreateBooking} className="reservation-form" noValidate>
            <div className="mb-4">
              <label htmlFor="travelCompanyName" className="block text-sm font-medium">
                Travel Company Name
              </label>
              <input
                id="travelCompanyName"
                name="travelCompanyName"
                placeholder="Enter travel company name"
                value={bookingForm.travelCompanyName}
                onChange={handleBookingChange}
                className="input"
                required
                aria-describedby="travelCompanyName-error"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="startDate" className="block text-sm font-medium">
                Start Date
              </label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                value={bookingForm.startDate}
                onChange={handleBookingChange}
                className="input"
                required
                aria-describedby="startDate-error"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="endDate" className="block text-sm font-medium">
                End Date
              </label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                value={bookingForm.endDate}
                onChange={handleBookingChange}
                className="input"
                required
                aria-describedby="endDate-error"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="numberOfRooms" className="block text-sm font-medium">
                Number of Rooms
              </label>
              <input
                id="numberOfRooms"
                name="numberOfRooms"
                type="number"
                placeholder="Number of Rooms"
                value={bookingForm.numberOfRooms}
                onChange={handleBookingChange}
                className="input"
                min="1"
                required
                aria-describedby="numberOfRooms-error"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="discountedRate" className="block text-sm font-medium">
                Discounted Rate
              </label>
              <input
                id="discountedRate"
                name="discountedRate"
                type="number"
                placeholder="Discounted Rate"
                value={bookingForm.discountedRate}
                onChange={handleBookingChange}
                className="input"
                min="0"
                step="0.01"
                required
                aria-describedby="discountedRate-error"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Block Booking'}
            </button>
          </form>
        );
      case 'bookings':
        return (
          <div className="reservation-form">
            <p className="text-gray-500">View Block Bookings is not available at this time.</p>
          </div>
        );
      case 'cancelBooking':
        return (
          <div className="reservation-form">
            <p className="text-gray-500">Cancel Block Booking is not available at this time.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="travel-dashboard">
      {loading && <div className="loading">Loading...</div>}
      <div className="sidebar">
        <h2 className="text-xl font-bold mb-4">Travel Management</h2>
        <button
          className={`sidebar-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
          disabled
          title="Feature not available"
        >
          View Block Bookings
        </button>
        <button
          className={`sidebar-btn ${activeTab === 'createBooking' ? 'active' : ''}`}
          onClick={() => setActiveTab('createBooking')}
        >
          Create Block Booking
        </button>
        <button
          className={`sidebar-btn ${activeTab === 'cancelBooking' ? 'active' : ''}`}
          onClick={() => setActiveTab('cancelBooking')}
          disabled
          title="Feature not available"
        >
          Cancel Block Booking
        </button>
      </div>
      <div className="content">
        <h2 className="text-2xl font-bold mb-4">
          {activeTab.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())}
        </h2>
        {renderTabContent()}
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default TravelDashboard;