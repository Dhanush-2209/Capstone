import React from 'react';
import { useNavigate } from 'react-router-dom';
import './dashboard.css'; // Reuse the same CSS for consistency

const AdminHome = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');

  const handleLogout = () => {
    // Clear user information from local storage
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    
    // Redirect to the login page
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Admin Home</h1>
        <div className="user-info">
          <div className="user-details">
            {/* Ensure Username and User ID are vertically aligned */}
            <span className="user-name-label">Username: {userName}</span>
            <br />
            <span className="user-id-label">User ID: {userId}</span>
          </div>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>
      {/* Other admin homepage content goes here */}
    </div>
  );
};

export default AdminHome;
