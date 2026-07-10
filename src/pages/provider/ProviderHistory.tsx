import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BookingCard } from '../../components/BookingCard';
import { Calendar, Filter, Search } from 'lucide-react';

export const ProviderHistory = () => {
  const { bookings, currentUser } = useApp();
  const [filter, setFilter] = useState('all');

  const providerBookings = bookings.filter(b => b.providerId === currentUser?.id);
  
  const historyBookings = providerBookings.filter(b => {
    if (filter === 'completed') return b.status === 'completed';
    if (filter === 'cancelled') return b.status === 'cancelled';
    if (filter === 'upcoming') return ['accepted', 'on_the_way', 'arrived', 'started'].includes(b.status);
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-primary-text flex items-center gap-2">
            Job History
          </h1>
          <p className="text-sm text-secondary-text mt-1">Review your past and upcoming services</p>
        </div>
        <div className="flex items-center gap-2 bg-bg-card p-1 rounded-xl border border-border-primary overflow-x-auto w-full sm:w-auto">
          {['all', 'upcoming', 'completed', 'cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold capitalize whitespace-nowrap transition-all \${
                filter === f 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-secondary-text hover:text-primary-text hover:bg-bg-secondary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {historyBookings.length > 0 ? (
          historyBookings.map(booking => (
            <BookingCard key={booking.id} booking={booking} role="provider" />
          ))
        ) : (
          <div className="bg-bg-secondary dark:bg-bg-card border border-border-primary rounded-3xl p-12 text-center">
            <Calendar className="h-12 w-12 text-secondary-text mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-primary-text">No jobs found</h3>
            <p className="text-sm text-secondary-text mt-2">You don't have any jobs matching this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
