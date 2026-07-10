import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Menu, X, Sun, Moon, User, Settings, LogOut, 
  Sparkles, Bell, Heart, Activity, Calendar, Shield, Briefcase, ChevronDown, Globe, MapPin, CreditCard, IndianRupee, Users, LayoutDashboard, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../utils/translations';

import { Logo } from './Logo';

export const Navbar: React.FC = () => {
  const { currentUser, theme, toggleTheme, logout, notifications, language, setLanguage } = useApp();
  const { t } = useTranslation(language);
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);

  const unreadNotificationsCount = notifications.filter(
    n => n.userId === currentUser?.id && !n.read
  ).length;

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate('/login');
  };

  const menuItems = [
    { label: t('home'), path: '/' },
    { label: t('services'), path: '/services' },
    { label: t('categories'), path: '/categories' },
    { label: t('aboutUs'), path: '/about' },
    { label: t('contact'), path: '/contact' },
    { label: t('faqs'), path: '/faq' },
  ];

  const getDashboardPath = () => {
    if (!currentUser) return '/login';
    if (currentUser.role === 'admin') return '/admin';
    if (currentUser.role === 'provider') return '/provider';
    return '/customer';
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border-primary bg-bg-card/90 backdrop-blur-md dark:border-border-primary dark:bg-charcoal/90 shadow-sm transition-all duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[72px] items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" id="navbar-logo" className="flex items-center gap-2 group">
            <Logo className="w-12 h-12 transition-transform duration-300 group-hover:scale-105" />
            <span className="text-2xl font-black tracking-tight text-primary-text flex items-center">
              Service<span className="text-[#DCA543]">Hub</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative py-1 text-sm font-semibold transition-all duration-200 group ${
                    isActive
                      ? 'text-primary-text font-bold'
                      : 'text-secondary-text hover:text-primary-text dark:text-[#D8C9BA] dark:hover:text-white'
                  }`}
                  id={`nav-link-${item.label.toLowerCase().replace(' ', '-')}`}
                >
                  <span>{item.label}</span>
                  {isActive ? (
                    <motion.div
                      layoutId="active-nav-underline"
                      className="absolute bottom-[-14px] left-0 right-0 h-[3px] bg-primary rounded-full"
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    />
                  ) : (
                    <span className="absolute bottom-[-14px] left-0 right-0 h-[3px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Navigation Controls */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="p-2 rounded-lg text-secondary-text hover:text-primary-text dark:hover:text-white hover:bg-bg-secondary dark:hover:bg-bg-secondary dark:bg-bg-card transition-all flex items-center gap-1"
                id="language-select-btn"
                title="Select Language"
              >
                <Globe className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase">{language}</span>
              </button>
              <AnimatePresence>
                {isLangOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsLangOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-32 rounded-xl border border-border-primary bg-bg-card p-1.5 shadow-xl dark:border-border-primary dark:bg-charcoal z-20"
                    >
                      <button
                        onClick={() => { setLanguage('en'); setIsLangOpen(false); }}
                        className={`w-full text-left px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-bg-secondary dark:hover:bg-bg-secondary dark:bg-bg-card border-border-primary ${language === 'en' ? 'text-primary font-bold bg-primary/5' : 'text-secondary-text'}`}
                      >
                        English
                      </button>
                      <button
                        onClick={() => { setLanguage('ta'); setIsLangOpen(false); }}
                        className={`w-full text-left px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-bg-secondary dark:hover:bg-bg-secondary dark:bg-bg-card border-border-primary ${language === 'ta' ? 'text-primary font-bold bg-primary/5' : 'text-secondary-text'}`}
                      >
                        தமிழ்
                      </button>
                      <button
                        onClick={() => { setLanguage('hi'); setIsLangOpen(false); }}
                        className={`w-full text-left px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-bg-secondary dark:hover:bg-bg-secondary dark:bg-bg-card border-border-primary ${language === 'hi' ? 'text-primary font-bold bg-primary/5' : 'text-secondary-text'}`}
                      >
                        हिन्दी
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            

            {/* User Account Controls */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                {/* Notifications Link */}
                <Link
                  to={currentUser.role === 'customer' ? '/customer/notifications' : currentUser.role === 'provider' ? '/provider/notifications' : '/admin'}
                  className="relative p-2 rounded-lg text-secondary-text hover:text-primary-text dark:hover:text-white hover:bg-bg-secondary dark:hover:bg-bg-secondary dark:bg-bg-card transition-all"
                  title="Notifications"
                >
                  <Bell className="h-4.5 w-4.5" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </Link>

                {/* Profile Dropdown Trigger */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1 rounded-full border border-border-primary hover:border-border-primary dark:hover:border-border-primary bg-bg-secondary/50 dark:bg-bg-card/50 hover:bg-bg-secondary/50 dark:hover:bg-bg-secondary dark:bg-bg-card border-border-primary/50 transition-all"
                    id="profile-dropdown-trigger"
                  >
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="h-8 w-8 rounded-full object-cover border border-white dark:border-border-primary shadow-sm"
                    />
                    <div className="text-left pr-2 hidden lg:block">
                      <p className="text-xs font-semibold text-primary-text leading-none">{currentUser.name}</p>
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wide">{currentUser.role}</span>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-52 rounded-xl border border-border-primary bg-bg-card p-1.5 shadow-xl dark:border-border-primary dark:bg-charcoal-light z-20"
                        >
                          <div className="px-3 py-2 border-b border-border-primary dark:border-border-primary mb-1">
                            <p className="text-xs font-semibold text-primary-text">{currentUser.name}</p>
                            <p className="text-[10px] text-secondary-text truncate">{currentUser.email}</p>
                          </div>

                          <Link
                            to={getDashboardPath()}
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-secondary-text rounded-lg hover:bg-bg-secondary dark:hover:bg-bg-secondary dark:bg-bg-card border-border-primary"
                          >
                            <User className="h-4 w-4" />
                            Dashboard
                          </Link>

                          {currentUser.role === 'customer' && (
                            <>
                              <Link to="/services" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-secondary-text rounded-lg hover:bg-bg-secondary dark:hover:bg-bg-secondary dark:bg-bg-card border-border-primary"><Briefcase className="h-4 w-4" />Services</Link>
                              <Link to="/customer/bookings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-secondary-text rounded-lg hover:bg-bg-secondary dark:hover:bg-bg-secondary dark:bg-bg-card border-border-primary"><Calendar className="h-4 w-4" />Bookings</Link>
                              <Link to="/customer/tracking/1" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-secondary-text rounded-lg hover:bg-bg-secondary dark:hover:bg-bg-secondary dark:bg-bg-card border-border-primary"><MapPin className="h-4 w-4" />Tracking</Link>
                              <Link to="/customer/payments" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-secondary-text rounded-lg hover:bg-bg-secondary dark:hover:bg-bg-secondary dark:bg-bg-card border-border-primary"><CreditCard className="h-4 w-4" />Payments</Link>
                              <Link to="/customer/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-secondary-text rounded-lg hover:bg-bg-secondary dark:hover:bg-bg-secondary dark:bg-bg-card border-border-primary"><User className="h-4 w-4" />Profile</Link>
                              <Link to="/customer/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-secondary-text rounded-lg hover:bg-bg-secondary dark:hover:bg-bg-secondary dark:bg-bg-card border-border-primary"><Settings className="h-4 w-4" />Settings</Link>
                            </>
                          )}
                          {currentUser.role === 'provider' && (
                            <>
                              <Link to="/provider/ongoing-jobs" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-secondary-text rounded-lg hover:bg-bg-secondary dark:hover:bg-bg-secondary dark:bg-bg-card border-border-primary"><Briefcase className="h-4 w-4" />Jobs</Link>
                              <Link to="/provider/bookings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-secondary-text rounded-lg hover:bg-bg-secondary dark:hover:bg-bg-secondary dark:bg-bg-card border-border-primary"><Calendar className="h-4 w-4" />Bookings</Link>
                              <Link to="/provider/live-tracking" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-secondary-text rounded-lg hover:bg-bg-secondary dark:hover:bg-bg-secondary dark:bg-bg-card border-border-primary"><MapPin className="h-4 w-4" />Tracking</Link>
                              <Link to="/provider/earnings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-secondary-text rounded-lg hover:bg-bg-secondary dark:hover:bg-bg-secondary dark:bg-bg-card border-border-primary"><IndianRupee className="h-4 w-4" />Earnings</Link>
                              <Link to="/provider/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-secondary-text rounded-lg hover:bg-bg-secondary dark:hover:bg-bg-secondary dark:bg-bg-card border-border-primary"><User className="h-4 w-4" />Profile</Link>
                              <Link to="/provider/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-secondary-text rounded-lg hover:bg-bg-secondary dark:hover:bg-bg-secondary dark:bg-bg-card border-border-primary"><Settings className="h-4 w-4" />Settings</Link>
                            </>
                          )}
                          {currentUser.role === 'admin' && (
                            <>
                              <Link to="/admin/users" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-secondary-text rounded-lg hover:bg-bg-secondary dark:hover:bg-bg-secondary dark:bg-bg-card border-border-primary"><Users className="h-4 w-4" />Users</Link>
                              <Link to="/admin/providers" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-secondary-text rounded-lg hover:bg-bg-secondary dark:hover:bg-bg-secondary dark:bg-bg-card border-border-primary"><User className="h-4 w-4" />Providers</Link>
                              <Link to="/admin/categories" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-secondary-text rounded-lg hover:bg-bg-secondary dark:hover:bg-bg-secondary dark:bg-bg-card border-border-primary"><LayoutDashboard className="h-4 w-4" />Categories</Link>
                              <Link to="/admin/bookings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-secondary-text rounded-lg hover:bg-bg-secondary dark:hover:bg-bg-secondary dark:bg-bg-card border-border-primary"><Calendar className="h-4 w-4" />Bookings</Link>
                              <Link to="/admin/payments" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-secondary-text rounded-lg hover:bg-bg-secondary dark:hover:bg-bg-secondary dark:bg-bg-card border-border-primary"><CreditCard className="h-4 w-4" />Payments</Link>
                              <Link to="/admin/reports" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-secondary-text rounded-lg hover:bg-bg-secondary dark:hover:bg-bg-secondary dark:bg-bg-card border-border-primary"><TrendingUp className="h-4 w-4" />Reports</Link>
                              <Link to="/admin/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-secondary-text rounded-lg hover:bg-bg-secondary dark:hover:bg-bg-secondary dark:bg-bg-card border-border-primary"><Settings className="h-4 w-4" />Settings</Link>
                            </>
                          )}
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20"
                          >
                            <LogOut className="h-4 w-4" />
                            Log Out
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-xl border border-border-primary text-sm font-semibold text-secondary-text hover:text-primary-text dark:hover:text-white hover:bg-bg-secondary dark:hover:bg-bg-secondary/50 dark:bg-bg-card/50 transition-all duration-200"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-hover shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all duration-300"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Icon */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-secondary-text hover:bg-bg-secondary dark:text-secondary-text dark:hover:bg-bg-secondary dark:bg-bg-card border-border-primary"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 rounded-lg text-secondary-text hover:bg-bg-secondary dark:text-secondary-text dark:hover:bg-bg-secondary dark:bg-bg-card border-border-primary"
              id="mobile-menu-btn"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border-primary bg-bg-card dark:border-border-primary dark:bg-charcoal px-4 pt-2 pb-6 space-y-2"
          >
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-secondary-text hover:bg-bg-secondary dark:hover:bg-bg-secondary dark:bg-bg-card"
              >
                {item.label}
              </Link>
            ))}

            <div className="border-t border-border-primary my-3 pt-3 px-3">
              <p className="text-[10px] font-bold text-secondary-text uppercase tracking-wider mb-2">Language / மொழி / भाषा</p>
              <div className="flex gap-2">
                <button
                  onClick={() => { setLanguage('en'); setIsOpen(false); }}
                  className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold border text-center ${language === 'en' ? 'border-primary text-white bg-primary' : 'border-border-primary text-secondary-text'}`}
                >
                  English
                </button>
                <button
                  onClick={() => { setLanguage('ta'); setIsOpen(false); }}
                  className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold border text-center ${language === 'ta' ? 'border-primary text-white bg-primary' : 'border-border-primary text-secondary-text'}`}
                >
                  தமிழ்
                </button>
                <button
                  onClick={() => { setLanguage('hi'); setIsOpen(false); }}
                  className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold border text-center ${language === 'hi' ? 'border-primary text-white bg-primary' : 'border-border-primary text-secondary-text'}`}
                >
                  हिन्दी
                </button>
              </div>
            </div>

            

            {currentUser ? (
              <div className="space-y-1 border-t border-border-primary pt-4">
                <div className="px-3 pb-2">
                  <p className="text-sm font-semibold text-primary-text">{currentUser.name}</p>
                  <p className="text-xs text-secondary-text">{currentUser.email}</p>
                </div>
                <Link
                  to={getDashboardPath()}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-secondary-text hover:bg-bg-secondary dark:hover:bg-bg-secondary dark:bg-bg-card"
                >
                  My Dashboard
                </Link>
                <button
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/10"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 border-t border-border-primary pt-4">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center px-4 py-2 rounded-lg border border-border-primary text-sm font-medium text-secondary-text hover:bg-bg-secondary dark:hover:bg-bg-secondary dark:bg-bg-card"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center px-4 py-2 rounded-lg text-sm font-bold text-charcoal bg-primary hover:bg-primary-hover"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
