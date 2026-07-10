import React from 'react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-8 text-xs text-secondary-text leading-relaxed transition-colors duration-200" id="privacy-policy-page">
      <h1 className="text-2xl font-extrabold text-primary-text">Privacy Policy</h1>
      <p className="text-secondary-text">Last updated: July 5, 2026</p>
      
      <p>
        At ServiceHub Technologies Inc., we respect your personal security and take privacy seriously. This Policy outlines how we collect, process, transfer, and store user locations, payment receipts, and contact lists when registering or booking services on our platforms.
      </p>

      <div className="space-y-4">
        <h2 className="text-sm font-extrabold text-primary-text uppercase tracking-wider">1. Information We Collect</h2>
        <p>
          We gather customer and service provider details such as usernames, billing addresses, verified contact numbers, GPS locations (required for matching ServiceHub service bookings), and photos uploaded for listing portfolios.
        </p>

        <h2 className="text-sm font-extrabold text-primary-text uppercase tracking-wider">2. How We Use Location Data</h2>
        <p>
          ServiceHub is a location-based matching service. We fetch and calculate neighborhood distances to ensure that cleaners, electricians, or massage therapists reside within optimal travel boundaries of your selected delivery address.
        </p>

        <h2 className="text-sm font-extrabold text-primary-text uppercase tracking-wider">3. Sharing with Service Partners</h2>
        <p>
          When you book a service, your delivery address, chosen name, and instructions are securely shared with the specific provider you booked. No other providers can access your contact details without explicit consent.
        </p>
      </div>
    </div>
  );
};
