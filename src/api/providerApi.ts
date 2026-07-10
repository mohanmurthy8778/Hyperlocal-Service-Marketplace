import axiosInstance from './axios';

export const providerApi = {
  getProfile: async () => {
    const response = await axiosInstance.get('/provider/profile');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await axiosInstance.put('/provider/profile', data);
    return response.data;
  },

  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post('/provider/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadDocument: async (name: string, type: string, file: File) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('type', type);
    formData.append('file', file);
    const response = await axiosInstance.post('/provider/upload-document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  addService: async (serviceData: any, imageFile?: File | null) => {
    const formData = new FormData();
    formData.append('service', JSON.stringify(serviceData));
    if (imageFile) {
      formData.append('image', imageFile);
    }
    const response = await axiosInstance.post('/provider/services', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getServices: async () => {
    const response = await axiosInstance.get('/provider/services');
    return response.data;
  },

  getServiceById: async (id: number | string) => {
    const response = await axiosInstance.get(`/provider/services/${id}`);
    return response.data;
  },

  updateService: async (id: number | string, serviceData: any, imageFile?: File | null) => {
    const formData = new FormData();
    formData.append('service', JSON.stringify(serviceData));
    if (imageFile) {
      formData.append('image', imageFile);
    }
    const response = await axiosInstance.put(`/provider/services/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteService: async (id: number | string) => {
    const response = await axiosInstance.delete(`/provider/services/${id}`);
    return response.data;
  },

  getBookings: async () => {
    const response = await axiosInstance.get('/provider/bookings');
    return response.data;
  },

  getBookingDetails: async (id: number | string) => {
    const response = await axiosInstance.get(`/provider/bookings/${id}`);
    return response.data;
  },

  acceptBooking: async (id: number | string) => {
    const response = await axiosInstance.put(`/provider/bookings/${id}/accept`);
    return response.data;
  },

  rejectBooking: async (id: number | string) => {
    const response = await axiosInstance.put(`/provider/bookings/${id}/reject`);
    return response.data;
  },

  startService: async (id: number | string) => {
    const response = await axiosInstance.put(`/provider/bookings/${id}/start`);
    return response.data;
  },

  completeService: async (id: number | string) => {
    const response = await axiosInstance.put(`/provider/bookings/${id}/complete`);
    return response.data;
  },

  getEarnings: async () => {
    const response = await axiosInstance.get('/provider/earnings');
    return response.data;
  },

  getPaymentHistory: async () => {
    const response = await axiosInstance.get('/provider/payment-history');
    return response.data;
  },

  getReviews: async () => {
    const response = await axiosInstance.get('/provider/reviews');
    return response.data;
  },

  getNotifications: async () => {
    const response = await axiosInstance.get('/provider/notifications');
    return response.data;
  },

  markNotificationRead: async (id: number | string) => {
    const response = await axiosInstance.put(`/provider/notifications/read/${id}`);
    return response.data;
  },

  deleteNotification: async (id: number | string) => {
    const response = await axiosInstance.delete(`/provider/notifications/${id}`);
    return response.data;
  },

  getDashboard: async () => {
    const response = await axiosInstance.get('/provider/dashboard');
    return response.data;
  }
};
