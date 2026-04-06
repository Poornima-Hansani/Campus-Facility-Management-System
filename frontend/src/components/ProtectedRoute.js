import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  
  // ✅ Safe JSON parse
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem('user')) || {};
  } catch {
    user = {};
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 🔥 Role-based protection with safer redirect
  if (role && user?.role !== role) {
    return <Navigate to="/" replace />; // safer than /login to prevent infinite loops
  }

  return children;
};

export default ProtectedRoute;
