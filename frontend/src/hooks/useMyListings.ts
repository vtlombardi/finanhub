import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api.client';

export interface MyListingsFilters {
  q?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export function useMyListings() {
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (filters: MyListingsFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/listings/me', { params: filters });
      setData(response.data.data);
      setPagination(response.data.pagination);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao carregar anúncios.');
    } finally {
      setLoading(false);
    }
  }, []);

  const duplicate = async (id: string) => {
    try {
      await api.post(`/listings/private/${id}/duplicate`);
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Erro ao duplicar anúncio.' };
    }
  };

  const softDelete = async (id: string) => {
    try {
      await api.delete(`/listings/private/${id}`);
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Erro ao excluir anúncio.' };
    }
  };

  const toggleStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/listings/private/${id}/status`, { status });
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Erro ao alterar status.' };
    }
  };

  return { data, pagination, loading, error, refresh: load, duplicate, softDelete, toggleStatus };
}
