import { api } from './api.client';

export enum RecommendationType {
  LEAD_STALLED = 'LEAD_STALLED',
  HOT_LEAD_ACTIVITY = 'HOT_LEAD_ACTIVITY',
  NEGOTIATION_STUCK = 'NEGOTIATION_STUCK',
  LOW_PERFORMANCE = 'LOW_PERFORMANCE',
  DATAROOM_FOLLOWUP = 'DATAROOM_FOLLOWUP',
}

export interface Recommendation {
  id: string;
  type: RecommendationType;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  reason: string;
  suggestedAction: string;
  suggestedMessage?: string;
  metadata: any;
}

const AutomationService = {
  async getRecommendedActions(): Promise<Recommendation[]> {
    const { data } = await api.get('/automation/recommendations');
    return data;
  },
};

export default AutomationService;
