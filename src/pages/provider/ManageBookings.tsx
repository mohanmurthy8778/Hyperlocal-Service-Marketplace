import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BookingCard } from '../../components/BookingCard';
import { Briefcase, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ManageBookings: React.FC = () => {
  const { currentUser, bookings } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'accepted' | 'completed' | 'cancelled'>('all');

  const providerBookings = useMemo(() => {
    return bookings.filter(b => b.providerId === currentUser?.id);
  }, [bookings, currentUser]);

  const filteredBookings = useMemo(() => {
    if (activeTab === 'all') return providerBookings;
    if (activeTab === 'accepted') {
      return providerBookings.filter(b => ['accepted', 'on_the_way', 'arrived', 'started'].includes(b.status));
    }
    return providerBookings.filter(b => b.status === activeTab);
  }, [providerBookings, activeTab]);

  const tabs: { id: typeof activeTab; label: string }[] = [
    { id: 'all', label: 'All Jobs' },
    { id: 'pending', label: 'Pending Requests' },
    { id: 'accepted', label: 'Accepted / Ongoing' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' }
  ];

  if (!currentUser) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 transition-colors duration-200 animate-fade-in" id="provider-bookings-page">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-primary-text">Workspace Bookings Log</h1>
          <p className="text-xs text-secondary-text mt-1">Review live bookings, approve client requests, or signal job completions.</p>
        </div>

        <Link
          to="/provider"
          className="px-3.5 py-1.5 border border-border-primary hover:bg-bg-secondary text-xs font-bold text-secondary-text rounded-xl flex items-center gap-1.5 dark:border-border-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Dashboard</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-primary overflow-x-auto scrollbar-none gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = tab.id === 'all' 
            ? providerBookings.length 
            : providerBookings.filter(b => b.status === tab.id).length;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-xs font-bold px-3 whitespace-nowrap border-b-2 -mb-0.5 flex items-center gap-1.5 transition-all ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-secondary-text hover:text-secondary-text dark:hover:text-secondary-text'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`h-4.5 px-1.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-primary/15 text-primary' : 'bg-bg-secondary text-secondary-text dark:bg-bg-card'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Booking listings */}
      <div className="space-y-4">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} role="provider" />
          ))
        ) : (
          <div className="text-center py-16 bg-bg-card border border-border-primary rounded-3xl p-6">
            <Briefcase className="h-10 w-10 text-secondary-text mx-auto mb-3" />
            <h4 className="text-sm font-extrabold text-primary-text">No Jobs Listed</h4>
            <p className="text-xs text-secondary-text max-w-sm mx-auto mt-1">
              There are currently no bookings cataloged under "{activeTab}" filter.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
