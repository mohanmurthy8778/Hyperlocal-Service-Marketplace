import axiosInstance from './axios';

export const paymentApi = {
  createOrder: async (data: { bookingId: number | string; amount: number; currency?: string }) => {
    const response = await axiosInstance.post('/payments/create-order', data);
    return response.data;
  },

  verifyPayment: async (data: {
    bookingId: number | string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => {
    const response = await axiosInstance.post('/payments/verify', data);
    return response.data;
  },

  getHistory: async () => {
    const response = await axiosInstance.get('/payments/history');
    return response.data;
  },

  getPaymentById: async (id: number | string) => {
    const response = await axiosInstance.get(`/payments/${id}`);
    return response.data;
  },

  getPaymentStatusByBookingId: async (bookingId: number | string) => {
    const response = await axiosInstance.get(`/payments/status/${bookingId}`);
    return response.data;
  },

  requestRefund: async (data: { bookingId: number | string; reason: string }) => {
    const response = await axiosInstance.post('/payments/refund/request', data);
    return response.data;
  },

  getInvoiceMetadata: async (paymentId: number | string) => {
    const response = await axiosInstance.get(`/invoices/${paymentId}`);
    return response.data;
  },

  getInvoiceDownloadUrl: (paymentId: number | string) => {
    const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
    return `${BASE_URL}/invoices/download/${paymentId}`;
  }
};
