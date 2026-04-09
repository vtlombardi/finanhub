import { api } from './api.client';
import { Lead, Proposal } from '@shared/contracts';

export class LeadsService {
  /** Vendedor vê leads recebidos */
  static async getTenantLeads(): Promise<Lead[]> {
    const response = await api.get<Lead[]>('/leads/tenant');
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
}
