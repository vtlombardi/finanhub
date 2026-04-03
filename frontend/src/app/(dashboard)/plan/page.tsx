'use client';

import { useState, useEffect } from 'react';
import { CreditCard, BarChart3, Zap, AlertTriangle, Crown, Check, ArrowUpRight, Star } from 'lucide-react';
import { PlansService } from '@/features/plans/plans.service';
import Link from 'next/link';

const FEATURE_LABELS: Record<string, { label: string; icon: any }> = {
  aiQualification: { label: 'Qualificação IA', icon: Zap },
  chat: { label: 'Chat Transacional', icon: Zap },
  prioritySupport: { label: 'Suporte Prioritário', icon: Crown },
  analytics: { label: 'Analytics Avançado', icon: BarChart3 },
  apiAccess: { label: 'Acesso a API', icon: Zap },
  customBranding: { label: 'Branding Custom', icon: Star },
};

export default function PlanDashboardPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [subscription, setSubscription] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [sub, u] = await Promise.all([
          PlansService.getSubscription(),
          PlansService.getUsage(),
        ]);
        setSubscription(sub);
        setUsage(u);
      } catch { /* backend offline */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const handleCancel = async () => {
    if (!confirm('Tem certeza que deseja cancelar sua assinatura?')) return;
    try {
      await PlansService.cancel();
      const [sub, u] = await Promise.all([
        PlansService.getSubscription(),
        PlansService.getUsage(),
      ]);
      setSubscription(sub);
      setUsage(u);
    } catch {
      alert('Erro ao cancelar.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="glass-panel h-40 rounded-xl bg-slate-800/50" />
        <div className="glass-panel h-60 rounded-xl bg-slate-800/50" />
      </div>
    );
  }

  const plan = usage?.plan || { tier: 'FREE', name: 'Starter' };
  const isFreeTier = subscription?.isFreeTier !== false;

  const UsageBar = ({ label, current, limit, unlimited }: { label: string; current: number; limit: number; unlimited: boolean }) => {
    const pct = unlimited ? 10 : Math.min(100, (current / limit) * 100);
    const isNearLimit = !unlimited && pct >= 80;
    const isAtLimit = !unlimited && current >= limit;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-300">{label}</span>
          <span className={`font-mono font-semibold ${isAtLimit ? 'text-red-400' : isNearLimit ? 'text-amber-400' : 'text-slate-200'}`}>
            {current} / {unlimited ? '∞' : limit}
          </span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-blue-500'}`}
            style={{ width: `${unlimited ? 100 : pct}%`, opacity: unlimited ? 0.3 : 1 }}
          />
        </div>
        {isAtLimit && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <AlertTriangle size={12} /> Limite atingido. Faça upgrade para continuar.
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100 flex items-center gap-2">
          <CreditCard size={24} className="text-blue-400" /> Meu Plano
        </h1>
        <p className="text-slate-400 text-sm mt-1">Gerencie sua assinatura e acompanhe o consumo de recursos.</p>
      </div>

      {/* Current Plan Card */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-500" />
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Crown size={22} className="text-amber-400" />
              <h2 className="text-xl font-bold text-slate-100">{plan.name}</h2>
              <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {plan.tier}
              </span>
            </div>
            {subscription?.subscription && (
              <div className="text-sm text-slate-400 space-y-1">
                <p>Ciclo: <span className="text-slate-300">{subscription.subscription.billingCycle === 'YEARLY' ? 'Anual' : 'Mensal'}</span></p>
                <p>Ativo desde: <span className="text-slate-300">{new Date(subscription.subscription.startDate).toLocaleDateString('pt-BR')}</span></p>
                {subscription.subscription.nextBillingAt && (
                  <p>Próxima cobrança: <span className="text-slate-300">{new Date(subscription.subscription.nextBillingAt).toLocaleDateString('pt-BR')}</span></p>
                )}
                {subscription.subscription.canceledAt && (
                  <p className="text-amber-400">⚠ Cancelamento solicitado em {new Date(subscription.subscription.canceledAt).toLocaleDateString('pt-BR')}</p>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Link href="/pricing" className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition flex items-center gap-1.5 shadow-lg shadow-blue-500/20">
              <ArrowUpRight size={16} /> {isFreeTier ? 'Fazer Upgrade' : 'Trocar Plano'}
            </Link>
            {!isFreeTier && !subscription?.subscription?.canceledAt && (
              <button
                onClick={handleCancel}
                className="px-4 py-2.5 border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/30 rounded-xl text-sm transition"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Usage Section */}
      {usage && (
        <div className="glass-panel rounded-xl p-6">
          <h3 className="font-semibold text-slate-200 mb-6 flex items-center gap-2">
            <BarChart3 size={18} className="text-blue-400" /> Consumo de Recursos
          </h3>
          <div className="space-y-5">
            <UsageBar
              label="Anúncios Ativos"
              current={usage.usage.listings.current}
              limit={usage.usage.listings.limit}
              unlimited={usage.usage.listings.unlimited}
            />
            <UsageBar
              label="Leads Recebidos (mês)"
              current={usage.usage.leadsPerMonth.current}
              limit={usage.usage.leadsPerMonth.limit}
              unlimited={usage.usage.leadsPerMonth.unlimited}
            />
            <UsageBar
              label="Anúncios em Destaque"
              current={usage.usage.featuredListings.current}
              limit={usage.usage.featuredListings.limit}
              unlimited={usage.usage.featuredListings.unlimited}
            />
          </div>
        </div>
      )}

      {/* Features Grid */}
      {usage?.features && (
        <div className="glass-panel rounded-xl p-6">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Zap size={18} className="text-indigo-400" /> Recursos do Plano
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(FEATURE_LABELS).map(([key, { label, icon: Icon }]) => {
              const enabled = usage.features[key];
              return (
                <div
                  key={key}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition ${
                    enabled
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-200'
                      : 'bg-slate-900/30 border-slate-800 text-slate-600'
                  }`}
                >
                  {enabled ? <Check size={16} className="text-emerald-400 flex-shrink-0" /> : <Icon size={16} className="flex-shrink-0" />}
                  <span className="text-sm">{label}</span>
                  {!enabled && (
                    <span className="ml-auto text-xs text-slate-600">Upgrade</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upgrade Banner */}
      {isFreeTier && (
        <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/20 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-200">Desbloqueie todo o potencial do Finanhub</h3>
            <p className="text-sm text-slate-400 mt-1">Publique mais anúncios, receba leads ilimitados e destaque suas ofertas.</p>
          </div>
          <Link href="/pricing" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/20 transition whitespace-nowrap">
            Ver Planos
          </Link>
        </div>
      )}
    </div>
  );
}
