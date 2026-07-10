import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  BellRing,
  Clock,
  CheckCircle,
  MapPin,
  IndianRupee,
  User,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ProviderLayout: React.FC = () => {
  const { logout, currentUser, setCurrentUser } = useApp();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/provider/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'New Service Requests', path: '/provider/requests', icon: <BellRing className="w-5 h-5" /> },
    { name: 'Ongoing Jobs', path: '/provider/ongoing-jobs', icon: <Clock className="w-5 h-5" /> },
    { name: 'Completed Jobs', path: '/provider/completed-jobs', icon: <CheckCircle className="w-5 h-5" /> },
    { name: 'Live Tracking', path: '/provider/live-tracking', icon: <MapPin className="w-5 h-5" /> },
    { name: 'Earnings', path: '/provider/earnings', icon: <IndianRupee className="w-5 h-5" /> },
    { name: 'Profile', path: '/provider/profile', icon: <User className="w-5 h-5" /> },
    { name: 'Settings', path: '/provider/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  if (!currentUser || currentUser.role !== 'provider') {
    return null; // The protected route will handle the redirect
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-6 px-4 bg-bg-card border-r border-border-primary dark:bg-charcoal dark:border-border-primary shadow-sm">
      <div className="flex items-center gap-3 mb-8 px-2">
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-10 h-10 rounded-full border-2 border-primary object-cover"
        />
        <div>
          <h3 className="font-bold text-primary-text text-sm">{currentUser.name}</h3>
          <p className="text-xs text-secondary-text font-medium text-primary">Provider</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                isActive
                  ? 'bg-primary/10 text-primary-dark dark:text-primary'
                  : 'text-secondary-text hover:bg-bg-secondary hover:text-primary-text'
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div className="mt-6 mb-4 px-3 border-t border-border-primary pt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-primary-text">Availability</span>
          <button
            onClick={() => {
               // Assuming setCurrentUser is available from useApp
               if (currentUser) {
                  // For a real app, you would make an API call to PUT /api/provider/availability
                  setCurrentUser({ ...currentUser, isOnline: !currentUser.isOnline });
               }
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${currentUser.isOnline ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${currentUser.isOnline ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
        <p className="text-[10px] text-secondary-text mt-1.5">
          {currentUser.isOnline ? 'You are receiving new requests.' : 'You are currently offline.'}
        </p>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 mt-auto rounded-lg text-rose-500 hover:bg-rose-500/10 transition-all text-sm font-medium"
      >
        <LogOut className="w-5 h-5" />
        Logout
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-bg-secondary dark:bg-bg-card">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 fixed inset-y-0 top-[72px] z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-4 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition-all"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-72 z-50 lg:hidden top-[72px]"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 w-full">
        <div className="h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
