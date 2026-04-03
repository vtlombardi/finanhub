'use client';

import { useState, useEffect } from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PlansService } from '@/features/plans/plans.service';
import { Check, X, Zap, Crown, Rocket, Building2 } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthProvider';
import { useRouter } from 'next/navigation';

const TIER_ICONS: Record<string, any> = {
  FREE: Zap,
  BASIC: Rocket,
  PRO: Crown,
  ENTERPRISE: Building2,
};

const TIER_COLORS: Record<string, { gradient: string; border: string; badge: string }> = {
  FREE: { gradient: 'from-slate-500 to-slate-600', border: 'border-slate-700', badge: 'bg-slate-500/10 text-slate-400' },
  BASIC: { gradient: 'from-blue-500 to-indigo-600', border: 'border-blue-500/30', badge: 'bg-blue-500/10 text-blue-400' },
  PRO: { gradient: 'from-amber-500 to-orange-500', border: 'border-amber-500/30', badge: 'bg-amber-500/10 text-amber-400' },
  ENTERPRISE: { gradient: 'from-emerald-500 to-teal-600', border: 'border-emerald-500/30', badge: 'bg-emerald-500/10 text-emerald-400' },
};

const FEATURE_LABELS: Record<string, string> = {
  hasAiQualification: 'Qualificação de Leads por IA',
  hasChat: 'Chat Transacional',
  hasPrioritySupport: 'Suporte Prioritário',
  hasAnalytics: 'Analytics Avançado',
  hasApiAccess: 'Acesso a API',
  hasCustomBranding: 'Branding Personalizado',
};

export default function PricingPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [billing, setBilling] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    PlansService.getPublicPlans().then(setPlans).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (planId: string) => {
    if (!isAuthenticated) {
      router.push('/login?callbackUrl=/pricing');
      return;
    }
    try {
      await PlansService.subscribe(planId, billing);
      router.push('/dashboard/plan');
    } catch {
      alert('Erro ao assinar plano.');
    }
  };

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-100 pb-20">
      <PublicHeader />

      <div className="pt-32 pb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
          Planos & Preços
        </h1>
        <p className="text-slate-400 mt-4 text-lg max-w-2xl mx-auto px-6">
          Escolha o plano ideal para sua operação M&A. Todos incluem acesso ao marketplace.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <span className={`text-sm ${billing === 'MONTHLY' ? 'text-slate-200' : 'text-slate-500'}`}>Mensal</span>
          <button
            onClick={() => setBilling(billing === 'MONTHLY' ? 'YEARLY' : 'MONTHLY')}
            className={`relative w-12 h-6 rounded-full transition-colors ${billing === 'YEARLY' ? 'bg-emerald-600' : 'bg-slate-700'}`}
          >
            <div className={`absolute top-0.5 h-5 w-5 bg-white rounded-full transition-transform ${billing === 'YEARLY' ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
          <span className={`text-sm ${billing === 'YEARLY' ? 'text-slate-200' : 'text-slate-500'}`}>
            Anual <span className="text-emerald-400 text-xs font-medium ml-1">-17%</span>
          </span>
        </div>
      </div>

      {loading ? (
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => <div key={i} className="glass-panel h-96 rounded-2xl animate-pulse bg-slate-800/50" />)}
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const colors = TIER_COLORS[plan.tier] || TIER_COLORS.FREE;
            const Icon = TIER_ICONS[plan.tier] || Zap;
            const price = billing === 'YEARLY' && plan.priceYearly
              ? Number(plan.priceYearly) / 12
              : Number(plan.price);
            const isPopular = plan.tier === 'PRO';

            return (
              <div
                key={plan.id}
                className={`glass-panel rounded-2xl overflow-hidden flex flex-col relative ${colors.border} ${isPopular ? 'ring-2 ring-amber-500/50 scale-[1.02]' : ''}`}
              >
                {isPopular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-center py-1 text-xs font-bold text-white uppercase tracking-wider">
                    Mais Popular
                  </div>
                )}

                <div className={`h-2 bg-gradient-to-r ${colors.gradient}`}></div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-white`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100">{plan.name}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.badge}`}>{plan.tier}</span>
                    </div>
                  </div>

                  {plan.description && (
                    <p className="text-sm text-slate-400 mb-4">{plan.description}</p>
                  )}

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-slate-100">
                        {price === 0 ? 'Grátis' : `R$${Math.round(price)}`}
                      </span>
                      {price > 0 && <span className="text-slate-500 text-sm">/mês</span>}
                    </div>
                    {billing === 'YEARLY' && plan.priceYearly && Number(plan.priceYearly) > 0 && (
                      <p className="text-xs text-emerald-400 mt-1">
                        R${Number(plan.priceYearly).toLocaleString('pt-BR')} cobrado anualmente
                      </p>
                    )}
                  </div>

                  {/* Limits */}
                  <div className="space-y-2 mb-6 text-sm">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Anúncios</span>
                      <span className="font-mono font-semibold">{plan.maxListings === -1 ? '∞' : plan.maxListings}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Leads/mês</span>
                      <span className="font-mono font-semibold">{plan.maxLeadsPerMonth === -1 ? '∞' : plan.maxLeadsPerMonth}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Destaques</span>
                      <span className="font-mono font-semibold">{plan.maxFeaturedListings === -1 ? '∞' : plan.maxFeaturedListings}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2 mb-6 flex-1">
                    {Object.entries(FEATURE_LABELS).map(([key, label]) => {
                      const enabled = plan[key];
                      return (
                        <div key={key} className={`flex items-center gap-2 text-sm ${enabled ? 'text-slate-300' : 'text-slate-600'}`}>
                          {enabled ? (
                            <Check size={14} className="text-emerald-400 flex-shrink-0" />
                          ) : (
                            <X size={14} className="flex-shrink-0" />
                          )}
                          <span>{label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                      isPopular
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-500/20'
                        : plan.tier === 'FREE'
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                        : 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/20'
                    }`}
                  >
                    {plan.tier === 'FREE' ? 'Começar Grátis' : plan.tier === 'ENTERPRISE' ? 'Falar com Vendas' : 'Assinar Agora'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
