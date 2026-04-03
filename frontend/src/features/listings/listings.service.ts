import { api } from '@/services/api.client';

export interface ListingData {
  title: string;
  description: string;
  price: number;
  categoryId?: string;
  companyId?: string;
}

export interface SearchFilters {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export class ListingsService {
  /** Busca avançada com filtros, paginação e ordenação */
  static async getPublicListings(filters: SearchFilters = {}) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any = {};
    if (filters.q) params.q = filters.q;
    if (filters.category) params.category = filters.category;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.sort) params.sort = filters.sort;
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;

    const response = await api.get('/listings', { params });
    return response.data;
  }

  /** Meus anúncios (Painel B2B) */
  static async getMyListings() {
    const response = await api.get('/listings/me');
    return response.data;
  }

  /** Toggle de favorito */
  static async toggleFavorite(listingId: string) {
    const response = await api.post(`/listings/${listingId}/favorite`);
    return response.data;
  }

  /** Lista de favoritos do usuário */
  static async getMyFavorites() {
    const response = await api.get('/listings/favorites');
    return response.data;
  }

  /** Recomendações baseadas no perfil de interesse */
  static async getRecommended() {
    const response = await api.get('/listings/recommended');
    return response.data;
  }

  /** Deals similares a um listing específico */
  static async getSimilar(listingId: string) {
    const response = await api.get(`/listings/${listingId}/similar`);
    return response.data;
  }

  /** Detalhe por slug */
  static async getListingBySlug(slug: string) {
    const response = await api.get(`/listings/slug/${slug}`);
    return response.data;
  }

  /** Criar novo listing */
  static async createListing(entry: ListingData) {
    const response = await api.post('/listings', entry);
    return response.data;
  }
}
