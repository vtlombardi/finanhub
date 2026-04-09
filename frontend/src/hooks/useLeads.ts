import { useState, useEffect, useCallback } from 'react';
import { LeadsService } from '@/services/leads.service';
import { Lead } from '@shared/contracts';

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await LeadsService.getTenantLeads();
      setLeads(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao carregar leads.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateProposalStatus = async (proposalId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      await LeadsService.updateProposalStatus(proposalId, status);
      await load();
      return { success: true };
    } catch (err: any) {
      return { 
        success: false, 
        message: err?.response?.data?.message || 'Erro ao atualizar proposta.' 
      };
    }
  };

  return { leads, loading, error, refresh: load, updateProposalStatus };
}
