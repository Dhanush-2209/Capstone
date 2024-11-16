// src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

// PrivateRoute Component
const PrivateRoute = ({ element: Component, userType }) => {
    const token = localStorage.getItem('token');
    const storedUserType = localStorage.getItem('userType');
  
    if (!token || storedUserType !== userType) {
      return <Navigate to="/login" replace />;
    }
  
    return <Component />;
  };
  

export default PrivateRoute;
