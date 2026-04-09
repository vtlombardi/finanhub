export interface PricingFeature {
  text: string;
  status: 'check' | 'lock' | 'soon';
  tooltip?: string;
}

export interface PricingPlan {
  id: number;
  name: string;
  price: string;
  recurrence: string;
  power: string;
  description: string;
  cta: string;
  highlight: boolean;
  impact: string;
  features: PricingFeature[];
  metadata?: {
    level: 'base' | 'professional' | 'elite';
    businessGoal: string;
    dealmakingPower: number; // 1-10 scale for visual indicators
  };
}

export type FeatureFlag = keyof typeof PLAN_FEATURES;

export const PLAN_FEATURES = {
  HAYIA_MATCHING: 'hayia_matching',
  VIRTUAL_DATA_ROOM: 'virtual_data_room',
  NDA_FLOW: 'nda_flow',
  ADVISOR_SUPPORT: 'advisor_support',
} as const;
