// import React, { useState } from "react";
// import axios from "axios";
// import "./RoomDashboard.css";

// const RoomDashboard = () => {
//   const [roomData, setRoomData] = useState({
//     name: "",
//     type: "",
//     capacity: "",
//     price: "",
//   });
//   const [message, setMessage] = useState("");

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setRoomData({ ...roomData, [name]: value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post("http://localhost:8040/api/rooms", roomData, {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });
//       setMessage(`Room "${response.data.name}" added successfully!`);
//       setRoomData({ name: "", type: "", capacity: "", price: "" });
//     } catch (error) {
//       console.error("Error adding room:", error);
//       setMessage("Failed to add room. Please check the input and try again.");
//     }
//   };

//   return (
//     <div className="dashboard-container">
//       <h2 className="dashboard-title">Add New Room</h2>
//       <form className="room-form" onSubmit={handleSubmit}>
//         <label>
//           Name:
//           <input
//             type="text"
//             name="name"
//             value={roomData.name}
//             onChange={handleChange}
//             required
//           />
//         </label>
//         <label>
//           Type:
//           <input
//             type="text"
//             name="type"
//             value={roomData.type}
//             onChange={handleChange}
//             required
//           />
//         </label>
//         <label>
//           Capacity:
//           <input
//             type="number"
//             name="capacity"
//             value={roomData.capacity}
//             onChange={handleChange}
//             required
//             min="1"
//           />
//         </label>
//         <label>
//           Price:
//           <input
//             type="number"
//             name="price"
//             value={roomData.price}
//             onChange={handleChange}
//             required
//             min="0"
//             step="0.01"
//           />
//         </label>
//         <button type="submit" className="submit-btn">Add Room</button>
//       </form>
//       {message && <p className="message">{message}</p>}
//     </div>
//   );
// };

// export default RoomDashboard;


import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./RoomDashboard.css";

const RoomDashboard = () => {
  const [roomData, setRoomData] = useState({
    name: "",
    type: "",
    capacity: "",
    price: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || user?.role?.toLowerCase() !== 'admin') {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoomData({ ...roomData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await axios.post(
        "http://localhost:8040/api/rooms",
        roomData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage(`Room "${response.data.name}" added successfully!`);
      setRoomData({ name: "", type: "", capacity: "", price: "" });
    } catch (error) {
      console.error("Error adding room:", error);
      setMessage("Failed to add room. Please check the input and try again.");
    }
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Add New Room</h2>
      <form className="room-form" onSubmit={handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={roomData.name}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Type:
          <input
            type="text"
            name="type"
            value={roomData.type}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Capacity:
          <input
            type="number"
            name="capacity"
            value={roomData.capacity}
            onChange={handleChange}
            required
            min="1"
          />
        </label>
        <label>
          Price:
          <input
            type="number"
            name="price"
            value={roomData.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
          />
        </label>
        <button type="submit" className="submit-btn">Add Room</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default RoomDashboard;

