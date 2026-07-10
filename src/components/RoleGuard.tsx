import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const RoleGuard = ({ allowedRoles, children }: { allowedRoles: string[], children: React.ReactNode }) => {
  let { currentUser } = useApp();
  const location = useLocation();

  if (!currentUser) {
    const stored = localStorage.getItem('user') || localStorage.getItem('h_current_user');
    if (stored) {
      try { currentUser = JSON.parse(stored); } catch {}
    }
  }

  // If still no user, they are unauthorized
  if (!currentUser) {
    return <Navigate to="/401" state={{ from: location }} replace />;
  }

  // Check role
  if (!allowedRoles.includes(currentUser.role)) {
    // Role mismatch means forbidden / access denied
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};
