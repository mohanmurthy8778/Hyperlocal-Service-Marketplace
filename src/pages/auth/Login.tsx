import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck, User, Briefcase, Sparkles, Phone, EyeOff, Eye } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '../../components/Logo';

type RoleTab = 'customer' | 'provider' | 'admin';

export const Login = () => {
  const [activeTab, setActiveTab] = useState<RoleTab>('customer');
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, toast, currentUser } = useApp();

  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') navigate('/admin/dashboard', { replace: true });
      else if (currentUser.role === 'provider') navigate('/provider/dashboard', { replace: true });
      else navigate('/customer/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(identifier.includes('@') ? identifier : `${activeTab}@example.com`, activeTab, password);
      if (!success) { setIsLoading(false); return; }
      toast('Login successful', 'success');

      // Redirect to correct dashboard
      const from = (location.state as any)?.from?.pathname;
      if (from && from !== '/' && from !== '/login') {
        navigate(from, { replace: true });
      } else {
        if (activeTab === 'admin') navigate('/admin/dashboard', { replace: true });
        else if (activeTab === 'provider') navigate('/provider/dashboard', { replace: true });
        else navigate('/customer/dashboard', { replace: true });
      }
    } catch (error) {
      toast('Invalid credentials', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  
  React.useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const userData = event.data.payload;
        // Mock a login with the user data
        // For Google login, we might not have a password, we can just use a default or call an API
        setIsLoading(true);
        try {
          const success = await login(userData.email, activeTab, 'google_oauth');
          if (success) {
            toast('Google Login successful', 'success');
            if (activeTab === 'admin') navigate('/admin/dashboard', { replace: true });
            else if (activeTab === 'provider') navigate('/provider/dashboard', { replace: true });
            else navigate('/customer/dashboard', { replace: true });
          }
        } finally {
          setIsLoading(false);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [activeTab, login, navigate, toast]);

  if (currentUser) return null;

  const handleGoogleLogin = async () => {
    try {
      const res = await fetch('/api/auth/url');
      const data = await res.json();
      if (data.url) {
        // We open it in _self or _top in an iframe environment, but the server uses window.opener.
        // Actually, AI Studio iframe block window.open. The system guidelines say: "By default, the application is rendered in an iFrame, which means certain JavaScript APIs may not work as expected unless the user opens the application in a new tab. For example, try to avoid using APIs such as window.alert or window.open."
        // We can use window.location.href = data.url
        // Wait, the server closes the window if window.opener exists.
        // Let's modify the server to redirect to a special frontend route if window.opener is missing, or we can just use window.open and expect it to work only in new tab.
        // Or we can just redirect.
        window.open(data.url, 'google_oauth', 'width=500,height=600');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-bg-secondary dark:bg-bg-card transition-colors duration-200">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-charcoal p-8 rounded-3xl border border-border-primary shadow-2xl relative overflow-hidden">
        
        <div className="text-center relative z-10">
          <div className="flex items-center justify-center gap-2 mx-auto w-[220px] mb-[20px] select-none" style={{ width: '220px', height: 'auto', objectFit: 'contain' }}>
            <Logo className="w-12 h-12 flex-shrink-0" />
            <span className="text-3xl font-black tracking-tight text-primary-text dark:text-white flex items-center">
              Service<span className="text-[#DCA543]">Hub</span>
            </span>
          </div>
          <h2 className="text-3xl font-black text-primary-text tracking-tight">
            {activeTab === 'customer' ? 'Customer Login' : activeTab === 'provider' ? 'Provider Login' : 'Admin Login'}
          </h2>
          <p className="mt-2 text-sm text-secondary-text">Welcome back to ServiceHub Marketplace</p>
        </div>

        <div className="flex bg-bg-secondary dark:bg-charcoal-dark p-1 rounded-xl relative z-10">
          {(['customer', 'provider', 'admin'] as RoleTab[]).map(tab => (
            <button
              key={tab}
              type="button"
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all capitalize ${activeTab === tab ? 'bg-primary text-white shadow-md' : 'text-secondary-text hover:text-primary-text'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <form className="mt-8 space-y-6 relative z-10" onSubmit={handleLogin}>
          <div className="space-y-4">
            
            <div className="flex bg-bg-secondary dark:bg-charcoal-dark p-1 rounded-lg w-32 mx-auto mb-4">
              <button
                type="button"
                className={`flex-1 py-1 text-[10px] font-bold rounded transition-all ${loginMethod === 'email' ? 'bg-white dark:bg-charcoal text-primary-text shadow' : 'text-secondary-text'}`}
                onClick={() => setLoginMethod('email')}
              >
                Email
              </button>
              <button
                type="button"
                className={`flex-1 py-1 text-[10px] font-bold rounded transition-all ${loginMethod === 'phone' ? 'bg-white dark:bg-charcoal text-primary-text shadow' : 'text-secondary-text'}`}
                onClick={() => setLoginMethod('phone')}
              >
                Phone
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-secondary-text uppercase tracking-wider">
                {loginMethod === 'email' ? 'Email address' : 'Phone number'}
              </label>
              <div className="relative mt-1">
                {loginMethod === 'email' ? (
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-text" />
                ) : (
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-text" />
                )}
                <input 
                  type={loginMethod === 'email' ? 'email' : 'tel'}
                  required 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-bg-secondary dark:bg-charcoal border border-border-primary rounded-xl text-primary-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                  placeholder={loginMethod === 'email' ? `${activeTab}@example.com` : '+1 (555) 000-0000'} 
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-secondary-text uppercase tracking-wider">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-text" />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-bg-secondary dark:bg-charcoal border border-border-primary rounded-xl text-primary-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                  placeholder="••••••••" 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="rounded border-border-primary text-primary focus:ring-primary h-4 w-4"
              />
              <span className="text-xs text-secondary-text font-medium">Remember me</span>
            </label>
            <Link to="/forgot-password" className="font-bold text-primary hover:text-primary/80 transition-colors">Forgot password?</Link>
          </div>

          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit" 
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-primary/20 ${isLoading ? 'opacity-80' : ''}`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Authenticating...
              </span>
            ) : (
              <span className="flex items-center gap-2">Sign In <ArrowRight className="h-5 w-5" /></span>
            )}
          </motion.button>
        </form>

        <div className="mt-6">
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-border-primary"></div>
            <span className="flex-shrink mx-4 text-[10px] text-secondary-text uppercase font-black tracking-widest">or continue with</span>
            <div className="flex-grow border-t border-border-primary"></div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="button"
            onClick={handleGoogleLogin}
            className="mt-4 w-full py-3 rounded-xl border border-border-primary bg-bg-secondary dark:bg-charcoal-dark hover:bg-bg-card text-xs font-bold text-secondary-text flex items-center justify-center gap-2.5 transition-all"
          >
            <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.529-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.1C18.281 1.09 15.42 0 12.24 0 5.58 0 0 5.373 0 12s5.58 12 12.24 12c6.96 0 11.57-4.89 11.57-11.79 0-.795-.085-1.4-.195-1.925H12.24z" />
            </svg>
            <span>Google</span>
          </motion.button>
        </div>

        <div className="text-center text-sm mt-8">
          {activeTab === 'customer' && (
            <>
              <span className="text-secondary-text">Don't have an account? </span>
              <Link to="/register" className="font-bold text-primary hover:text-primary-hover">Register</Link>
            </>
          )}
          {activeTab === 'provider' && (
            <>
              <span className="text-secondary-text">Not a partner yet? </span>
              <Link to="/provider/register" className="font-bold text-primary hover:text-primary-hover">Become a Service Provider</Link>
            </>
          )}
          {activeTab === 'admin' && (
            <p className="text-xs text-secondary-text">System administrators must be provisioned internally.</p>
          )}
        </div>
      </div>
    </div>
  );
};
