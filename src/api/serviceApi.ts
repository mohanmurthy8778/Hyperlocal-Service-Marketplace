import axiosInstance from './axios';

export const serviceApi = {
  getPublicCategories: async () => {
    const response = await axiosInstance.get('/categories');
    return response.data;
  },

  searchPublicServices: async (query?: string, categoryId?: number | string) => {
    const params: any = {};
    if (query) params.query = query;
    if (categoryId) params.categoryId = categoryId;
    const response = await axiosInstance.get('/services', { params });
    return response.data;
  }
};
