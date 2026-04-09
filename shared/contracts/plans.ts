export type PlanTier = 'BASE' | 'PROFESSIONAL' | 'ELITE';

export interface PlanFeature {
  text: string;
  status: 'check' | 'dash' | 'lock';
}

export interface PlanMetadata {
  level: string;
  businessGoal: string;
  dealmakingPower: number;
}

export interface Plan {
  id: string;
  tier: PlanTier;
  name: string;
  description: string;
  price: number;
  recurrence: string;
  power: string;
  impact: string;
  cta: string;
  highlight: boolean;
  isPublic: boolean;
  metadata?: PlanMetadata;
  features: PlanFeature[];
}

export interface UsageMetric {
  current: number;
  limit: number;
  unlimited: boolean;
}

export interface SubscriptionUsage {
  plan: {
    tier: PlanTier;
    name: string;
  };
  usage: {
    listings: UsageMetric;
    leadsPerMonth: UsageMetric;
    featuredListings: UsageMetric;
    dataRoomDocs: UsageMetric;
  };
  features: {
    aiQualification: boolean;
    chat: boolean;
    prioritySupport: boolean;
    analytics: boolean;
    apiAccess: boolean;
    customBranding: boolean;
    aiMatching: boolean;
  };
}
