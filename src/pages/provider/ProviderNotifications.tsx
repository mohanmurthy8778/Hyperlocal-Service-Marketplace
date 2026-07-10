import React, { useState } from 'react';
import { Bell, CheckCircle2, MessageSquare, IndianRupee, MapPin } from 'lucide-react';

export const ProviderNotifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'booking',
      title: 'New Booking Request',
      message: 'You have a new request for AC Repair from Rahul',
      time: 'Just now',
      read: false,
      icon: MapPin,
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    {
      id: 2,
      type: 'payment',
      title: 'Payment Received',
      message: '₹1200 has been credited to your wallet for Booking #BKG-101',
      time: '2 hours ago',
      read: true,
      icon: IndianRupee,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    {
      id: 3,
      type: 'message',
      title: 'New Message',
      message: 'Customer Priya sent you a message: "I will be home..."',
      time: '1 day ago',
      read: true,
      icon: MessageSquare,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    }
  ]);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-primary-text flex items-center gap-2">
            Notifications
            <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">
              {notifications.filter(n => !n.read).length} new
            </span>
          </h1>
          <p className="text-sm text-secondary-text mt-1">Updates on your jobs and payments</p>
        </div>
        <button 
          onClick={markAllRead}
          className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1"
        >
          <CheckCircle2 className="h-4 w-4" />
          Mark all as read
        </button>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => {
          const Icon = notification.icon;
          return (
            <div 
              key={notification.id}
              className={`p-4 sm:p-5 rounded-3xl border transition-all ${
                notification.read 
                  ? 'bg-bg-secondary dark:bg-bg-card border-border-primary' 
                  : 'bg-primary/5 border-primary/20 shadow-md shadow-primary/5'
              } flex gap-4`}
            >
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${notification.bg} ${notification.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className={`text-sm font-bold truncate ${notification.read ? 'text-primary-text' : 'text-primary-text'}`}>
                    {notification.title}
                  </h3>
                  <span className="text-[10px] font-bold text-secondary-text whitespace-nowrap">{notification.time}</span>
                </div>
                <p className="text-xs text-secondary-text mt-1 leading-relaxed">
                  {notification.message}
                </p>
              </div>
              {!notification.read && (
                <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
