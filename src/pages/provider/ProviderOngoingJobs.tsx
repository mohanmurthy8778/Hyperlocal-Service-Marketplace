import React from 'react';
import { useApp } from '../../context/AppContext';
import { BookingCard } from '../../components/BookingCard';
import { Clock, Navigation } from 'lucide-react';
import { motion } from 'motion/react';

export const ProviderOngoingJobs = () => {
  const { bookings, currentUser } = useApp();

  const activeBookings = bookings.filter(b => 
    b.providerId === currentUser?.id && 
    ['accepted', 'on_the_way', 'arrived', 'started'].includes(b.status)
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
          <Clock className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-primary-text">Ongoing Jobs</h1>
          <p className="text-sm text-secondary-text">Manage your active and in-progress jobs</p>
        </div>
      </div>

      <div className="space-y-4">
        {activeBookings.length > 0 ? (
          activeBookings.map(booking => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <BookingCard booking={booking} role="provider" />
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-border-primary rounded-2xl bg-bg-card/50">
            <div className="bg-bg-secondary p-4 rounded-full mb-4">
              <Navigation className="h-8 w-8 text-secondary-text" />
            </div>
            <h3 className="text-lg font-bold text-primary-text mb-1">No Ongoing Jobs</h3>
            <p className="text-sm text-secondary-text max-w-sm">
              You don't have any active jobs at the moment. Check your new requests to accept jobs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
