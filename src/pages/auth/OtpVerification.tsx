import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { KeyRound } from 'lucide-react';

export const OtpVerification: React.FC = () => {
  const { toast } = useApp();
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '']);

  const handleChange = (val: string, index: number) => {
    if (val.length > 1) return;
    const newCode = [...code];
    newCode[index] = val;
    setCode(newCode);

    // Auto focus next input
    if (val && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCode = code.join('');
    if (finalCode.length < 4) {
      toast('Please enter the complete 4-digit code', 'error');
      return;
    }
    toast('OTP code verified successfully!', 'success');
    navigate('/reset-password');
  };

  return (
    <div className="mx-auto max-w-md w-full px-4 py-24 space-y-8 transition-colors duration-200 animate-fade-in" id="otp-page">
      <div className="text-center space-y-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
          <KeyRound className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-primary-text">Verify Recovery Code</h1>
        <p className="text-xs text-secondary-text">Enter the 4-digit OTP security code sent to your inbox. (Enter any 4 numbers to pass!)</p>
      </div>

      <div className="bg-bg-card rounded-2xl border border-border-primary p-6 dark:border-border-primary shadow-xl space-y-6">
        <form onSubmit={handleVerifySubmit} className="space-y-6">
          <div className="flex justify-center gap-3">
            {code.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-input-${idx}`}
                type="text"
                maxLength={1}
                required
                value={digit}
                onChange={(e) => handleChange(e.target.value, idx)}
                className="h-14 w-14 text-center rounded-xl border border-border-primary bg-bg-secondary/50 text-lg font-extrabold outline-none focus:border-primary focus:bg-bg-card dark:border-border-primary dark:bg-bg-card dark:text-white"
              />
            ))}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-xs font-bold text-charcoal transition-all shadow-md"
          >
            Verify Security Code
          </button>
        </form>

        <div className="text-center text-xs text-secondary-text font-semibold">
          <span>Didn't receive code? </span>
          <button onClick={() => toast('Security code re-sent!', 'success')} className="text-primary hover:underline font-bold">Resend code</button>
        </div>
      </div>
    </div>
  );
};
