import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, CheckCircle, Trash2, Calendar, ShieldCheck, Mail, MessageCircle } from 'lucide-react';

export const CustomerNotifications: React.FC = () => {
  const { currentUser, notifications, markNotificationRead, clearNotifications } = useApp();

  const userNotifications = useMemo(() => {
    return notifications.filter(n => n.userId === currentUser?.id);
  }, [notifications, currentUser]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Calendar className="h-5 w-5 text-primary" />;
      case 'payment':
        return <ShieldCheck className="h-5 w-5 text-emerald-600" />;
      case 'review':
        return <MessageCircle className="h-5 w-5 text-pink-600" />;
      default:
        return <Bell className="h-5 w-5 text-secondary-text" />;
    }
  };

  if (!currentUser) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 transition-colors duration-200 animate-fade-in" id="customer-notifications-page">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-primary-text">Notifications</h1>
          <p className="text-xs text-secondary-text mt-1">Stay updated with instant booking confirmations and review receipts.</p>
        </div>

        {userNotifications.length > 0 && (
          <button
            onClick={clearNotifications}
            className="px-3 py-1.5 rounded-lg border border-border-primary hover:bg-bg-secondary dark:border-border-primary dark:hover:bg-bg-secondary dark:bg-bg-card border-border-primary text-xs font-bold text-secondary-text flex items-center gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Lists */}
      <div className="space-y-3">
        {userNotifications.length > 0 ? (
          userNotifications.map((notif) => {
            return (
              <div
                key={notif.id}
                onClick={() => markNotificationRead(notif.id)}
                className={`p-4 rounded-2xl border flex items-start gap-4 transition-all cursor-pointer ${
                  notif.read
                    ? 'bg-bg-card border-border-primary dark:bg-bg-card dark:border-border-primary'
                    : 'bg-primary/5 border-primary/20 shadow-sm'
                }`}
                id={`notif-${notif.id}`}
              >
                <div className={`h-10 w-10 rounded-xl bg-bg-card flex items-center justify-center shadow-sm shrink-0`}>
                  {getNotificationIcon(notif.type)}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-primary-text">{notif.title}</h4>
                    <span className="text-[9px] text-secondary-text">{notif.date}</span>
                  </div>
                  <p className="text-xs text-secondary-text leading-relaxed">
                    {notif.message}
                  </p>
                  
                  {!notif.read && (
                    <span className="inline-block text-[9px] font-bold text-primary uppercase tracking-wider pt-1">
                      ● Unread (Click to mark read)
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-bg-card border border-border-primary rounded-3xl p-6">
            <Bell className="h-10 w-10 text-secondary-text mx-auto mb-3" />
            <h4 className="text-sm font-extrabold text-secondary-text dark:text-secondary-text">Clear & Quiet</h4>
            <p className="text-xs text-secondary-text max-w-sm mx-auto mt-1">
              You don't have any unread notifications at the moment.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
