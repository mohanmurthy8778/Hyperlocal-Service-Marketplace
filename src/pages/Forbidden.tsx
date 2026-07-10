import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Forbidden = () => {
  const { currentUser } = useApp();
  
  const getDashboardLink = () => {
    if (!currentUser) return '/login';
    if (currentUser.role === 'admin') return '/admin';
    if (currentUser.role === 'provider') return '/provider';
    return '/customer';
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <ShieldAlert className="h-24 w-24 text-rose-500 mb-6" />
      <h1 className="text-4xl font-black text-primary-text mb-2">403 Access Denied</h1>
      <p className="text-lg text-secondary-text mb-8 max-w-md">
        You are not authorized to access this page. Please return to your designated dashboard.
      </p>
      <Link 
        to={getDashboardLink()}
        className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all"
      >
        <ArrowLeft className="h-5 w-5" />
        Return to Dashboard
      </Link>
    </div>
  );
};
