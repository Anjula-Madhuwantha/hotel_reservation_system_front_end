import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import Loading from './Loading';
import 'react-toastify/dist/ReactToastify.css';
import './CustomerDashboard.css';

const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState('reservations');
  const [reservations, setReservations] = useState([]);
  const [checkInForm, setCheckInForm] = useState({ reservationId: '' });
  const [checkOutForm, setCheckOutForm] = useState({
    reservationId: '',
    paymentMethod: 'CASH',
    optionalCharges: '0',
  });
  const [cancelId, setCancelId] = useState('');
  const [filterForm, setFilterForm] = useState({
    status: '',
    customerId: '',
    startDate: '',
    endDate: '',
    page: 0,
    size: 10,
  });
  const [latestBill, setLatestBill] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const PAYMENT_METHODS = ['CASH', 'CREDIT_CARD'];
  const RESERVATION_STATUSES = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'];

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !['admin', 'customer'].includes(user?.role?.toLowerCase())) {
      toast.error('Unauthorized access. Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      fetchReservations(user);
    }
  }, [navigate]);

  // Fetch reservations based on user role
  const fetchReservations = async (user, page = filterForm.page, size = filterForm.size) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let response;
      if (user?.role?.toLowerCase() === 'admin') {
        const params = {
          status: filterForm.status || undefined,
          customerId: filterForm.customerId || undefined,
          startDate: filterForm.startDate || undefined,
          endDate: filterForm.endDate || undefined,
          page,
          size,
        };
        response = await axios.get('http://localhost:8040/api/reservations', {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });
        setReservations(response.data.content);
        setTotalPages(response.data.totalPages);
      } else {
        response = await axios.get('http://localhost:8040/api/reservations/customer', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReservations(response.data);
        setTotalPages(1);
      }
      toast.success('Reservations fetched successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch reservations');
    } finally {
      setLoading(false);
    }
  };

  // Form input handlers
  const handleCheckInChange = ({ target }) => {
    setCheckInForm({ ...checkInForm, [target.name]: target.value });
  };

  const handleCheckOutChange = ({ target }) => {
    setCheckOutForm({ ...checkOutForm, [target.name]: target.value });
  };

  const handleCancelChange = ({ target }) => {
    setCancelId(target.value);
  };

  const handleFilterChange = ({ target }) => {
    setFilterForm({ ...filterForm, [target.name]: target.value });
  };

  const handlePageChange = (newPage) => {
    setFilterForm({ ...filterForm, page: newPage });
    const user = JSON.parse(localStorage.getItem('user'));
    fetchReservations(user, newPage, filterForm.size);
  };

  // Reset forms
  const resetCheckInForm = () => {
    setCheckInForm({ reservationId: '' });
  };

  const resetCheckOutForm = () => {
    setCheckOutForm({ reservationId: '', paymentMethod: 'CASH', optionalCharges: '0' });
  };

  const resetFilterForm = () => {
    setFilterForm({
      status: '',
      customerId: '',
      startDate: '',
      endDate: '',
      page: 0,
      size: 10,
    });
  };

  // API Calls
  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!checkInForm.reservationId) {
      toast.error('Reservation ID is required');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:8040/api/reservations/check-in',
        checkInForm,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success('Check-in successful');
      resetCheckInForm();
      fetchReservations(JSON.parse(localStorage.getItem('user')));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (e) => {
    e.preventDefault();
    if (!checkOutForm.reservationId) {
      toast.error('Reservation ID is required');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:8040/api/reservations/check-out',
        {
          ...checkOutForm,
          optionalCharges: parseFloat(checkOutForm.optionalCharges) || 0,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const billingResponse = response.data;
      setLatestBill(billingResponse);
      toast.success(`Check-out successful. Bill ID: ${billingResponse.id}, Amount: $${billingResponse.amount.toFixed(2)}`);
      resetCheckOutForm();
      fetchReservations(JSON.parse(localStorage.getItem('user')));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check out');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async () => {
    if (!cancelId) {
      toast.error('Reservation ID is required');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8040/api/reservations/${cancelId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success('Reservation cancelled successfully');
      setCancelId('');
      fetchReservations(JSON.parse(localStorage.getItem('user')));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel reservation');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    fetchReservations(user);
  };

  // Render tab content
  const renderTabContent = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.role?.toLowerCase() === 'admin';

    switch (activeTab) {
      case 'reservations':
        return (
          <div>
            {isAdmin && (
              <form onSubmit={handleFilterSubmit} className="reservation-form mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium">Status</label>
                    <select
                      name="status"
                      value={filterForm.status}
                      onChange={handleFilterChange}
                      className="input"
                    >
                      <option value="">All Statuses</option>
                      {RESERVATION_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Customer ID</label>
                    <input
                      name="customerId"
                      type="number"
                      placeholder="Customer ID"
                      value={filterForm.customerId}
                      onChange={handleFilterChange}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Start Date</label>
                    <input
                      name="startDate"
                      type="date"
                      value={filterForm.startDate}
                      onChange={handleFilterChange}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">End Date</label>
                    <input
                      name="endDate"
                      type="date"
                      value={filterForm.endDate}
                      onChange={handleFilterChange}
                      className="input"
                    />
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button type="submit" className="btn btn-primary">
                    Filter Reservations
                  </button>
                  <button type="button" onClick={resetFilterForm} className="btn btn-secondary">
                    Clear Filters
                  </button>
                </div>
              </form>
            )}
            <button onClick={() => fetchReservations(user)} className="btn btn-primary mb-6">
              Refresh Reservations
            </button>
            {reservations.length > 0 ? (
              <div>
                <div className="overflow-x-auto">
                  <table className="table-auto w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-2">ID</th>
                        <th className="px-4 py-2">Room Number</th>
                        <th className="px-4 py-2">Check-In</th>
                        <th className="px-4 py-2">Check-Out</th>
                        <th className="px-4 py-2">Status</th>
                        {isAdmin && <th className="px-4 py-2">Customer ID</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.map((reservation) => (
                        <tr key={reservation.id} className="border-b">
                          <td className="px-4 py-2">{reservation.id}</td>
                          <td className="px-4 py-2">{reservation.room?.roomNumber}</td>
                          <td className="px-4 py-2">{reservation.checkInDate}</td>
                          <td className="px-4 py-2">{reservation.checkOutDate}</td>
                          <td className="px-4 py-2">{reservation.reservationStatus}</td>
                          {isAdmin && <td className="px-4 py-2">{reservation.customerId}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {isAdmin && totalPages > 1 && (
                  <div className="mt-4 flex justify-center space-x-2">
                    <button
                      onClick={() => handlePageChange(filterForm.page - 1)}
                      disabled={filterForm.page === 0}
                      className="btn btn-secondary"
                    >
                      Previous
                    </button>
                    <span className="self-center">
                      Page {filterForm.page + 1} of {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(filterForm.page + 1)}
                      disabled={filterForm.page >= totalPages - 1}
                      className="btn btn-secondary"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p>No reservations found.</p>
            )}
          </div>
        );
      case 'checkIn':
        return (
          <form onSubmit={handleCheckIn} className="reservation-form">
            <div className="mb-4">
              <label className="block text-sm font-medium">Reservation ID</label>
              <input
                name="reservationId"
                placeholder="Reservation ID"
                value={checkInForm.reservationId}
                onChange={handleCheckInChange}
                className="input"
                required
                type="number"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Check In
            </button>
          </form>
        );
      case 'checkOut':
        return (
          <div>
            <form onSubmit={handleCheckOut} className="reservation-form mb-6">
              <div className="mb-4">
                <label className="block text-sm font-medium">Reservation ID</label>
                <input
                  name="reservationId"
                  placeholder="Reservation ID"
                  value={checkOutForm.reservationId}
                  onChange={handleCheckOutChange}
                  className="input"
                  required
                  type="number"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Payment Method</label>
                <select
                  name="paymentMethod"
                  value={checkOutForm.paymentMethod}
                  onChange={handleCheckOutChange}
                  className="input"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Optional Charges</label>
                <input
                  name="optionalCharges"
                  type="number"
                  placeholder="Optional Charges"
                  value={checkOutForm.optionalCharges}
                  onChange={handleCheckOutChange}
                  className="input"
                  min="0"
                  step="0.01"
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Check Out
              </button>
            </form>
            {latestBill && (
              <div className="reservation-form">
                <h3 className="text-lg font-bold mb-4">Bill Details</h3>
                <div className="overflow-x-auto">
                  <table className="table-auto w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-2">Bill ID</th>
                        <th className="px-4 py-2">Reservation ID</th>
                        <th className="px-4 py-2">Amount</th>
                        <th className="px-4 py-2">Payment Method</th>
                        <th className="px-4 py-2">Billing Date</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2">Optional Charges</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="px-4 py-2">{latestBill.id}</td>
                        <td className="px-4 py-2">{latestBill.reservationId}</td>
                        <td className="px-4 py-2">${latestBill.amount.toFixed(2)}</td>
                        <td className="px-4 py-2">{latestBill.paymentMethod.replace('_', ' ')}</td>
                        <td className="px-4 py-2">{latestBill.billingDate}</td>
                        <td className="px-4 py-2">{latestBill.status}</td>
                        <td className="px-4 py-2">${latestBill.optionalCharges ? latestBill.optionalCharges.toFixed(2) : '0.00'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      case 'cancel':
        return (
          <div className="reservation-form">
            <div className="mb-4">
              <label className="block text-sm font-medium">Reservation ID</label>
              <input
                placeholder="Reservation ID"
                value={cancelId}
                onChange={handleCancelChange}
                className="input"
                type="number"
              />
            </div>
            <button onClick={handleCancelReservation} className="btn btn-danger">
              Cancel Reservation
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="customer-dashboard">
      {loading && <Loading />}
      <div className="sidebar">
        <h2 className="text-xl font-bold mb-4">Reservation Management</h2>
        <button
          className={`sidebar-btn ${activeTab === 'reservations' ? 'active' : ''}`}
          onClick={() => setActiveTab('reservations')}
        >
          My Reservations
        </button>
        <button
          className={`sidebar-btn ${activeTab === 'checkIn' ? 'active' : ''}`}
          onClick={() => setActiveTab('checkIn')}
        >
          Check In
        </button>
        <button
          className={`sidebar-btn ${activeTab === 'checkOut' ? 'active' : ''}`}
          onClick={() => setActiveTab('checkOut')}
        >
          Check Out
        </button>
        <button
          className={`sidebar-btn ${activeTab === 'cancel' ? 'active' : ''}`}
          onClick={() => setActiveTab('cancel')}
        >
          Cancel Reservation
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

export default CustomerDashboard;