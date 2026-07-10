import React, { createContext, useContext, useState } from 'react';
import { notificationApi } from '../api/notificationApi';
import { Notification } from '../types';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number | string) => Promise<void>;
  markAllRead: () => Promise<void>;
  deleteNotification: (id: number | string) => Promise<void>;
  clearAll: () => Promise<void>;
  registerDevice: (token: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchNotifications = async () => {
    try {
      const res = await notificationApi.getNotifications(0, 100);
      const data = res.data?.content || res.content || res || [];
      const mapped: Notification[] = data.map((n: any) => ({
        id: String(n.id || ''),
        userId: String(n.userId || ''),
        title: n.title || '',
        message: n.message || '',
        date: n.createdAt ? new Date(n.createdAt).toLocaleString() : new Date().toLocaleString(),
        read: n.read || false,
        type: (n.type || 'system').toLowerCase() as any,
      }));
      setNotifications(mapped);

      const countRes = await notificationApi.getUnreadCount();
      setUnreadCount(countRes.unreadCount || countRes.data?.unreadCount || 0);
    } catch (e) {
      console.error("Failed to fetch notifications:", e);
    }
  };

  const markAsRead = async (id: number | string) => {
    try {
      await notificationApi.markAsRead(id);
      await fetchNotifications();
    } catch (e) {
      console.error("Failed to mark notification as read:", e);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      await fetchNotifications();
    } catch (e) {
      console.error("Failed to mark all notifications as read:", e);
    }
  };

  const deleteNotification = async (id: number | string) => {
    try {
      await notificationApi.deleteNotification(id);
      await fetchNotifications();
    } catch (e) {
      console.error("Failed to delete notification:", e);
    }
  };

  const clearAll = async () => {
    try {
      await notificationApi.clearAll();
      await fetchNotifications();
    } catch (e) {
      console.error("Failed to clear notifications:", e);
    }
  };

  const registerDevice = async (token: string) => {
    try {
      await notificationApi.registerDevice(token);
    } catch (e) {
      console.error("Failed to register device:", e);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      fetchNotifications,
      markAsRead,
      markAllRead,
      deleteNotification,
      clearAll,
      registerDevice,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
