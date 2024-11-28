import React, { useEffect } from 'react'; // Make sure React is imported
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/login'; 
import Signup from './components/signup'; 
import Dashboard from './components/dashboard'; 
import AdminDashboard from './components/adminHome'; 
import PrivateRoute from './components/privateRoute'; 
import About from './components/about';
import LandingPage from './components/LandingPage'; // Import the LandingPage component
import NotificationComponent from './components/services/NotificationComponent'; // Import the NotificationComponent
import AutoAlarmNotification from './components/services/AutoAlarmNotificationComponent'; // Import the AutoAlarmNotificationComponent

function App() {
  useEffect(() => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notification permission granted');
        }
      });
    }
  }, []);

  return (
    <Router>
      {/* Render NotificationComponent globally */}
      <NotificationComponent />
      <AutoAlarmNotification />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/about" element={<About />} />
        
        {/* Protected Routes using PrivateRoute */}
        <Route 
          path="/dashboard" 
          element={<PrivateRoute element={Dashboard} userType="USER" />} 
        />
        <Route 
          path="/admin-dashboard" 
          element={<PrivateRoute element={AdminDashboard} userType="ADMIN" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
