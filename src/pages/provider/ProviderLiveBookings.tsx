import React from 'react';
import { useApp } from '../../context/AppContext';
import { BookingCard } from '../../components/BookingCard';
import { Radio } from 'lucide-react';

export const ProviderLiveBookings = () => {
  const { bookings, currentUser } = useApp();

  const activeBookings = bookings.filter(b => 
    b.providerId === currentUser?.id && 
    ['accepted', 'on_the_way', 'arrived', 'started'].includes(b.status)
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center">
          <Radio className="h-6 w-6 animate-pulse" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-primary-text">Live Jobs</h1>
          <p className="text-sm text-secondary-text">Currently active jobs assigned to you</p>
        </div>
      </div>

      <div className="space-y-4">
        {activeBookings.length > 0 ? (
          activeBookings.map(booking => (
            <BookingCard key={booking.id} booking={booking} role="provider" />
          ))
        ) : (
          <div className="bg-bg-secondary dark:bg-bg-card border border-border-primary rounded-3xl p-12 text-center">
            <Radio className="h-12 w-12 text-secondary-text mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-primary-text">No active jobs</h3>
            <p className="text-sm text-secondary-text mt-2">You don't have any jobs in progress right now.</p>
          </div>
        )}
      </div>
    </div>
  );
};
