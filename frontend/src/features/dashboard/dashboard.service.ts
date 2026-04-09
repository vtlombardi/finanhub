import { api } from '@/services/api.client';

export interface DashboardMetrics {
  listings: { total: number; active: number; pending: number; flagged: number };
  leads: { total: number };
  proposals: { total: number; volumeTotal: number };
}

export interface RecentLead {
  id: string;
  message: string;
  score: number | null;
  aiClassification: string | null;
  intentLevel: string | null;
  createdAt: string;
  investor: { fullName: string; email: string };
  listing: { title: string };
}

export interface TrendPoint {
  date: string;
  views: number;
  leads: number;
}

export interface AnalyticsSummary {
  kpis: {
    activeDeals: number;
    totalLeads: number;
    totalProposals: number;
    monthlyViews: number;
    conversionRate: string;
  };
  trends: TrendPoint[];
}

export class DashboardService {
  static async getMetrics(): Promise<DashboardMetrics> {
    const response = await api.get('/dashboard/metrics');
    return response.data;
  }

  static async getRecentLeads(): Promise<RecentLead[]> {
    const response = await api.get('/dashboard/recent-leads');
    return response.data;
  }

  static async getAnalytics(): Promise<AnalyticsSummary> {
    const response = await api.get('/dashboard/analytics/summary');
    return response.data;
  }
}
