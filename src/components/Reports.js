import React, { useState } from "react";
import axios from "axios";
import "./Reports.css"; // optional: for styling

const Reports = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [occupancyData, setOccupancyData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    setError("");
    const token = localStorage.getItem("token");

    try {
      const occupancyRes = await axios.get(
        `http://localhost:8040/api/reports/occupancy?date=${selectedDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const revenueRes = await axios.get(
        `http://localhost:8040/api/reports/revenue?date=${selectedDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOccupancyData(occupancyRes.data);
      setRevenueData(revenueRes.data);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Failed to fetch report data. Make sure you're logged in as ADMIN.");
    }
  };

  return (
    <div className="report-container">
      <h2>Generate Reports</h2>
      <div className="input-section">
        <label>
          Select Date:
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </label>
        <button onClick={fetchReports} disabled={!selectedDate}>
          Get Reports
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {occupancyData && (
        <div className="report-block">
          <h3>Occupancy Report - {occupancyData.date}</h3>
          <p>Total Occupied Rooms: {occupancyData.totalOccupancy}</p>
        </div>
      )}

      {revenueData && (
        <div className="report-block">
          <h3>Revenue Report - {revenueData.date}</h3>
          <p>Total Revenue: ${revenueData.totalRevenue.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
};

export default Reports;