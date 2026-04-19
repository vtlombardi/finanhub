import { useState, useEffect, useCallback } from 'react';
import { ListingsService } from '@/services/ListingsService';
import { Listing } from '@shared/contracts';

/**
 * Hook para gerenciar os favoritos (saved listings) do usuário.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ListingsService.getMyFavorites();
      // Mapeia para garantir que retornamos uma lista de Listings
      const listings = data.map((fav: any) => ({
        ...fav.listing,
        isFavorited: true
      }));
      setFavorites(listings);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao carregar favoritos.');
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleFavorite = async (listingId: string) => {
    try {
      const { favorited } = await ListingsService.toggleFavorite(listingId);
      
      // Atualiza o estado local para feedback imediato
      if (favorited) {
        // Se foi favoritado, precisamos recarregar ou buscar o listing se não tivermos
        // Como o toggle não retorna o objeto Listing completo, o ideal é recarregar
        await load();
      } else {
        // Se foi removido, removemos do estado local comparando com o id do listing
        setFavorites(prev => prev.filter(l => l.id !== listingId));
      }
      return favorited;
    } catch (err) {
      console.error('Erro ao alternar favorito:', err);
      return null;
    }
  };

  useEffect(() => {
    load();
  }, [load]);

  return { 
    favorites, 
    loading, 
    error, 
    toggleFavorite,
    refresh: load 
  };
}
