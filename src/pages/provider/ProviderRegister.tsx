import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Phone, User, ArrowRight, Briefcase, MapPin, CheckCircle, Upload } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion } from 'motion/react';
import { Logo } from '../../components/Logo';

export const ProviderRegister = () => {
  const navigate = useNavigate();
  const { login, toast, currentUser } = useApp();
    React.useEffect(() => {
      if (currentUser && currentUser.role === 'provider') {
        navigate('/provider/dashboard', { replace: true });
      }
    }, [currentUser, navigate]);
  const [isLoading, setIsLoading] = useState(false);

  if (currentUser) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const success = await login('provider@example.com', 'provider', 'password');
      if (!success) { setIsLoading(false); return; }
      toast('Provider registration successful', 'success');
      setTimeout(() => navigate('/provider/dashboard', { replace: true }), 10);
    } catch (e) {
      toast('Error registering', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200 bg-bg-secondary dark:bg-bg-card">
      <div className="max-w-xl w-full space-y-8 bg-white dark:bg-charcoal p-8 rounded-3xl border border-border-primary shadow-xl">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mx-auto w-[220px] mb-[20px] select-none" style={{ width: '220px', height: 'auto', objectFit: 'contain' }}>
            <Logo className="w-12 h-12 flex-shrink-0" />
            <span className="text-3xl font-black tracking-tight text-primary-text dark:text-white flex items-center">
              Service<span className="text-[#DCA543]">Hub</span>
            </span>
          </div>
          <h2 className="text-3xl font-black text-primary-text tracking-tight">Become a Provider</h2>
          <p className="mt-2 text-sm text-secondary-text">Join our network and start earning</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-secondary-text uppercase tracking-wider">Full Name</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-text" />
                <input type="text" required className="w-full pl-10 pr-4 py-3 bg-bg-secondary dark:bg-charcoal border border-border-primary rounded-xl text-primary-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="John Doe" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-secondary-text uppercase tracking-wider">Email address</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-text" />
                <input type="email" required className="w-full pl-10 pr-4 py-3 bg-bg-secondary dark:bg-charcoal border border-border-primary rounded-xl text-primary-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="provider@example.com" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-secondary-text uppercase tracking-wider">Phone number</label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-text" />
                <input type="tel" required className="w-full pl-10 pr-4 py-3 bg-bg-secondary dark:bg-charcoal border border-border-primary rounded-xl text-primary-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="+1 (555) 000-0000" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-secondary-text uppercase tracking-wider">Address</label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-text" />
                <input type="text" required className="w-full pl-10 pr-4 py-3 bg-bg-secondary dark:bg-charcoal border border-border-primary rounded-xl text-primary-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="123 Main St, City" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-secondary-text uppercase tracking-wider">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-text" />
                <input type="password" required className="w-full pl-10 pr-4 py-3 bg-bg-secondary dark:bg-charcoal border border-border-primary rounded-xl text-primary-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="••••••••" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-secondary-text uppercase tracking-wider">Confirm Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-text" />
                <input type="password" required className="w-full pl-10 pr-4 py-3 bg-bg-secondary dark:bg-charcoal border border-border-primary rounded-xl text-primary-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="••••••••" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-secondary-text uppercase tracking-wider">Service Category</label>
              <div className="relative mt-1">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-text" />
                <input type="text" required className="w-full pl-10 pr-4 py-3 bg-bg-secondary dark:bg-charcoal border border-border-primary rounded-xl text-primary-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="Plumbing, Electrical..." />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-secondary-text uppercase tracking-wider">Experience (Years)</label>
              <div className="relative mt-1">
                <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-text" />
                <input type="number" required className="w-full pl-10 pr-4 py-3 bg-bg-secondary dark:bg-charcoal border border-border-primary rounded-xl text-primary-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="e.g. 5" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-secondary-text uppercase tracking-wider">Govt ID Upload</label>
              <div className="relative mt-1">
                <Upload className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-text" />
                <input type="file" required className="w-full pl-10 pr-4 py-2.5 bg-bg-secondary dark:bg-charcoal border border-border-primary rounded-xl text-primary-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-xs" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-secondary-text uppercase tracking-wider">Profile Photo Upload</label>
              <div className="relative mt-1">
                <Upload className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-text" />
                <input type="file" required className="w-full pl-10 pr-4 py-2.5 bg-bg-secondary dark:bg-charcoal border border-border-primary rounded-xl text-primary-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-xs" />
              </div>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit" 
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-primary/20 ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Registering...' : 'Apply Now'} <ArrowRight className="h-5 w-5" />
          </motion.button>
        </form>
        <div className="text-center text-sm">
          <span className="text-secondary-text">Already a provider? </span>
          <Link to="/login" className="font-bold text-primary hover:text-primary/80">Sign in</Link>
        </div>
      </div>
    </div>
  );
};
