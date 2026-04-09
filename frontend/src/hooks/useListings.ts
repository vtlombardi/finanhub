'use client';

import { useState, useEffect, useCallback } from 'react';
import { ListingsService } from '@/services/ListingsService';
import { Listing, SearchFilters, ListingsResponse } from '@shared/contracts';

/**
 * Hook para busca e listagem de oportunidades (Marketplace).
 */
export function useListings(initialFilters: SearchFilters = {}) {
  const [data, setData] = useState<Listing[]>([]);
  const [pagination, setPagination] = useState<ListingsResponse['pagination'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);

  const fetchListings = useCallback(async (currentFilters: SearchFilters) => {
    setLoading(true);
    try {
      const response = await ListingsService.getPublicListings(currentFilters);
      setData(response.data || []);
      setPagination(response.pagination || null);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar oportunidades:', err);
      setError('Falha ao carregar oportunidades.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings(filters);
  }, [filters, fetchListings]);

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  const setPage = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  return {
    listings: data,
    pagination,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    setPage,
    refresh: () => fetchListings(filters)
  };
}

/**
 * Hook para obter detalhe de uma oportunidade por slug.
 */
export function useListingDetail(slug: string) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const data = await ListingsService.getListingBySlug(slug);
      setListing(data);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar detalhe da oportunidade:', err);
      setError('Oportunidade não encontrada ou indisponível.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { listing, loading, error, refresh: fetchDetail };
}
