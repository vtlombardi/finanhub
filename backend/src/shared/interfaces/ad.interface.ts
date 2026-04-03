export interface IAd {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  price?: number;
  status: AdStatus;
  createdAt: Date;
}

export enum AdStatus {
  DRAFT = 'DRAFT',
  PENDING_AI_REVIEW = 'PENDING_AI_REVIEW',
  ACTIVE = 'ACTIVE',
  FLAGGED = 'FLAGGED'
}

export interface ILead {
  id: string;
  adId: string;
  investorId: string; // The user making the proposal
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt: Date;
}
