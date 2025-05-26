import React from 'react';
import './Loading.css';
import logo from '../assets/StayMaster-removebg-preview.png'; // Replace with your image path

function Loading() {
  return (
    <div className="loading-container">
      <img src={logo} alt="StayMaster Logo" className="loading-logo" />
      <div className="spinner"></div>
      <p className="loading-text">Loading StayMaster...</p>
    </div>
  );
}

export default Loading;
