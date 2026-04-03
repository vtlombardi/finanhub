import { api } from '@/services/api.client';

export interface AnalyticsSummary {
  kpis: {
    activeDeals: number;
    totalLeads: number;
    totalProposals: number;
    monthlyViews: number;
    conversionRate: string;
  };
  trends: Array<{
    date: string;
    views: number;
    leads: number;
  }>;
}

export class AnalyticsService {
  static async getSummary(): Promise<AnalyticsSummary> {
    const response = await api.get('/api/dashboard/analytics/summary');
    return response.data;
  }

  static async exportLeads() {
    const response = await api.get('/api/dashboard/analytics/export/leads/csv', {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'leads-export.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}
