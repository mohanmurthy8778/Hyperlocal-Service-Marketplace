import axiosInstance from './axios';

export const authApi = {
  login: async (data: any) => {
    const response = await axiosInstance.post('/auth/login', data);
    return response.data;
  },
  register: async (data: any) => {
    const response = await axiosInstance.post('/auth/register', data);
    return response.data;
  },
  logout: async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  },
  forgotPassword: async (data: { email: string }) => {
    const response = await axiosInstance.post('/auth/forgot-password', data);
    return response.data;
  },
  resetPassword: async (data: any) => {
    const response = await axiosInstance.post('/auth/reset-password', data);
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },
  verifyEmail: async (data: { email: string; otp: string }) => {
    const response = await axiosInstance.post('/auth/verify-email', data);
    return response.data;
  },
  resendOtp: async (data: { email: string; purpose: string }) => {
    const response = await axiosInstance.post('/auth/resend-otp', data);
    return response.data;
  }
};
