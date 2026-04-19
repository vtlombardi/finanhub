'use client';

import { useMyInterests } from '@/hooks/useMyInterests';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { 
  Send, 
  MapPin, 
  Calendar, 
  DollarSign, 
  ExternalLink, 
  Loader2, 
  Inbox, 
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Shield,
  MessageSquare,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import styles from '@/styles/Dashboard.module.css';

// ─── Status Configuration ────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: any }> = {
  NEW: { 
    label: 'Manifestado', 
    cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    icon: Inbox
  },
  UNDER_REVIEW: { 
    label: 'Em Auditoria', 
    cls: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    icon: Search
  },
  QUALIFIED: { 
    label: 'Qualificado', 
    cls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    icon: Sparkles
  },
  CONTACTED: { 
    label: 'In Dialogue', 
    cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    icon: Send
  },
  PROPOSAL_SENT: { 
    label: 'Proposta Emitida', 
    cls: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    icon: DollarSign
  },
  WON: { 
    label: 'Vencedor / Fechado', 
    cls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    icon: CheckCircle2
  },
  LOST: { 
    label: 'Encerrado', 
    cls: 'bg-slate-700/50 text-slate-400 border-slate-600',
    icon: Clock
  },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function MyInterestsPage() {
  useAuthGuard();
  const { interests, loading, error } = useMyInterests();

  const total = interests.length;
  const analysis = interests.filter(i => i.status === 'UNDER_REVIEW').length;
  const active = interests.filter(i => ['QUALIFIED', 'PROPOSAL_SENT', 'CONTACTED'].includes(i.status)).length;

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Monitoramento de Interesses</h1>
          <p>Gestão estratégica de ativos em fase de prospecção e negociação ativa.</p>
        </div>
        <Link 
          href="/oportunidades"
          className={styles.btnBrand}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 24px', height: '48px' }}
        >
          Explorar Oportunidades
          <ArrowRight size={18} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Oportunidades Salvas', value: total, icon: Shield, color: '#3b82f6' },
          { label: 'Fase de Auditoria', value: analysis, icon: Activity, color: '#fb923c' },
          { label: 'Negociações Ativas', value: active, icon: Zap, color: '#10b981' },
        ].map((stat, idx) => (
          <div key={idx} className={styles.card} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}>
            <div style={{ width: '48px', height: '48px', background: `${stat.color}10`, borderRadius: '12px', display: 'grid', placeItems: 'center', color: stat.color, border: `1px solid ${stat.color}20` }}>
              <stat.icon size={22} />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 900, color: '#fff', margin: 0 }}>{stat.value}</p>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '4px 0 0' }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'grid', placeItems: 'center', height: '40vh' }}>
          <Loader2 className="w-12 h-12 text-[#00b8b2] animate-spin" />
        </div>
      ) : error ? (
        <div className={styles.card} style={{ textAlign: 'center', padding: '60px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <Shield size={40} className="text-red-500 mx-auto mb-4" />
          <p style={{ color: '#ef4444', fontWeight: 800 }}>Erro na sincronização de interesses: {error}</p>
        </div>
      ) : interests.length === 0 ? (
        <div className={styles.card} style={{ textAlign: 'center', padding: '100px 40px', borderStyle: 'dashed' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', width: '64px', height: '64px', borderRadius: '16px', margin: '0 auto 24px', display: 'grid', placeItems: 'center' }}>
             <Inbox size={32} style={{ color: '#1e293b' }} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>Nenhum interesse mapeado</h3>
          <p style={{ color: '#64748b', marginBottom: '32px' }}>Acesse o marketplace institucional para manifestar interesse em ativos qualificados.</p>
          <Link href="/oportunidades" className={styles.btnBrand} style={{ display: 'inline-flex' }}>
            Explorar Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {interests.map((interest) => {
            const config = STATUS_CONFIG[interest.status] || STATUS_CONFIG.NEW;
            const StatusIcon = config.icon;

            return (
              <div key={interest.id} className={styles.card} style={{ padding: '32px', display: 'flex', flexDirection: 'column', minHeight: '300px', border: '1px solid rgba(255,255,255,0.03)', background: 'rgba(255,255,255,0.01)', transition: '0.3s' }} className="hover:border-white/10 group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: '#00b8b2', background: 'rgba(0,184,178,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                        {interest.listing.category?.name || 'Asset'}
                      </span>
                      <span style={{ fontSize: '10px', color: '#334155', fontWeight: 800 }}>REF: #{interest.id.split('-')[0].toUpperCase()}</span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#fff' }} className="truncate">
                      {interest.listing.title}
                    </h3>
                  </div>
                  <span className={`${styles.badge} ${config.cls}`} style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', padding: '6px 12px' }}>
                    <StatusIcon size={12} className="mr-2" />
                    {config.label}
                  </span>
                </div>

                {/* Info Hierarchy */}
                <div className="grid grid-cols-2 gap-y-6 gap-x-8 mb-8">
                  <div className="flex items-center gap-4">
                    <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', display: 'grid', placeItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <DollarSign size={16} className="text-[#00b8b2]" />
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', color: '#475569', margin: 0, textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>Cap. Proposto</p>
                      <p style={{ fontSize: '14px', color: '#fff', margin: '2px 0 0', fontWeight: 700 }}>{interest.investmentRange || 'Under evaluation'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', display: 'grid', placeItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <Sparkles size={16} className="text-[#fb923c]" />
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', color: '#475569', margin: 0, textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>Objetivo</p>
                      <p style={{ fontSize: '14px', color: '#fff', margin: '2px 0 0', fontWeight: 700 }}>{interest.objective || 'STRATEGIC'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', display: 'grid', placeItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <Calendar size={16} className="text-[#64748b]" />
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', color: '#475569', margin: 0, textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>Data Início</p>
                      <p style={{ fontSize: '14px', color: '#fff', margin: '2px 0 0', fontWeight: 700 }}>
                        {new Date(interest.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', display: 'grid', placeItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <MapPin size={16} className="text-[#64748b]" />
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', color: '#475569', margin: 0, textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>Marketplace</p>
                      <p style={{ fontSize: '14px', color: '#fff', margin: '2px 0 0', fontWeight: 700 }}>
                        {interest.listing.city || 'Brazil / Global'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                     <Shield size={14} className="text-[#00b8b2] opacity-50" />
                     <span style={{ fontSize: '11px', color: '#475569', fontWeight: 700, textTransform: 'uppercase' }}>Intermediação Segura</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link 
                      href={`/dashboard/messages`}
                      className={styles.btnGhost}
                      style={{ fontSize: '12px', height: '40px', padding: '0 16px', borderRadius: '10px' }}
                    >
                      <MessageSquare size={14} className="mr-2" />
                      Chat
                    </Link>
                    <Link 
                      href={`/oportunidades/${interest.listing.id}`}
                      className={styles.btnBrand}
                      style={{ fontSize: '12px', height: '40px', padding: '0 16px', borderRadius: '10px' }}
                    >
                      Ver Detalhes
                      <ArrowRight size={14} className="ml-2" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
