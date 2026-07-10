import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AccessDenied = () => {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  
  const getDashboardLink = () => {
    if (!currentUser) return '/login';
    if (currentUser.role === 'admin') return '/admin/dashboard';
    if (currentUser.role === 'provider') return '/provider/dashboard';
    return '/customer/dashboard';
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <ShieldAlert className="h-24 w-24 text-rose-500 mb-6" />
      <h1 className="text-4xl font-black text-primary-text mb-2">403 Access Denied</h1>
      <p className="text-lg text-secondary-text mb-8 max-w-md">
        You don't have permission to access this page.
      </p>
      <div className="flex gap-4">
        <Link 
          to={getDashboardLink()}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all"
        >
          <ArrowLeft className="h-5 w-5" />
          Return to Dashboard
        </Link>
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-6 py-3 border border-border-primary text-secondary-text font-bold rounded-xl hover:bg-bg-card transition-all"
        >
          <Home className="h-5 w-5" />
          Go Home
        </button>
      </div>
    </div>
  );
};
