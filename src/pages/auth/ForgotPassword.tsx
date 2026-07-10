import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Mail, HelpCircle, ArrowLeft } from 'lucide-react';
import { Logo } from '../../components/Logo';

export const ForgotPassword: React.FC = () => {
  const { toast } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast(`OTP security code sent to ${email}`, 'success');
    navigate('/otp-verification');
  };

  return (
    <div className="mx-auto max-w-md w-full px-4 py-24 space-y-8 transition-colors duration-200 animate-fade-in" id="forgot-password-page">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mx-auto w-[220px] mb-[20px] select-none" style={{ width: '220px', height: 'auto', objectFit: 'contain' }}>
          <Logo className="w-12 h-12 flex-shrink-0" />
          <span className="text-3xl font-black tracking-tight text-primary-text dark:text-white flex items-center">
            Service<span className="text-[#DCA543]">Hub</span>
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-primary-text">Recover Password</h1>
        <p className="text-xs text-secondary-text">Enter your registered email address to receive a 4-digit OTP security code.</p>
      </div>

      <div className="bg-bg-card rounded-2xl border border-border-primary p-6 dark:border-border-primary shadow-xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-secondary-text">Your Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs py-2.5 pl-10 pr-3 rounded-xl border border-border-primary bg-bg-secondary/50 dark:border-border-primary dark:bg-bg-card dark:text-white outline-none focus:border-primary"
                placeholder="sarah.j@example.com"
              />
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-secondary-text" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-xs font-bold text-charcoal transition-all shadow-md"
          >
            Send OTP Security Code
          </button>
        </form>

        <div className="border-t border-border-primary dark:border-border-primary pt-4 text-center">
          <Link to="/login" className="inline-flex items-center gap-1 text-[11px] font-bold text-secondary-text hover:text-primary">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Log In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
