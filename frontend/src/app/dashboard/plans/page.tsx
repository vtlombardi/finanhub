'use client';

import React from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useSubscription } from '@/hooks/useSubscription';
import { usePlans } from '@/hooks/usePlans';
import { 
  Check, Shield, Zap, Target, Lock, BarChart3, 
  Sparkles, Loader2, AlertCircle, Info, ArrowUpRight, Activity, Wallet, CreditCard
} from 'lucide-react';
import styles from '@/styles/Dashboard.module.css';
import '../../anuncie/pricing.css';

export default function DashboardPlansPage() {
  useAuthGuard();
  const { usage, loading: usageLoading, error: usageError, checkLimit } = useSubscription();
  const { plans, loading: plansLoading, error: plansError } = usePlans();

  const isLoading = usageLoading || plansLoading;
  const hasError = usageError || plansError;

  if (isLoading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '60vh' }}>
        <Loader2 className="w-12 h-12 text-[#00b8b2] animate-spin" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={styles.card} style={{ textAlign: 'center', padding: '100px 40px', margin: '40px auto', maxWidth: '500px', borderStyle: 'dashed' }}>
        <AlertCircle size={48} className="text-red-500 mx-auto mb-6" />
        <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#fff', marginBottom: '8px' }}>Erro de Provisionamento</h2>
        <p style={{ fontSize: '14px', color: '#64748b' }}>{usageError || plansError}</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Assinatura & Licenciamento</h1>
          <p>Gestão de cotas operacionais, faturamento e expansão de recursos M&A.</p>
        </div>
        {usage && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 24px', background: 'rgba(0,184,178,0.1)', border: '1px solid rgba(0,184,178,0.2)', borderRadius: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: '#00b8b215', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#00b8b2' }}>
              <Zap size={20} />
            </div>
            <div>
              <p style={{ fontSize: '10px', color: '#00b8b2', margin: 0, textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.05em' }}>Licença Ativa</p>
              <p style={{ fontSize: '16px', fontWeight: 900, color: '#fff', margin: 0 }}>{usage.plan.name}</p>
            </div>
          </div>
        )}
      </div>

      {/* Usage Analytics Grid */}
      {usage && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <UsageCard 
            label="Anúncios Ativos" 
            metric={checkLimit('listings')} 
            icon={<BarChart3 size={18} />}
            color="#00b8b2"
          />
          <UsageCard 
            label="Leads / Mês" 
            metric={checkLimit('leadsPerMonth')} 
            icon={<Zap size={18} />}
            color="#fb923c"
          />
          <UsageCard 
            label="Destaques Premium" 
            metric={checkLimit('featuredListings')} 
            icon={<Target size={18} />}
            color="#8b5cf6"
          />
          <UsageCard 
            label="Repositórios Data Room" 
            metric={checkLimit('lock')} 
            icon={<Lock size={18} />}
            color="#00b8b2"
          />
        </div>
      )}

      {/* Plans Selection */}
      <div className="mb-20">
        <div style={{ marginBottom: '48px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', margin: 0 }}>Escale sua Operação no Marketplace</h2>
          <p style={{ fontSize: '15px', color: '#64748b', margin: '8px 0 0', fontWeight: 600 }}>Provisione recursos avançados e aumente a liquidez dos seus ativos.</p>
        </div>
        
        <div className="pricing-grid">
          {plans.map((plan) => {
            const isCurrent = usage?.plan.tier === plan.tier;
            
            return (
              <div key={plan.id} className={`glass-card plan-card ${plan.highlight ? 'highlight' : ''}`} style={{ background: 'rgba(255,255,255,0.01)', borderColor: plan.highlight ? '#00b8b2' : 'rgba(255,255,255,0.05)', padding: '48px 40px', borderRadius: '32px' }}>
                {plan.highlight && <div className="plan-badge" style={{ background: '#00b8b2', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}>Ouro / Institutional</div>}
                
                {isCurrent && (
                  <div style={{ position: 'absolute', top: '24px', left: '24px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,184,178,0.1)', border: '1px solid rgba(0,184,178,0.2)', padding: '6px 14px', borderRadius: '10px', fontSize: '10px', color: '#00b8b2', fontWeight: 900, textTransform: 'uppercase' }}>
                    <CheckCircle size={12} /> Assinatura Atual
                  </div>
                )}
                
                <div style={{ marginBottom: '40px', paddingTop: isCurrent ? '32px' : '0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', margin: 0 }}>{plan.name}</h3>
                    {plan.tier === 'ELITE' && <Sparkles size={24} className="text-[#00b8b2] animate-pulse" />}
                  </div>
                  <div style={{ color: '#00b8b2', fontSize: '11px', fontWeight: 900, marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{plan.power}</div>
                  <div style={{ fontSize: '44px', fontWeight: 900, color: '#fff', marginBottom: '12px', letterSpacing: '-0.02em' }}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(plan.price)}
                    <span style={{ fontSize: '14px', color: '#475569', marginLeft: '6px', fontWeight: 700 }}>/ {plan.recurrence === 'year' ? 'ano' : 'mês'}</span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, margin: '0 0 24px', fontWeight: 600 }}>{plan.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', background: 'rgba(0,184,178,0.05)', borderRadius: '12px', fontSize: '11px', color: '#00b8b2', border: '1px solid rgba(0,184,178,0.1)', fontWeight: 700 }}>
                    <Shield size={14} />
                    <span>{plan.impact}</span>
                  </div>
                </div>

                <ul className="feature-list" style={{ marginBottom: '48px', listStyle: 'none', padding: 0 }}>
                  {plan.features.map((feature, idx) => (
                    <li key={idx} style={{ display: 'flex', gap: '14px', marginBottom: '16px', fontSize: '14px', color: feature.status === 'lock' ? '#1e293b' : '#fff', fontWeight: 600, opacity: feature.status === 'lock' ? 0.3 : 1 }}>
                      <Check size={16} className="shrink-0" style={{ color: feature.status === 'lock' ? 'inherit' : '#00b8b2', marginTop: '2px' }} />
                      <span>{feature.text}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  className={styles.btnBrand}
                  style={{ width: '100%', height: '56px', opacity: isCurrent ? 0.2 : 1, cursor: isCurrent ? 'default' : 'pointer', fontSize: '14px', fontWeight: 900, borderRadius: '16px' }}
                  disabled={isCurrent}
                >
                  {isCurrent ? 'Licença Ativa' : plan.cta}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security & Support Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-12 bg-white/[0.01] border border-white/[0.03] rounded-[40px] mb-12">
         <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ width: '48px', height: '48px', background: 'rgba(0,184,178,0.05)', borderRadius: '14px', display: 'grid', placeItems: 'center', color: '#00b8b2' }}>
               <CreditCard size={24} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 800, color: '#fff' }}>Pagamento Criptografado</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.6, fontWeight: 600 }}>Toda a infraestrutura de billing segue padrões internacionais de segurança bancária.</p>
            </div>
         </div>
         <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ width: '48px', height: '48px', background: 'rgba(0,184,178,0.05)', borderRadius: '14px', display: 'grid', placeItems: 'center', color: '#00b8b2' }}>
               <Zap size={24} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 800, color: '#fff' }}>Ativação Instantânea</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.6, fontWeight: 600 }}>Novos recursos são provisionados no seu terminal imediatamente após a confirmação.</p>
            </div>
         </div>
         <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ width: '48px', height: '48px', background: 'rgba(0,184,178,0.05)', borderRadius: '14px', display: 'grid', placeItems: 'center', color: '#00b8b2' }}>
               <Shield size={24} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 800, color: '#fff' }}>Privacidade Financeira</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.6, fontWeight: 600 }}>Seus dados de faturamento são restritos e protegidos por protocolos de sigilo absoluto.</p>
            </div>
         </div>
      </div>
    </>
  );
}

function UsageCard({ label, metric, icon, color }: { label: string, metric: any, icon: React.ReactNode, color: string }) {
  return (
    <div className={styles.card} style={{ padding: '24px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ width: '40px', height: '40px', background: `${color}10`, borderRadius: '10px', display: 'grid', placeItems: 'center', color: color }}>
          {icon}
        </div>
        <span style={{ fontSize: '10px', fontWeight: 900, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ fontSize: '28px', fontWeight: 900, color: '#fff' }}>{metric.current}</span>
          <span style={{ fontSize: '14px', color: '#475569', fontWeight: 700 }}>/ {metric.unlimited ? '∞' : metric.limit}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: 900, color: metric.ok ? '#10b981' : '#ef4444', textTransform: 'uppercase' }}>
           <Activity size={10} />
           {metric.ok ? 'Consumo Nominal' : 'Limite Atingido'}
        </div>
      </div>
      
      <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', overflow: 'hidden' }}>
        <div 
          style={{ 
            height: '100%', 
            width: metric.unlimited ? '100%' : `${metric.percent}%`, 
            background: metric.unlimited ? `linear-gradient(90deg, ${color}, transparent)` : (metric.percent > 90 ? '#ef4444' : color), 
            transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)',
            opacity: metric.unlimited ? 0.4 : 1
          }}
        />
      </div>
    </div>
  );
}
