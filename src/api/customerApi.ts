import axiosInstance from './axios';

export const customerApi = {

  getServices: async (category?: string) => {
    const url = category && category !== 'all' ? `/services?category=${category}` : '/services';
    const response = await axiosInstance.get(url);
    return response.data;
  },

  getProviders: async (category: string) => {
    const url = category === 'all' ? '/providers' : `/providers/category/${category}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },
  createBooking: async (data: any) => {
    const response = await axiosInstance.post('/bookings', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await axiosInstance.get('/customer/profile');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await axiosInstance.put('/customer/profile', data);
    return response.data;
  },

  uploadProfileImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post('/customer/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAddresses: async () => {
    const response = await axiosInstance.get('/customer/addresses');
    return response.data;
  },

  addAddress: async (data: any) => {
    const response = await axiosInstance.post('/customer/address', data);
    return response.data;
  },

  updateAddress: async (id: number | string, data: any) => {
    const response = await axiosInstance.put(`/customer/address/${id}`, data);
    return response.data;
  },

  deleteAddress: async (id: number | string) => {
    const response = await axiosInstance.delete(`/customer/address/${id}`);
    return response.data;
  },

  searchServices: async (params?: any) => {
    const response = await axiosInstance.get('/customer/services', { params });
    return response.data;
  },

  getServiceDetails: async (id: number | string) => {
    const response = await axiosInstance.get(`/customer/services/${id}`);
    return response.data;
  },

  getFavorites: async () => {
    const response = await axiosInstance.get('/customer/favorites');
    return response.data;
  },

  addFavorite: async (providerId: number | string) => {
    const response = await axiosInstance.post(`/customer/favorites/${providerId}`);
    return response.data;
  },

  removeFavorite: async (providerId: number | string) => {
    const response = await axiosInstance.delete(`/customer/favorites/${providerId}`);
    return response.data;
  },

  getDashboard: async () => {
    const response = await axiosInstance.get('/customer/dashboard');
    return response.data;
  },

  bookService: async (data: any) => {
    const response = await axiosInstance.post('/customer/bookings', data);
    return response.data;
  },

  getBookingHistory: async () => {
    const response = await axiosInstance.get('/customer/bookings');
    return response.data;
  },

  getBookingDetails: async (id: number | string) => {
    const response = await axiosInstance.get(`/customer/bookings/${id}`);
    return response.data;
  },

  cancelBooking: async (id: number | string) => {
    const response = await axiosInstance.put(`/customer/bookings/cancel/${id}`);
    return response.data;
  },

  addReview: async (data: any) => {
    const response = await axiosInstance.post('/customer/reviews', data);
    return response.data;
  },

  updateReview: async (id: number | string, data: any) => {
    const response = await axiosInstance.put(`/customer/reviews/${id}`, data);
    return response.data;
  },

  deleteReview: async (id: number | string) => {
    const response = await axiosInstance.delete(`/customer/reviews/${id}`);
    return response.data;
  }
};
