import { useState, useEffect, useCallback } from 'react';
import { LeadsService } from '@/services/leads.service';
import { Lead } from '@shared/contracts';

/**
 * Hook para investidores acompanharem seus interesses enviados (leads).
 */
export function useMyInterests() {
  const [interests, setInterests] = useState<Lead[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await LeadsService.getMyLeads(page, limit);
      setInterests(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao carregar seus interesses.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { 
    interests, 
    loading, 
    error, 
    refresh: load 
  };
}
