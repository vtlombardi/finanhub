import { api } from './api.client';

export interface CatalogItem {
  id: string;
  name: string;
  type: 'PRODUCT' | 'SERVICE' | 'BOTH';
  executiveSummary?: string;
  description?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  qualityScore: number;
  // ... outros campos conforme necessário
}

export const CatalogService = {
  createDraft: async (data: any) => {
    const response = await api.post('/catalog/draft', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/catalog/${id}`, data);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/catalog/${id}`);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/catalog');
    return response.data;
  },

  saveMedia: async (id: string, media: any[]) => {
    const response = await api.post(`/catalog/${id}/media`, media);
    return response.data;
  },

  publish: async (id: string) => {
    const response = await api.post(`/catalog/${id}/publish`);
    return response.data;
  }
};
