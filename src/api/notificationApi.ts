import axiosInstance from './axios';

export const notificationApi = {
  getNotifications: async (page: number = 0, size: number = 10) => {
    const response = await axiosInstance.get('/notifications', {
      params: { page, size }
    });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await axiosInstance.get('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (id: number | string) => {
    const response = await axiosInstance.put(`/notifications/read/${id}`);
    return response.data;
  },

  markAllRead: async () => {
    const response = await axiosInstance.put('/notifications/read-all');
    return response.data;
  },

  deleteNotification: async (id: number | string) => {
    const response = await axiosInstance.delete(`/notifications/${id}`);
    return response.data;
  },

  clearAll: async () => {
    const response = await axiosInstance.delete('/notifications/clear-all');
    return response.data;
  },

  registerDevice: async (token: string) => {
    const response = await axiosInstance.post('/notifications/register-device', { token });
    return response.data;
  },

  removeDevice: async (token: string) => {
    const response = await axiosInstance.delete('/notifications/remove-device', { data: { token } });
    return response.data;
  }
};
