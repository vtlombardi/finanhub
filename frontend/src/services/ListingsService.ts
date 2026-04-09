import { api } from './api.client';
import { Listing, ListingsResponse, SearchFilters } from '@shared/contracts';

/**
 * Serviço de Oportunidades/Listings.
 * Centraliza a comunicação com os endpoints de anúncios públicos e privados.
 */
export class ListingsService {
  /**
   * Busca pública de listings com filtros.
   */
  static async getPublicListings(filters: SearchFilters = {}): Promise<ListingsResponse> {
    const params: any = { ...filters };
    const response = await api.get('/listings', { params });
    return response.data;
  }

  /**
   * Obtém detalhe de um listing pelo slug (público).
   */
  static async getListingBySlug(slug: string): Promise<Listing> {
    const response = await api.get(`/listings/slug/${slug}`);
    return response.data;
  }

  /**
   * Obtém detalhe de um listing pelo ID (público).
   */
  static async getListingById(id: string): Promise<Listing> {
    const response = await api.get(`/listings/${id}`);
    return response.data;
  }

  /**
   * Lista os anúncios do próprio tenant (dashboard).
   */
  static async getMyListings(): Promise<Listing[]> {
    const response = await api.get('/listings/me');
    return response.data;
  }

  /**
   * Toggle de favorito para um listing.
   */
  static async toggleFavorite(listingId: string): Promise<{ favorited: boolean }> {
    const response = await api.post(`/listings/${listingId}/favorite`);
    return response.data;
  }

  /**
   * Obtém a lista de favoritos do usuário logado.
   */
  static async getMyFavorites(): Promise<any[]> {
    const response = await api.get('/listings/favorites');
    return response.data;
  }

  /**
   * Obtém listings recomendados para o usuário.
   */
  static async getRecommended(): Promise<Listing[]> {
    const response = await api.get('/listings/recommended');
    return response.data;
  }

  /**
   * Obtém listings similares a um específico.
   */
  static async getSimilar(listingId: string): Promise<Listing[]> {
    const response = await api.get(`/listings/${listingId}/similar`);
    return response.data;
  }

  /**
   * Cria um novo anúncio (dashboard).
   */
  static async createListing(data: any): Promise<Listing> {
    const response = await api.post('/listings', data);
    return response.data;
  }

  /**
   * Atualiza um anúncio existente (dashboard).
   */
  static async updateListing(id: string, data: any): Promise<Listing> {
    const response = await api.put(`/listings/${id}`, data);
    return response.data;
  }
}
