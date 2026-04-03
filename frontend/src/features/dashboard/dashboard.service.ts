import { api } from '@/services/api.client';

export class DashboardService {
  /** KPIs analíticos do Tenant */
  static async getMetrics() {
    const response = await api.get('/dashboard/metrics');
    return response.data;
  }

  /** Leads recentes para feed do painel */
  static async getRecentLeads() {
    const response = await api.get('/dashboard/recent-leads');
    return response.data;
  }
}
