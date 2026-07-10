import axiosInstance from './axios';

export const adminApi = {
  getStats: async () => {
    const response = await axiosInstance.get('/admin/dashboard');
    return response.data;
  },

  getAllUsers: async () => {
    const response = await axiosInstance.get('/admin/users');
    return response.data;
  },

  toggleUserStatus: async (id: number | string) => {
    const response = await axiosInstance.put(`/admin/users/${id}/toggle-status`);
    return response.data;
  },

  approveProvider: async (id: number | string) => {
    const response = await axiosInstance.put(`/admin/providers/${id}/approve`);
    return response.data;
  },

  rejectProvider: async (id: number | string) => {
    const response = await axiosInstance.put(`/admin/providers/${id}/reject`);
    return response.data;
  },

  createCategory: async (data: any) => {
    const response = await axiosInstance.post('/admin/categories', data);
    return response.data;
  },

  updateCategory: async (id: number | string, data: any) => {
    const response = await axiosInstance.put(`/admin/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: number | string) => {
    const response = await axiosInstance.delete(`/admin/categories/${id}`);
    return response.data;
  },

  getAllPayments: async () => {
    const response = await axiosInstance.get('/admin/payments');
    return response.data;
  },

  getRevenueReport: async () => {
    const response = await axiosInstance.get('/admin/revenue');
    return response.data;
  },

  sendTargetedNotification: async (data: { userId: number | string; title: string; message: string; type: string; priority: string }) => {
    const response = await axiosInstance.post('/admin/notifications/send', data);
    return response.data;
  },

  broadcastNotification: async (data: { title: string; message: string; type: string; priority: string }) => {
    const response = await axiosInstance.post('/admin/notifications/broadcast', data);
    return response.data;
  }
};
