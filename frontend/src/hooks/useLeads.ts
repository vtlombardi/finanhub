import { useState, useEffect, useCallback } from 'react';
import { LeadsService } from '@/services/leads.service';
import { Lead } from '@shared/contracts';

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await LeadsService.getTenantLeads(page, limit);
      setLeads(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao carregar leads.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateLeadStatus = async (leadId: string, status: string) => {
    try {
      await LeadsService.updateStatus(leadId, status);
      await load();
      return { success: true };
    } catch (err: any) {
      return { 
        success: false, 
        message: err?.response?.data?.message || 'Erro ao atualizar status do lead.' 
      };
    }
  };

  const updateLeadNotes = async (leadId: string, notes: string) => {
    try {
      await LeadsService.updateNotes(leadId, notes);
      await load();
      return { success: true };
    } catch (err: any) {
      return { 
        success: false, 
        message: err?.response?.data?.message || 'Erro ao atualizar notas do lead.' 
      };
    }
  };

  const updateProposalStatus = async (proposalId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      await LeadsService.updateProposalStatus(proposalId, status);
      await load();
      return { success: true };
    } catch (err: any) {
      return { 
        success: false, 
        message: err?.response?.data?.message || 'Erro ao atualizar status da proposta.' 
      };
    }
  };

  return { leads, loading, error, refresh: load, updateProposalStatus, updateLeadStatus, updateLeadNotes };
}
