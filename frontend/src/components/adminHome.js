import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './adminHome.css'; // Reuse the same CSS for consistency

const AdminHome = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');

  // State for current date and time
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const formattedDate = now.toLocaleDateString(); // Get date
      const formattedTime = now.toLocaleTimeString(); // Get time
      setCurrentDate(formattedDate);
      setCurrentTime(formattedTime);
    };

    // Update date and time every second
    const interval = setInterval(updateDateTime, 1000);
    updateDateTime(); // Initial call

    return () => clearInterval(interval); // Clear interval on unmount
  }, []);

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
        <div className="header-left">
          <div className="date-time-container">
            <span className="current-date">{currentDate}</span>
            <span className="current-time">{currentTime}</span>
          </div>
        </div>
        <div className="header-right">
          <div className="user-info">
            <div className="user-details">
              <span className="user-name-label">Username: {userName}</span>
              <span className="user-id-label">User ID: {userId}</span>
            </div>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
        </div>
      </header>
      {/* Other admin homepage content goes here */}
    </div>
  );
};

export default AdminHome;
