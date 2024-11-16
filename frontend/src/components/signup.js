// src/components/Signup.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './signup.css';
import Scroll from './scroll'; 

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    userType: 'USER', // Default user type
  });

  const [monitoringData, setMonitoringData] = useState({
    userId: '',
    monitoringPassword: '',
  });

  const [errorMessage, setErrorMessage] = useState(''); // Error message state
  const [successMessage, setSuccessMessage] = useState(''); // Success message state

  // Handle signup form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle parental monitoring form input changes
  const handleMonitoringChange = (e) => {
    const { name, value } = e.target;
    setMonitoringData({ ...monitoringData, [name]: value });
  };

  // Change user type (USER / ADMIN)
  const handleUserTypeChange = (type) => {
    setFormData({ ...formData, userType: type });
  };

  // Handle signup form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Reset error message on submit
    setSuccessMessage(''); // Reset success message

    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', formData);
      console.log('Signup successful:', response.data);
      setSuccessMessage('Signup successful! You can now log in.');
    } catch (error) {
      const message =
        error.response?.data?.error || 'An unexpected error occurred. Please try again.';
      setErrorMessage(message); // Set extracted error message to state
      console.error('Error during signup:', message);
    }
  };

  // Handle parental monitoring form submission
  const handleMonitoringSubmit = (e) => {
    e.preventDefault();
    console.log('Parental Monitoring submitted:', monitoringData);
    // You can implement actual monitoring logic here.
    setSuccessMessage('Parental monitoring access granted successfully.');
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h2>Sign Up</h2>

        {/* User Type Selection (USER / ADMIN) */}
        <div className="user-type-container">
          <div
            className={`user-type-button ${formData.userType === 'USER' ? 'active' : ''}`}
            onClick={() => handleUserTypeChange('USER')}
          >
            USER
          </div>
          <div
            className={`user-type-button ${formData.userType === 'ADMIN' ? 'active' : ''}`}
            onClick={() => handleUserTypeChange('ADMIN')}
          >
            ADMIN
          </div>
          <div className={`indicator ${formData.userType}`} />
        </div>

        {/* Display error or success messages */}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        {/* Signup Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              Name:
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </label>
          </div>
          <div className="form-group">
            <label>
              Email:
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </label>
          </div>
          <div className="form-group">
            <label>
              Password:
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </label>
          </div>
          <button type="submit">Submit</button>
        </form>

        <p>
          Already registered? <Link to="/login">Login</Link>
        </p>
      </div>

      {/* Parental Monitoring Section */}
      <div className="monitoring-container">
        <h2>Parental Monitoring</h2>
        <form onSubmit={handleMonitoringSubmit}>
          <div className="form-group">
            <label>
              User ID:
              <input
                type="text"
                name="userId"
                value={monitoringData.userId}
                onChange={handleMonitoringChange}
                required
              />
            </label>
          </div>
          <div className="form-group">
            <label>
              Password:
              <input
                type="password"
                name="monitoringPassword"
                value={monitoringData.monitoringPassword}
                onChange={handleMonitoringChange}
                required
              />
            </label>
          </div>
          <button type="submit">Submit</button>
        </form>
      </div>

      <Scroll />
    </div>
  );
};

export default Signup;
