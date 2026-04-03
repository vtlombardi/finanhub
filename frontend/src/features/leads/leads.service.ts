import { api } from '@/services/api.client';

export class LeadsService {
  /** Investidor manifesta interesse num listing */
  static async createLead(listingId: string, message: string) {
    const response = await api.post('/leads', { listingId, message });
    return response.data;
  }

  /** Investidor vê seus próprios leads */
  static async getMyLeads() {
    const response = await api.get('/leads/me');
    return response.data;
  }

  /** Vendedor vê leads recebidos */
  static async getTenantLeads() {
    const response = await api.get('/leads/tenant');
    return response.data;
  }

  /** Enviar proposta formal por um lead */
  static async createProposal(leadId: string, valueOffered: number, conditions?: string) {
    const response = await api.post(`/leads/${leadId}/proposals`, { valueOffered, conditions });
    return response.data;
  }

  /** Vendedor aceita/rejeita proposta */
  static async updateProposalStatus(proposalId: string, status: string) {
    const response = await api.patch(`/leads/proposals/${proposalId}`, { status });
    return response.data;
  }
}
