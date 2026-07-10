import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const ProtectedRoute = ({ allowedRoles, children }: { allowedRoles: string[], children: React.ReactNode }) => {
  let { currentUser } = useApp();
  const location = useLocation();

  if (!currentUser) {
    const stored = localStorage.getItem('user') || localStorage.getItem('h_current_user');
    if (stored) {
      try { currentUser = JSON.parse(stored); } catch {}
    }
  }

  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

  // Verify JWT exists and User is logged in
  if (!currentUser || !token) {
    return <Navigate to="/401" state={{ from: location }} replace />;
  }

  // Verify User role matches allowed roles
  if (!allowedRoles.includes(currentUser.role)) {
    // Prevent URL Manipulation: Automatically redirect to correct dashboard
    if (currentUser.role === 'customer') return <Navigate to="/customer/dashboard" replace />;
    if (currentUser.role === 'provider') return <Navigate to="/provider/dashboard" replace />;
    if (currentUser.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    
    // Fallback just in case
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};
