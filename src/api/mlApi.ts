import axiosInstance from './axios';

export const mlApi = {
  getRecommendations: async (customerId: number | string, latitude: number, longitude: number, maxDistanceKm?: number) => {
    const response = await axiosInstance.post('/ml/recommendations', {
      customerId,
      latitude,
      longitude,
      maxDistanceKm: maxDistanceKm ?? 15.0
    });
    return response.data;
  },

  predictPrice: async (data: { category: string; demandIndex: number; basePrice: number; providerRating: number; dayOfWeek: number }) => {
    const response = await axiosInstance.post('/ml/price-prediction', data);
    return response.data;
  },

  checkFraud: async (data: { customerId: number | string; amount: number; paymentMethod: string; ipAddress: string; transactionCount24h: number }) => {
    const response = await axiosInstance.post('/ml/fraud-check', data);
    return response.data;
  },

  analyzeCustomer: async (customerId: number | string) => {
    const response = await axiosInstance.post('/ml/customer-analysis', { customerId });
    return response.data;
  },

  rankProvider: async (providerId: number | string) => {
    const response = await axiosInstance.post('/ml/provider-ranking', { providerId });
    return response.data;
  }
};
