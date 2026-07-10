import React from 'react';
import { useApp } from '../../context/AppContext';
import { Moon, Sun, Bell, Shield, Globe, LogOut, ArrowRight, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export const ProviderSettings = () => {
  const { logout, language, setLanguage, toast } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast('Logged out successfully', 'success');
    navigate('/provider/login');
  };

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-black text-primary-text mb-8">Provider Settings</h1>

      <div className="space-y-6">
        <div className="bg-bg-secondary dark:bg-bg-card border border-border-primary rounded-3xl overflow-hidden">
          <div className="p-4 border-b border-border-primary bg-bg-card/50">
            <h2 className="text-sm font-bold text-secondary-text uppercase tracking-wider">Account</h2>
          </div>
          <div className="divide-y divide-border-primary">
            <Link to="/provider/profile" className="flex items-center justify-between p-5 hover:bg-bg-card transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-xl text-primary"><User className="h-5 w-5" /></div>
                <div>
                  <h3 className="font-bold text-primary-text">Profile Information</h3>
                  <p className="text-xs text-secondary-text">Update your name, photo, and bio</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-secondary-text" />
            </Link>
          </div>
        </div>

        <div className="bg-bg-secondary dark:bg-bg-card border border-border-primary rounded-3xl overflow-hidden">
          <div className="p-4 border-b border-border-primary bg-bg-card/50">
            <h2 className="text-sm font-bold text-secondary-text uppercase tracking-wider">Preferences</h2>
          </div>
          <div className="divide-y divide-border-primary">
            <div className="flex items-center justify-between p-5 hover:bg-bg-card transition-colors cursor-pointer" onClick={toggleTheme}>
              <div className="flex items-center gap-4">
                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500"><Moon className="h-5 w-5" /></div>
                <div>
                  <h3 className="font-bold text-primary-text">Appearance</h3>
                  <p className="text-xs text-secondary-text">Toggle dark/light mode</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-secondary-text" />
            </div>
            <div className="flex items-center justify-between p-5 hover:bg-bg-card transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500"><Globe className="h-5 w-5" /></div>
                <div>
                  <h3 className="font-bold text-primary-text">Language</h3>
                  <p className="text-xs text-secondary-text">English (US)</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-secondary-text" />
            </div>
          </div>
        </div>

        <div className="bg-bg-secondary dark:bg-bg-card border border-border-primary rounded-3xl overflow-hidden">
          <div className="p-4 border-b border-border-primary bg-bg-card/50">
            <h2 className="text-sm font-bold text-secondary-text uppercase tracking-wider">Privacy & Security</h2>
          </div>
          <div className="divide-y divide-border-primary">
            <div className="flex items-center justify-between p-5 hover:bg-bg-card transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500"><Shield className="h-5 w-5" /></div>
                <div>
                  <h3 className="font-bold text-primary-text">Change Password</h3>
                  <p className="text-xs text-secondary-text">Update your security credentials</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-secondary-text" />
            </div>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold rounded-2xl transition-all"
        >
          <LogOut className="h-5 w-5" /> Logout
        </button>

      </div>
    </div>
  );
};
