import { useState, useEffect, useCallback } from 'react';
import { PlansService } from '@/services/plans.service';
import { Plan } from '@shared/contracts';

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const data = await PlansService.listPlans();
      setPlans(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch plans:', err);
      setError(err.response?.data?.message || 'Erro ao carregar planos disponíveis.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return {
    plans,
    loading,
    error,
    refresh: fetchPlans,
  };
}
