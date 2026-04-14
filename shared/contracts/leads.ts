/**
 * @shared/contracts/leads.ts
 * Contratos para Leads e Propostas formais.
 */

export type ProposalStatus = 'OPEN' | 'ACCEPTED' | 'REJECTED' | 'COUNTER_OFFER' | 'WITHDRAWN';

export interface Proposal {
  id: string;
  valueOffered: number;
  conditions: string | null;
  status: ProposalStatus;
  createdAt: string;
  updatedAt: string;
}

export type IntentLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type LeadStatus = 'NEW' | 'UNDER_REVIEW' | 'QUALIFIED' | 'CONTACTED' | 'PROPOSAL_SENT' | 'WON' | 'LOST';

export interface Lead {
  id: string;
  status: LeadStatus;
  
  // Dados do formulário estratégico
  userName?: string | null;
  userEmail?: string | null;
  userPhone?: string | null;
  userCompany?: string | null;
  objective?: string | null;
  investmentRange?: string | null;
  mediationAccepted: boolean;

  message: string;
  internalNotes?: string | null;
  score: number | null;
  intentLevel: IntentLevel | null;
  aiClassification: string | null;
  aiReasonSummary: string | null;
  aiRecommendedAction: string | null;
  aiProcessedAt: string | null;
  createdAt: string;
  listing: { 
    id: string; 
    title: string;
    city?: string | null;
    state?: string | null;
    category?: { name: string };
    tenant?: { name: string };
  };
  investor: { id: string; fullName: string; email: string };
  proposals: Proposal[];
}

/**
 * Filtros para a Central Operacional (Admin)
 */
export interface AdminLeadQuery {
  search?: string;
  status?: LeadStatus;
  interestType?: string;
  tenantId?: string;
  companyId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Resposta paginada de leads para admin
 */
export interface AdminLeadsResponse {
  data: Lead[];
  total: number;
  page: number;
  lastPage: number;
}
