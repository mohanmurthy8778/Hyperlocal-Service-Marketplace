import React from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

export const Unauthorized = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <Lock className="h-24 w-24 text-primary mb-6" />
      <h1 className="text-4xl font-black text-primary-text mb-2">401 Unauthorized</h1>
      <p className="text-lg text-secondary-text mb-8 max-w-md">
        Please log in to access this page. Your session may have expired.
      </p>
      <Link 
        to="/login"
        className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all"
      >
        Sign In
      </Link>
    </div>
  );
};
