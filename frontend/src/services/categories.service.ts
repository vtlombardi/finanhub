import { api } from './api.client';

export const categoriesService = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  
  getAttributes: async (categoryId: string) => {
    const response = await api.get(`/categories/${categoryId}/attributes`);
    return response.data;
  }
};
