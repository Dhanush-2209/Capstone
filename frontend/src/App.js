// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/login'; 
import Signup from './components/signup'; 
import Dashboard from './components/dashboard'; 
import AdminDashboard from './components/adminHome'; 
import PrivateRoute from './components/privateRoute'; 
import About from './components/about';
function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Signup />} />
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