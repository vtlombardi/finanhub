import { useState, useEffect, useCallback } from 'react';
import { LeadsService } from '@/services/leads.service';
import { Lead, AdminLeadQuery, AdminLeadsResponse } from '@shared/contracts';

export function useAdminLeads(initialFilters: AdminLeadQuery = { page: 1, limit: 20 }) {
  const [data, setData] = useState<AdminLeadsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AdminLeadQuery>(initialFilters);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await LeadsService.getAdminLeads(filters);
      setData(result);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao carregar leads administrativos.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await LeadsService.updateLeadStatus(id, status);
      await load();
      return { success: true };
    } catch (err: any) {
      return { 
        success: false, 
        message: err?.response?.data?.message || 'Erro ao atualizar status.' 
      };
    }
  };

  const updateNotes = async (id: string, notes: string) => {
    try {
      await LeadsService.updateLeadInternalNotes(id, notes);
      // Opcional: recarregar apenas se necessário, ou atualizar localmente
      await load();
      return { success: true };
    } catch (err: any) {
      return { 
        success: false, 
        message: err?.response?.data?.message || 'Erro ao persistir notas.' 
      };
    }
  };

  const applyFilters = (newFilters: Partial<AdminLeadQuery>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 })); // Reseta para pág 1 ao filtrar
  };

  const changePage = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  return { 
    leads: data?.data || [], 
    pagination: {
      total: data?.total || 0,
      page: data?.page || 1,
      lastPage: data?.lastPage || 1,
    },
    loading, 
    error, 
    refresh: load, 
    updateStatus, 
    updateNotes,
    applyFilters,
    changePage,
    filters 
  };
}
