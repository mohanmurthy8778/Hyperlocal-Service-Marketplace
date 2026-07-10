import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Link } from 'react-router-dom';
import { BookingCard } from '../../components/BookingCard';
import { 
  Briefcase, Calendar, CheckCircle2, 
  TrendingUp, Activity, Bell, Settings, PlusCircle, CheckCircle, Clock
} from 'lucide-react';
import { useTranslation } from '../../utils/translations';

export const ProviderDashboard: React.FC = () => {
  const { currentUser, bookings, notifications, markNotificationRead, language, toast } = useApp();
  const { t } = useTranslation(language);

  const [isOnline, setIsOnline] = useState(() => {
    const stored = localStorage.getItem(`provider_online_${currentUser?.id}`);
    return stored !== 'false'; // default true
  });

  const toggleOnline = () => {
    const nextVal = !isOnline;
    setIsOnline(nextVal);
    localStorage.setItem(`provider_online_${currentUser?.id}`, String(nextVal));
    toast(`Availability status updated to ${nextVal ? 'ONLINE' : 'OFFLINE'}`, 'success');
  };

  const providerBookings = useMemo(() => {
    return bookings.filter(b => b.providerId === currentUser?.id);
  }, [bookings, currentUser]);

  // 1. Booking Requests (Pending, Accepted, Rejected)
  const bookingRequests = useMemo(() => {
    return providerBookings.filter(b => ['pending', 'accepted', 'rejected'].includes(b.status.toLowerCase()));
  }, [providerBookings]);

  // 2. Active Jobs (accepted)
  const activeJobs = useMemo(() => {
    return providerBookings.filter(b => b.status.toLowerCase() === 'accepted');
  }, [providerBookings]);

  // 3. Ongoing Jobs (on_the_way, arrived, started)
  const ongoingJobs = useMemo(() => {
    return providerBookings.filter(b => ['on_the_way', 'arrived', 'started'].includes(b.status.toLowerCase()));
  }, [providerBookings]);

  // 4. Completed Jobs (completed)
  const completedJobs = useMemo(() => {
    return providerBookings.filter(b => b.status.toLowerCase() === 'completed');
  }, [providerBookings]);

  // 5. Recent Notifications
  const userNotifications = useMemo(() => {
    return notifications.filter(n => n.userId === currentUser?.id).slice(0, 5);
  }, [notifications, currentUser]);

  if (!currentUser || currentUser.role !== 'provider') return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 transition-colors duration-200" id="provider-dashboard">
      
      {/* Upper Grid: Availability Status & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Availability Status Card */}
        <div className="bg-bg-card border border-border-primary rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-secondary-text uppercase tracking-wider block">Status Panel</span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isOnline ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
              }`}>
                <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <h3 className="text-base font-black text-primary-text">Availability Status</h3>
            <p className="text-xs text-secondary-text leading-relaxed">
              {isOnline 
                ? 'You are active on the network. Incoming customer bookings will appear in your console instantly.' 
                : 'You are currently offline. Go online to receive real-time customer service orders.'
              }
            </p>
          </div>
          <button
            onClick={toggleOnline}
            className={`w-full py-3 px-4 font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-2 ${
              isOnline 
                ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            }`}
          >
            {isOnline ? 'Go Offline' : 'Go Online'}
          </button>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-bg-card border border-border-primary rounded-3xl p-6 shadow-xs space-y-4 md:col-span-2">
          <h3 className="text-sm font-bold text-primary-text flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <span>Quick Actions Console</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              to="/provider/add-service"
              className="flex flex-col items-center justify-center p-4 bg-bg-secondary dark:bg-bg-card hover:bg-bg-secondary/75 border border-border-primary rounded-2xl text-center space-y-2 group transition-all cursor-pointer"
            >
              <PlusCircle className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-primary-text">Create Listing</span>
            </Link>
            <Link
              to="/provider/calendar"
              className="flex flex-col items-center justify-center p-4 bg-bg-secondary dark:bg-bg-card hover:bg-bg-secondary/75 border border-border-primary rounded-2xl text-center space-y-2 group transition-all cursor-pointer"
            >
              <Calendar className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-primary-text">Manage Calendar</span>
            </Link>
            <Link
              to="/provider/earnings"
              className="flex flex-col items-center justify-center p-4 bg-bg-secondary dark:bg-bg-card hover:bg-bg-secondary/75 border border-border-primary rounded-2xl text-center space-y-2 group transition-all cursor-pointer"
            >
              <TrendingUp className="h-5 w-5 text-emerald-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-primary-text">View Earnings</span>
            </Link>
            <Link
              to="/provider/profile"
              className="flex flex-col items-center justify-center p-4 bg-bg-secondary dark:bg-bg-card hover:bg-bg-secondary/75 border border-border-primary rounded-2xl text-center space-y-2 group transition-all cursor-pointer"
            >
              <Settings className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-primary-text">Edit Profile</span>
            </Link>
          </div>
        </div>

      </div>

      {/* Main Grid split: Jobs Content vs Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Core Bookings & Jobs section */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section 1: Booking Requests (Pending, Accepted, Rejected) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-primary-text flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <span>Booking Requests ({bookingRequests.length})</span>
              </h2>
              <span className="text-[10px] uppercase font-bold text-secondary-text">Pending, Accepted, Rejected</span>
            </div>
            
            <div className="space-y-4">
              {bookingRequests.length > 0 ? (
                bookingRequests.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} role="provider" />
                ))
              ) : (
                <div className="text-center py-8 bg-bg-card border border-border-primary rounded-3xl p-6">
                  <Briefcase className="h-8 w-8 text-secondary-text mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-primary-text">No Booking Requests</h4>
                  <p className="text-[11px] text-secondary-text mt-1">
                    You don't have any booking requests at the moment.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Active Jobs (Accepted) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-primary-text flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Active Jobs ({activeJobs.length})</span>
              </h2>
              <span className="text-[10px] uppercase font-bold text-secondary-text">Accepted</span>
            </div>
            
            <div className="space-y-4">
              {activeJobs.length > 0 ? (
                activeJobs.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} role="provider" />
                ))
              ) : (
                <div className="text-center py-8 bg-bg-card border border-border-primary rounded-3xl p-6">
                  <CheckCircle2 className="h-8 w-8 text-secondary-text mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-primary-text">No Active Jobs</h4>
                  <p className="text-[11px] text-secondary-text mt-1">
                    No active or accepted jobs currently.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Ongoing Jobs (On the way, Arrived, Started) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-primary-text flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span>Ongoing Jobs ({ongoingJobs.length})</span>
              </h2>
              <span className="text-[10px] uppercase font-bold text-secondary-text">In Progress</span>
            </div>
            
            <div className="space-y-4">
              {ongoingJobs.length > 0 ? (
                ongoingJobs.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} role="provider" />
                ))
              ) : (
                <div className="text-center py-6 bg-bg-card border border-border-primary rounded-3xl p-6">
                  <p className="text-xs text-secondary-text italic">No ongoing jobs right now.</p>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Completed Jobs (Completed) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-primary-text flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>Completed Jobs ({completedJobs.length})</span>
              </h2>
              <span className="text-[10px] uppercase font-bold text-secondary-text">Finished</span>
            </div>
            
            <div className="space-y-4">
              {completedJobs.length > 0 ? (
                completedJobs.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} role="provider" />
                ))
              ) : (
                <div className="text-center py-8 bg-bg-card border border-border-primary rounded-3xl p-6">
                  <CheckCircle className="h-8 w-8 text-secondary-text mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-primary-text">No Completed Jobs</h4>
                  <p className="text-[11px] text-secondary-text mt-1">
                    You haven't completed any jobs yet.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Sidebar widgets */}
        <div className="space-y-6">
          
          {/* Section 5: Recent Notifications */}
          <div className="bg-bg-card border border-border-primary rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border-primary pb-3">
              <h3 className="text-sm font-bold text-primary-text flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <span>Recent Notifications</span>
              </h3>
              <Link to="/provider/notifications" className="text-xs font-bold text-primary hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {userNotifications.length > 0 ? (
                userNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markNotificationRead(notif.id)}
                    className={`p-3 rounded-xl border flex items-start gap-3 transition-all cursor-pointer ${
                      notif.read
                        ? 'bg-bg-secondary dark:bg-bg-card border-border-primary'
                        : 'bg-primary/5 border-primary/20 shadow-sm'
                    }`}
                  >
                    <div className="h-8 w-8 rounded-lg bg-bg-card border border-border-primary flex items-center justify-center shrink-0">
                      <Bell className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary-text">{notif.title}</span>
                        <span className="text-[9px] text-secondary-text">{notif.date}</span>
                      </div>
                      <p className="text-[11px] text-secondary-text leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-xs text-secondary-text italic">No recent notifications.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
