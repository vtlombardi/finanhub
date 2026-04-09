'use client';

import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useSubscription } from '@/hooks/useSubscription';
import { usePlans } from '@/hooks/usePlans';
import { 
  Check, Shield, Zap, Target, Lock, BarChart3, 
  Sparkles, Loader2, AlertCircle, Info, ArrowUpRight
} from 'lucide-react';
import { PlanTier } from '@shared/contracts';
import '../../anuncie/pricing.css'; // Corrected path

export default function DashboardPlansPage() {
  useAuthGuard();
  const { usage, loading: usageLoading, error: usageError, checkLimit } = useSubscription();
  const { plans, loading: plansLoading, error: plansError } = usePlans();

  const isLoading = usageLoading || plansLoading;
  const hasError = usageError || plansError;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (hasError) {
    return (
      <AdminLayout>
        <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Erro ao carregar planos</h2>
          <p className="text-slate-400 max-w-md">{usageError || plansError}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="pricing-container dashboard-plans p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Dashboard */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
                Planos e <span className="text-cyan-400">Assinaturas</span>
              </h1>
              <p className="text-slate-400 text-lg">
                Gerencie sua assinatura, visualize seu consumo e faça o upgrade para recursos avançados.
              </p>
            </div>
            
            {usage && (
              <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Plano Ativo</p>
                  <p className="text-xl font-bold text-white">{usage.plan.name}</p>
                </div>
              </div>
            )}
          </div>

          {/* Usage Stats Grid */}
          {usage && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              <UsageCard 
                label="Anúncios Ativos" 
                metric={checkLimit('listings')} 
                icon={<BarChart3 className="w-4 h-4" />}
              />
              <UsageCard 
                label="Leads p/ Mês" 
                metric={checkLimit('leadsPerMonth')} 
                icon={<Zap className="w-4 h-4" />}
              />
              <UsageCard 
                label="Anúncios em Destaque" 
                metric={checkLimit('featuredListings')} 
                icon={<Target className="w-4 h-4" />}
              />
              <UsageCard 
                label="Docs Data Room" 
                metric={checkLimit('dataRoomDocs')} 
                icon={<Lock className="w-4 h-4" />}
              />
            </div>
          )}

          {/* Upgrade Section */}
          <div className="mb-8">
            <span className="section-tag">Upgrades Disponíveis</span>
            <h2 className="section-title !text-left !mb-10">Escale sua operação de M&A</h2>
            
            <div className="pricing-grid">
              {plans.map((plan) => {
                const isCurrent = usage?.plan.tier === plan.tier;
                
                return (
                  <div key={plan.id} className={`glass-card plan-card ${plan.highlight ? 'highlight' : ''}`}>
                    {plan.highlight && <div className="plan-badge">Ouro / Recomendado</div>}
                    {isCurrent && (
                      <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-md">
                        <Check className="w-3 h-3 text-cyan-400" /> Plano Atual
                      </div>
                    )}
                    
                    <div className="mb-10 pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="plan-name">{plan.name}</div>
                        {plan.tier === 'ELITE' && <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />}
                      </div>
                      <div className="text-cyan-400 text-sm font-bold tracking-tighter mb-2">{plan.power}</div>
                      <div className="plan-price">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plan.price)}
                        <span>{plan.recurrence}</span>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed mb-4">{plan.description}</p>
                      <div className="plan-impact-box">
                        <Info className="w-3 h-3 text-cyan-400" />
                        <span>{plan.impact}</span>
                      </div>
                    </div>

                    <ul className="feature-list">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="feature-item">
                          <Check className={`w-5 h-5 feature-icon ${feature.status === 'lock' ? 'opacity-30' : ''}`} />
                          <span className={feature.status === 'lock' ? 'opacity-50' : ''}>{feature.text}</span>
                        </li>
                      ))}
                    </ul>

                    <button 
                      className={`btn-premium ${plan.highlight ? 'btn-accent' : 'btn-base'} disabled:opacity-50 disabled:cursor-not-allowed`}
                      disabled={isCurrent}
                    >
                      {isCurrent ? 'Plano Ativo' : plan.cta}
                      {!isCurrent && <ArrowUpRight className="w-4 h-4 ml-2" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Additional Info / Security */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-white/[0.02] border border-white/5 rounded-3xl">
             <div className="flex gap-4">
                <Shield className="w-6 h-6 text-cyan-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-white mb-1">Pagamento Seguro</h4>
                  <p className="text-xs text-slate-500">Transações protegidas por criptografia de ponta e conformidade PCI.</p>
                </div>
             </div>
             <div className="flex gap-4">
                <Info className="w-6 h-6 text-cyan-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-white mb-1">Upgrade Imediato</h4>
                  <p className="text-xs text-slate-500">Ative novos recursos agora mesmo com cálculo pró-rata automático.</p>
                </div>
             </div>
             <div className="flex gap-4">
                <Lock className="w-6 h-6 text-cyan-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-white mb-1">Sigilo Absoluto</h4>
                  <p className="text-xs text-slate-500">Toda navegação e dados de negociação são confidenciais.</p>
                </div>
             </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}

function UsageCard({ label, metric, icon }: { label: string, metric: any, icon: React.ReactNode }) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 transition-all hover:bg-white/[0.05]">
      <div className="flex items-center justify-between mb-4">
        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
          {icon}
        </div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
      </div>
      
      <div className="flex items-end justify-between mb-2">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-white">{metric.current}</span>
          <span className="text-sm text-slate-500">/ {metric.unlimited ? '∞' : metric.limit}</span>
        </div>
        <span className={`text-[10px] font-bold ${metric.ok ? 'text-cyan-400' : 'text-red-400'}`}>
          {metric.ok ? 'OK' : 'LIMITE'}
        </span>
      </div>
      
      {!metric.unlimited && (
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${metric.percent > 90 ? 'bg-red-500' : 'bg-cyan-500'}`}
            style={{ width: `${metric.percent}%` }}
          />
        </div>
      )}
      {metric.unlimited && (
        <div className="h-1.5 w-full bg-cyan-500/10 rounded-full overflow-hidden border border-cyan-500/20">
           <div className="h-full w-full bg-cyan-500/20" />
        </div>
      )}
    </div>
  );
}
