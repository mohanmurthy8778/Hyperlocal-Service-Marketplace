import React from 'react';
import { useApp } from '../../context/AppContext';
import { BookingCard } from '../../components/BookingCard';
import { BellRing, Inbox } from 'lucide-react';
import { motion } from 'motion/react';

export const ProviderRequests = () => {
  const { bookings, currentUser } = useApp();

  const pendingBookings = bookings.filter(b => 
    b.providerId === currentUser?.id && 
    b.status === 'pending'
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center">
          <BellRing className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-primary-text">New Service Requests</h1>
          <p className="text-sm text-secondary-text">Review and accept new incoming jobs</p>
        </div>
      </div>

      <div className="space-y-4">
        {pendingBookings.length > 0 ? (
          pendingBookings.map(booking => (
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
              <Inbox className="h-8 w-8 text-secondary-text" />
            </div>
            <h3 className="text-lg font-bold text-primary-text mb-1">No New Requests</h3>
            <p className="text-sm text-secondary-text max-w-sm">
              You're all caught up! New service requests from customers will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
