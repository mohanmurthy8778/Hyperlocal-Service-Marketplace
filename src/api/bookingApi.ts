import axiosInstance from './axios';

export const bookingApi = {
  createBooking: async (data: any) => {
    const response = await axiosInstance.post('/bookings/create', data);
    return response.data;
  },

  getBookingDetails: async (id: number | string) => {
    const response = await axiosInstance.get(`/bookings/${id}`);
    return response.data;
  },

  getBookingsByProvider: async (providerId: number | string) => {
    const response = await axiosInstance.get(`/bookings/provider/${providerId}`);
    return response.data;
  },

  getBookingsByCustomer: async (customerId: number | string) => {
    const response = await axiosInstance.get(`/bookings/customer/${customerId}`);
    return response.data;
  },

  acceptBooking: async (id: number | string) => {
    const response = await axiosInstance.put(`/bookings/${id}/accept`);
    return response.data;
  },

  rejectBooking: async (id: number | string) => {
    const response = await axiosInstance.put(`/bookings/${id}/reject`);
    return response.data;
  },

  startBooking: async (id: number | string) => {
    const response = await axiosInstance.put(`/bookings/${id}/start`);
    return response.data;
  },

  completeBooking: async (id: number | string) => {
    const response = await axiosInstance.put(`/bookings/${id}/complete`);
    return response.data;
  },

  cancelBooking: async (id: number | string) => {
    const response = await axiosInstance.put(`/bookings/${id}/cancel`);
    return response.data;
  },

  updateBookingStatus: async (id: number | string, status: string) => {
    const s = String(status).toLowerCase();
    let response;
    if (s === 'accepted') {
      response = await axiosInstance.put(`/bookings/${id}/accept`);
    } else if (s === 'rejected') {
      response = await axiosInstance.put(`/bookings/${id}/reject`);
    } else if (s === 'started' || s === 'ongoing' || s === 'on_the_way' || s === 'arrived' || s === 'service_started') {
      response = await axiosInstance.put(`/bookings/${id}/start`);
    } else if (s === 'completed') {
      response = await axiosInstance.put(`/bookings/${id}/complete`);
    } else if (s === 'cancelled') {
      response = await axiosInstance.put(`/bookings/${id}/cancel`);
    } else {
      // Fallback
      response = await axiosInstance.put(`/bookings/${id}/accept`);
    }
    return response.data;
  },

  getTimeline: async (id: number | string) => {
    const response = await axiosInstance.get(`/bookings/${id}/timeline`);
    return response.data;
  }
};

