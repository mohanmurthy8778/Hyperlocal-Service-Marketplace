import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const CustomerRoute = ({ children }: { children: React.ReactNode }) => {
  let { currentUser } = useApp();
  const location = useLocation();

  if (!currentUser) {
    const stored = localStorage.getItem('user') || localStorage.getItem('h_current_user');
    if (stored) {
      try { currentUser = JSON.parse(stored); } catch {}
    }
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (currentUser.role !== 'customer') {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};

export const ProviderRoute = ({ children }: { children: React.ReactNode }) => {
  let { currentUser } = useApp();
  const location = useLocation();

  if (!currentUser) {
    const stored = localStorage.getItem('user') || localStorage.getItem('h_current_user');
    if (stored) {
      try { currentUser = JSON.parse(stored); } catch {}
    }
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (currentUser.role !== 'provider') {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  let { currentUser } = useApp();
  const location = useLocation();

  if (!currentUser) {
    const stored = localStorage.getItem('user') || localStorage.getItem('h_current_user');
    if (stored) {
      try { currentUser = JSON.parse(stored); } catch {}
    }
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (currentUser.role !== 'admin') {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};

export const AuthenticatedRoute = ({ children }: { children: React.ReactNode }) => {
  let { currentUser } = useApp();
  const location = useLocation();

  if (!currentUser) {
    const stored = localStorage.getItem('user') || localStorage.getItem('h_current_user');
    if (stored) {
      try { currentUser = JSON.parse(stored); } catch {}
    }
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
