import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Phone, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../../components/Logo';

export const ProviderLogin = () => {
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const navigate = useNavigate();
  const { login, toast, currentUser } = useApp();
    React.useEffect(() => {
      if (currentUser && currentUser.role === 'provider') {
        navigate('/provider/dashboard', { replace: true });
      }
    }, [currentUser, navigate]);

  if (currentUser) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call for provider login
    const success = await login('provider@example.com', 'provider', 'password');
    if (success) {
      toast('Provider login successful', 'success');
      navigate('/provider/dashboard');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-bg-secondary dark:bg-bg-card p-8 rounded-3xl border border-border-primary shadow-xl">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mx-auto w-[220px] mb-[20px] select-none" style={{ width: '220px', height: 'auto', objectFit: 'contain' }}>
            <Logo className="w-12 h-12 flex-shrink-0" />
            <span className="text-3xl font-black tracking-tight text-primary-text dark:text-white flex items-center">
              Service<span className="text-[#DCA543]">Hub</span>
            </span>
          </div>
          <h2 className="text-3xl font-black text-primary-text tracking-tight">Provider Portal</h2>
          <p className="mt-2 text-sm text-secondary-text">Sign in to manage your jobs</p>
        </div>

        <div className="flex bg-bg-card dark:bg-charcoal p-1 rounded-xl">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginMethod === 'email' ? 'bg-primary text-white shadow-md' : 'text-secondary-text hover:text-primary-text'}`}
            onClick={() => setLoginMethod('email')}
          >
            Email
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginMethod === 'phone' ? 'bg-primary text-white shadow-md' : 'text-secondary-text hover:text-primary-text'}`}
            onClick={() => setLoginMethod('phone')}
          >
            Phone
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            {loginMethod === 'email' ? (
              <div>
                <label className="text-xs font-bold text-secondary-text uppercase tracking-wider">Email address</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-text" />
                  <input type="email" required className="w-full pl-10 pr-4 py-3 bg-bg-card border border-border-primary rounded-xl text-primary-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="provider@example.com" />
                </div>
              </div>
            ) : (
              <div>
                <label className="text-xs font-bold text-secondary-text uppercase tracking-wider">Phone number</label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-text" />
                  <input type="tel" required className="w-full pl-10 pr-4 py-3 bg-bg-card border border-border-primary rounded-xl text-primary-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="+1 (555) 000-0000" />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-secondary-text uppercase tracking-wider">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-text" />
                <input type="password" required className="w-full pl-10 pr-4 py-3 bg-bg-card border border-border-primary rounded-xl text-primary-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="••••••••" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="font-bold text-primary hover:text-primary/80 transition-colors">Forgot password?</Link>
          </div>

          <button type="submit" className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]">
            Sign in <ArrowRight className="h-5 w-5" />
          </button>
        </form>

        <div className="text-center text-sm">
          <span className="text-secondary-text">Don't have a provider account? </span>
          <Link to="/provider/register" className="font-bold text-primary hover:text-primary/80">Apply now</Link>
        </div>
      </div>
    </div>
  );
};
