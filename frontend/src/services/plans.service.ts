import { api } from './api.client';
import { Plan, SubscriptionUsage } from '@shared/contracts';

export class PlansService {
  /**
   * Lista todos os planos públicos disponíveis para assinatura.
   */
  static async listPlans(): Promise<Plan[]> {
    const res = await api.get('/plans');
    return res.data;
  }

  /**
   * Retorna o consumo atual do tenant vs. limites do plano ativo.
   */
  static async getUsage(): Promise<SubscriptionUsage> {
    const res = await api.get('/plans/usage');
    return res.data;
  }

  /**
   * Ativa uma assinatura de plano para um tenant. 
   */
  static async subscribe(planId: string, billingCycle = 'MONTHLY'): Promise<any> {
    const res = await api.post('/plans/subscribe', { planId, billingCycle });
    return res.data;
  }

  /**
   * Cancela a assinatura ativa (downgrade para BASE).
   */
  static async cancel(reason?: string): Promise<any> {
    const res = await api.post('/plans/cancel', { reason });
    return res.data;
  }

  /**
   * Toggle featured no listing com verificação de limite do plano.
   */
  static async toggleFeatured(listingId: string): Promise<any> {
    const res = await api.post(`/plans/feature/${listingId}`);
    return res.data;
  }
}
