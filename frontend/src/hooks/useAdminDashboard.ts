import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api.client';

export function useAdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/dashboard');
      setData(response.data);
    } catch (err: any) {
      if (err?.response?.status === 403 || err?.response?.status === 401) {
        setError('Acesso negado. Apenas administradores podem visualizar esta página.');
      } else {
        setError(err?.response?.data?.message || 'Erro ao carregar dados do admin.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const approveListing = async (id: string) => {
    try {
      await api.patch(`/moderation/approve/${id}`);
      await load();
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Erro ao aprovar anúncio.' };
    }
  };

  const rejectListing = async (id: string, reason: string) => {
    try {
      await api.patch(`/moderation/reject/${id}`, { reason });
      await load();
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Erro ao rejeitar anúncio.' };
    }
  };

  return { data, loading, error, refresh: load, approveListing, rejectListing };
}
