import React from 'react';

export const Terms: React.FC = () => {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-8 text-xs text-secondary-text leading-relaxed transition-colors duration-200" id="terms-conditions-page">
      <h1 className="text-2xl font-extrabold text-primary-text">Terms of Service</h1>
      <p className="text-secondary-text">Last updated: July 5, 2026</p>
      
      <p>
        By accessing the ServiceHub website or mobile application, you represent that you agree to be bound by these standard commercial terms of service.
      </p>

      <div className="space-y-4">
        <h2 className="text-sm font-extrabold text-primary-text uppercase tracking-wider">1. Platform Scope & Vetting</h2>
        <p>
          ServiceHub operates as an administrative broker connecting customers with independent service professionals. While we run routine background checks, users acknowledge that actual service quality remains the direct professional liability of the chosen provider.
        </p>

        <h2 className="text-sm font-extrabold text-primary-text uppercase tracking-wider">2. Payment & Cancellation Holding</h2>
        <p>
          Clients authorize standard pre-booking holds on their payment cards. Cancellations are permitted with zero fee up to 2 hours before the scheduled timeslot. Cancellations within the 2-hour window may incur a ₹500 transport cancellation fee.
        </p>

        <h2 className="text-sm font-extrabold text-primary-text uppercase tracking-wider">3. Dispute Arbitration</h2>
        <p>
          In the event of a customer complaint regarding damage or incomplete cleaning, our admin support team will review photos, check logs, and mediate a mutually acceptable settlement. Both parties agree to cooperate in good faith.
        </p>
      </div>
    </div>
  );
};
