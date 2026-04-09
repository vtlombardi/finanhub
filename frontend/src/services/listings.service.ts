import { api } from './api.client';

export interface ListingFeature {
  name: string;
  iconClass?: string;
}

export interface BusinessHour {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
}

export interface ListingMedia {
  id?: string;
  url: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  isCover: boolean;
}

export interface ListingData {
  id?: string;
  title: string;
  slug?: string;
  description: string;
  price?: number;
  categoryId: string;
  companyId: string;
  
  // Localização
  city?: string;
  state?: string;
  neighborhood?: string;
  addressLine1?: string;
  addressLine2?: string;
  zipCode?: string;
  
  // Contato
  email?: string;
  websiteUrl?: string;
  phonePrimary?: string;
  phoneSecondary?: string;
  
  // Sociais
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  tiktokUrl?: string;
  
  // Financeiro
  investmentValue?: number;
  revenue?: string;
  ebitda?: string;
  employeesCount?: string;
  
  // SEO
  seoTitle?: string;
  seoKeywords?: string;
  seoDescription?: string;
  
  // Mídia
  logoUrl?: string;
  videoUrl?: string;
  videoDescription?: string;
  
  // Relações
  features?: ListingFeature[];
  businessHours?: BusinessHour[];
  media?: ListingMedia[];
  
  // Status (presente no model mas não no DTO inicial, vou alinhar com o service)
  status?: string;
}

export const listingsService = {
  getById: async (id: string) => {
    const response = await api.get(`/listings/private/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<ListingData>) => {
    const response = await api.patch(`/listings/private/${id}`, data);
    return response.data;
  },

  create: async (data: ListingData) => {
    const response = await api.post('/listings/private', data);
    return response.data;
  },

  listMyListings: async () => {
    const response = await api.get('/listings/me');
    return response.data;
  },

  uploadMedia: async (file: File): Promise<{ url: string }> => {
    const form = new FormData();
    form.append('file', file);
    const response = await api.post('/listings/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
