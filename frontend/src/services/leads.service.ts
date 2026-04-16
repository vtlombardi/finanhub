import { api } from './api.client';
import { Lead, Proposal } from '@shared/contracts';

export class LeadsService {
  /** Vendedor vê leads recebidos */
  static async getTenantLeads(page = 1, limit = 10): Promise<any> {
    const response = await api.get('/leads/tenant', { params: { page, limit } });
    return response.data;
  }

  /** Vendedor aceita/rejeita proposta */
  static async updateProposalStatus(proposalId: string, status: 'ACCEPTED' | 'REJECTED'): Promise<Proposal> {
    const response = await api.patch<Proposal>(`/leads/proposals/${proposalId}`, { status });
    return response.data;
  }

  /** Investidor manifesta interesse num listing */
  static async createLead(data: {
    listingId: string;
    message: string;
    userName?: string;
    userEmail?: string;
    userPhone?: string;
    userCompany?: string;
    objective?: string;
    investmentRange?: string;
    mediationAccepted: boolean;
  }): Promise<Lead> {
    const response = await api.post<Lead>('/leads', data);
    return response.data;
  }

  /** Enviar proposta formal por um lead */
  static async createProposal(leadId: string, valueOffered: number, conditions?: string): Promise<Proposal> {
    const response = await api.post<Proposal>(`/leads/${leadId}/proposals`, { valueOffered, conditions });
    return response.data;
  }

  /** Investidor vê seus interesses enviados */
  static async getMyLeads(page = 1, limit = 10): Promise<any> {
    const response = await api.get('/leads/my', { params: { page, limit } });
    return response.data;
  }

  /** --- ADMIN METHODS --- **/

  /** Listagem global de leads com filtros e paginação */
  static async getAdminLeads(params: any): Promise<any> {
    const response = await api.get('/leads/admin', { params });
    return response.data;
  }

  /** Atualiza status operacional do lead */
  static async updateLeadStatus(id: string, status: string): Promise<Lead> {
    const response = await api.patch<Lead>(`/leads/admin/${id}/status`, { status });
    return response.data;
  }

  /** Atualiza notas internas de mediação */
  static async updateLeadInternalNotes(id: string, notes: string): Promise<Lead> {
    const response = await api.patch<Lead>(`/leads/admin/${id}/notes`, { notes });
    return response.data;
  }
}
