import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import Loading from './Loading';
import 'react-toastify/dist/ReactToastify.css';
import './RoomDashboard.css';

const RoomDashboard = () => {
  const [activeTab, setActiveTab] = useState('add');
  const [form, setForm] = useState({
    roomNumber: '',
    roomType: 'STANDARD',
    pricePerNight: '',
    maxOccupants: '',
    isAvailable: true,
    id: '',
  });
  const [rooms, setRooms] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [searchId, setSearchId] = useState('');
  const [roomDetails, setRoomDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const ROOM_TYPES = ['STANDARD', 'SUITE', 'RESIDENTIAL_SUITE'];

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || user?.role?.toLowerCase() !== 'admin') {
      toast.error('Unauthorized access. Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [navigate]);

  // Form input handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  // Reset form
  const resetForm = () => {
    setForm({
      roomNumber: '',
      roomType: 'STANDARD',
      pricePerNight: '',
      maxOccupants: '',
      isAvailable: true,
      id: '',
    });
  };

  // Validate form
  const validateForm = (isUpdate = false) => {
    if (!isUpdate && !form.roomNumber) {
      toast.error('Room number is required');
      return false;
    }
    if (!form.roomType) {
      toast.error('Room type is required');
      return false;
    }
    if (!form.pricePerNight || form.pricePerNight <= 0) {
      toast.error('Price per night must be positive');
      return false;
    }
    if (!form.maxOccupants || form.maxOccupants < 1) {
      toast.error('Max occupants must be at least 1');
      return false;
    }
    if (isUpdate && !form.id) {
      toast.error('Room ID is required for update');
      return false;
    }
    return true;
  };

  // API Calls
  const addRoom = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8040/api/rooms', form, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success(`Room "${response.data.roomNumber}" added successfully!`);
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add room');
    } finally {
      setLoading(false);
    }
  };

  const updateRoom = async (e) => {
    e.preventDefault();
    if (!validateForm(true)) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:8040/api/rooms/${form.id}`, form, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success(`Room "${response.data.roomNumber}" updated successfully!`);
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update room');
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async () => {
    if (!searchId) {
      toast.error('Room ID is required');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8040/api/rooms/${searchId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success('Room deleted successfully');
      setSearchId('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete room');
    } finally {
      setLoading(false);
    }
  };

  const getAllRooms = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8040/api/rooms', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRooms(response.data);
      toast.success('Rooms fetched successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const getRoomById = async () => {
    if (!searchId) {
      toast.error('Room ID is required');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8040/api/rooms/${searchId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRoomDetails(response.data);
      toast.success('Room details fetched successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch room');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableRooms = async (roomType) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8040/api/rooms/available?roomType=${roomType}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAvailableRooms(response.data);
      toast.success(`Available ${roomType.replace('_', ' ')} rooms fetched successfully`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch available rooms');
    } finally {
      setLoading(false);
    }
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'add':
        return (
          <form onSubmit={addRoom} className="room-form">
            <div className="mb-4">
              <label className="block text-sm font-medium">Room Number</label>
              <input
                name="roomNumber"
                placeholder="Room Number"
                value={form.roomNumber}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Room Type</label>
              <select
                name="roomType"
                value={form.roomType}
                onChange={handleChange}
                className="input"
              >
                {ROOM_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Price Per Night</label>
              <input
                name="pricePerNight"
                type="number"
                placeholder="Price Per Night"
                value={form.pricePerNight}
                onChange={handleChange}
                className="input"
                required
                min="0.01"
                step="0.01"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Max Occupants</label>
              <input
                name="maxOccupants"
                type="number"
                placeholder="Max Occupants"
                value={form.maxOccupants}
                onChange={handleChange}
                className="input"
                required
                min="1"
              />
            </div>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={form.isAvailable}
                  onChange={handleChange}
                  className="mr-2"
                />
                Available
              </label>
            </div>
            <button type="submit" className="btn btn-primary">
              Add Room
            </button>
          </form>
        );
      case 'update':
        return (
          <form onSubmit={updateRoom} className="room-form">
            <div className="mb-4">
              <label className="block text-sm font-medium">Room ID</label>
              <input
                name="id"
                placeholder="Room ID"
                value={form.id}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Room Number</label>
              <input
                name="roomNumber"
                placeholder="Room Number"
                value={form.roomNumber}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Room Type</label>
              <select
                name="roomType"
                value={form.roomType}
                onChange={handleChange}
                className="input"
              >
                {ROOM_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Price Per Night</label>
              <input
                name="pricePerNight"
                type="number"
                placeholder="Price Per Night"
                value={form.pricePerNight}
                onChange={handleChange}
                className="input"
                min="0.01"
                step="0.01"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Max Occupants</label>
              <input
                name="maxOccupants"
                type="number"
                placeholder="Max Occupants"
                value={form.maxOccupants}
                onChange={handleChange}
                className="input"
                min="1"
              />
            </div>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={form.isAvailable}
                  onChange={handleChange}
                  className="mr-2"
                />
                Available
              </label>
            </div>
            <button type="submit" className="btn btn-primary">
              Update Room
            </button>
          </form>
        );
      case 'delete':
        return (
          <div className="room-form">
            <div className="mb-4">
              <label className="block text-sm font-medium">Room ID</label>
              <input
                placeholder="Room ID"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="input"
              />
            </div>
            <button onClick={deleteRoom} className="btn btn-danger">
              Delete Room
            </button>
          </div>
        );
      case 'getAll':
        return (
          <div>
            <button onClick={getAllRooms} className="btn btn-primary mb-4">
              Fetch All Rooms
            </button>
            {rooms.length > 0 && (
              <div className="overflow-x-auto">
                <table className="table-auto w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2">ID</th>
                      <th className="px-4 py-2">Room Number</th>
                      <th className="px-4 py-2">Type</th>
                      <th className="px-4 py-2">Price/Night</th>
                      <th className="px-4 py-2">Max Occupants</th>
                      <th className="px-4 py-2">Available</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((room) => (
                      <tr key={room.id} className="border-b">
                        <td className="px-4 py-2">{room.id}</td>
                        <td className="px-4 py-2">{room.roomNumber}</td>
                        <td className="px-4 py-2">{room.roomType.replace('_', ' ')}</td>
                        <td className="px-4 py-2">${room.pricePerNight}</td>
                        <td className="px-4 py-2">{room.maxOccupants}</td>
                        <td className="px-4 py-2">{room.isAvailable ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      case 'getById':
        return (
          <div className="room-form">
            <div className="mb-4">
              <label className="block text-sm font-medium">Room ID</label>
              <input
                placeholder="Room ID"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="input"
              />
            </div>
            <button onClick={getRoomById} className="btn btn-primary">
              Fetch Room
            </button>
            {roomDetails && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p><strong>ID:</strong> {roomDetails.id}</p>
                <p><strong>Room Number:</strong> {roomDetails.roomNumber}</p>
                <p><strong>Type:</strong> {roomDetails.roomType.replace('_', ' ')}</p>
                <p><strong>Price/Night:</strong> ${roomDetails.pricePerNight}</p>
                <p><strong>Max Occupants:</strong> {roomDetails.maxOccupants}</p>
                <p><strong>Available:</strong> {roomDetails.isAvailable ? 'Yes' : 'No'}</p>
              </div>
            )}
          </div>
        );
      case 'available':
        return (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Room Type</label>
              <select
                onChange={(e) => getAvailableRooms(e.target.value)}
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
            {availableRooms.length > 0 && (
              <div className="overflow-x-auto">
                <table className="table-auto w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2">ID</th>
                      <th className="px-4 py-2">Room Number</th>
                      <th className="px-4 py-2">Type</th>
                      <th className="px-4 py-2">Price/Night</th>
                      <th className="px-4 py-2">Max Occupants</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableRooms.map((room) => (
                      <tr key={room.id} className="border-b">
                        <td className="px-4 py-2">{room.id}</td>
                        <td className="px-4 py-2">{room.roomNumber}</td>
                        <td className="px-4 py-2">{room.roomType.replace('_', ' ')}</td>
                        <td className="px-4 py-2">${room.pricePerNight}</td>
                        <td className="px-4 py-2">{room.maxOccupants}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="room-dashboard">
      {loading && <Loading />}
      <div className="sidebar">
        <h2 className="text-xl font-bold mb-4">Room Management</h2>
        <button
          className={`sidebar-btn ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          Add Room
        </button>
        <button
          className={`sidebar-btn ${activeTab === 'update' ? 'active' : ''}`}
          onClick={() => setActiveTab('update')}
        >
          Update Room
        </button>
        <button
          className={`sidebar-btn ${activeTab === 'delete' ? 'active' : ''}`}
          onClick={() => setActiveTab('delete')}
        >
          Delete Room
        </button>
        <button
          className={`sidebar-btn ${activeTab === 'getAll' ? 'active' : ''}`}
          onClick={() => setActiveTab('getAll')}
        >
          All Rooms
        </button>
        <button
          className={`sidebar-btn ${activeTab === 'getById' ? 'active' : ''}`}
          onClick={() => setActiveTab('getById')}
        >
          Room by ID
        </button>
        <button
          className={`sidebar-btn ${activeTab === 'available' ? 'active' : ''}`}
          onClick={() => setActiveTab('available')}
        >
          Available Rooms
        </button>
      </div>
      <div className="content">
        <h2 className="text-2xl font-bold mb-4">
          {activeTab.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())} Room
        </h2>
        {renderTabContent()}
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default RoomDashboard;