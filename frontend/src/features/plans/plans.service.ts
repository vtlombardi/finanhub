import { api } from '@/services/api.client';

export class PlansService {
  static async getPublicPlans() {
    const res = await api.get('/plans');
    return res.data;
  }

  static async getSubscription() {
    const res = await api.get('/plans/subscription');
    return res.data;
  }

  static async getUsage() {
    const res = await api.get('/plans/usage');
    return res.data;
  }

  static async subscribe(planId: string, billingCycle = 'MONTHLY') {
    const res = await api.post('/plans/subscribe', { planId, billingCycle });
    return res.data;
  }

  static async cancel(reason?: string) {
    const res = await api.post('/plans/cancel', { reason });
    return res.data;
  }

  static async toggleFeatured(listingId: string) {
    const res = await api.post(`/plans/feature/${listingId}`);
    return res.data;
  }
}
