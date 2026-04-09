import { useState, useEffect, useCallback } from 'react';
import { PlansService } from '@/services/plans.service';
import { PlanTier, SubscriptionUsage } from '@shared/contracts';

export function useSubscription() {
  const [usage, setUsage] = useState<SubscriptionUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = useCallback(async () => {
    try {
      setLoading(true);
      const data = await PlansService.getUsage();
      setUsage(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch subscription usage:', err);
      setError(err.response?.data?.message || 'Erro ao carregar dados de assinatura.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const hasTier = (minTier: PlanTier) => {
    if (!usage) return false;
    const tiers: PlanTier[] = ['BASE', 'PROFESSIONAL', 'ELITE'];
    return tiers.indexOf(usage.plan.tier) >= tiers.indexOf(minTier);
  };

  const hasFeature = (feature: keyof SubscriptionUsage['features']) => {
    return usage?.features[feature] || false;
  };

  const checkLimit = (metric: keyof SubscriptionUsage['usage']) => {
    if (!usage) return { ok: false, percent: 0, current: 0, limit: 0 };
    const m = usage.usage[metric];
    if (m.unlimited) return { ok: true, percent: 0, current: m.current, limit: -1 };
    const percent = (m.current / m.limit) * 100;
    return {
      ok: m.current < m.limit,
      percent: Math.min(percent, 100),
      current: m.current,
      limit: m.limit
    };
  };

  return {
    usage,
    loading,
    error,
    refresh: fetchUsage,
    hasTier,
    hasFeature,
    checkLimit,
  };
}
