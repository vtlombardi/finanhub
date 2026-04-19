'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { 
  Users, Building, FileText, Target, Wallet, TrendingUp, 
  Clock, ShieldAlert, CheckCircle2, XCircle, Loader2,
  ChevronRight, ArrowUpRight, ArrowDownRight, Activity, 
  PieChart as PieChartIcon, AlertTriangle, Tag, Shield, Zap, Info, ArrowUpLeft
} from 'lucide-react';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { useAuth } from '@/features/auth/AuthProvider';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import styles from '@/styles/Dashboard.module.css';

const COLORS = ['#00b8b2', '#2dd4bf', '#0ea5e9', '#6366f1', '#a855f7'];

export default function AdminGlobalDashboardPage() {
  useAuthGuard(['ADMIN', 'OWNER']);
  const { user } = useAuth();
  const { data, loading, error, approveListing, rejectListing } = useAdminDashboard();
  const [actingId, setActingId] = useState<string | null>(null);

  const handleModeration = async (id: string, action: 'APPROVE' | 'REJECT') => {
    setActingId(id);
    if (action === 'APPROVE') {
      await approveListing(id);
    } else {
      const reason = prompt('Motivo da rejeição técnica:');
      if (reason) await rejectListing(id, reason);
    }
    setActingId(null);
  };

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 className="w-12 h-12 text-[#00b8b2] animate-spin mb-4 mx-auto" />
          <p style={{ color: '#8fa6c3', fontSize: '14px', fontWeight: 600 }}>Consolidando Terminal de Inteligência...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '50vh', padding: '20px' }}>
        <div className={styles.card} style={{ textAlign: 'center', maxWidth: '400px', padding: '40px', borderColor: 'rgba(239,68,68,0.2)' }}>
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>Terminal Restrito</h2>
          <p style={{ color: '#ef4444', fontSize: '13px' }}>{error}</p>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const cardData = [
    { label: 'Market Users', value: kpis.totalUsers, icon: <Users size={16} />, color: '#3b82f6', trend: '+4%' },
    { label: 'Workspaces', value: kpis.totalTenants, icon: <Building size={16} />, color: '#10b981', trend: '+2%' },
    { label: 'Ativos Totais', value: kpis.totalListings, icon: <FileText size={16} />, color: '#00b8b2', trend: '+12%' },
    { label: 'Fluxo Leads', value: kpis.totalLeads, icon: <Target size={16} />, color: '#6366f1', trend: '+8%' },
    { label: 'Revenue (30d)', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(kpis.estimatedRevenue30d || 0), icon: <Wallet size={16} />, color: '#fb923c', trend: '+15%' },
  ];

  return (
    <>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Shield className="w-7 h-7 text-[#00b8b2]" /> Admin Terminal Command Center
          </h1>
          <p>Supervisão ética e operacional global. Telemetria em tempo real do ecossistema Finanhub.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
           <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
             <Clock className="w-4 h-4 text-[#8fa6c3]" />
             <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
               {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} · ONLINE
             </span>
           </div>
        </div>
      </div>

      {/* KPI Stream */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {cardData.map((kpi, idx) => (
          <div key={idx} className={styles.card} style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${kpi.color}10`, display: 'grid', placeItems: 'center', color: kpi.color }}>
                {kpi.icon}
              </div>
              <span style={{ fontSize: '10px', fontWeight: 900, color: '#10b981' }}>{kpi.trend}</span>
            </div>
            <p style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 900, color: '#fff' }}>{kpi.value.toLocaleString()}</p>
            <p style={{ margin: 0, fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Moderation & Intelligence */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Fila de Moderação */}
          <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <AlertTriangle size={18} className="text-[#fb923c]" /> Fila de Moderação de Segurança
               </h3>
               <span className={`${styles.badge} ${styles.bOrange}`} style={{ fontSize: '10px' }}>
                 {data.moderationQueue?.length || 0} URGENTES
               </span>
            </div>

            {data.moderationQueue?.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                 <CheckCircle2 size={40} style={{ color: '#10b981', opacity: 0.2, margin: '0 auto 16px' }} />
                 <p style={{ color: '#8fa6c3', fontSize: '14px' }}>Nenhum ativo aguardando auditoria técnica.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {data.moderationQueue.slice(0, 5).map((item: any) => (
                  <div key={item.id} style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} className="hover:bg-white/[0.01] transition-all">
                    <div style={{ minWidth: 0, flex: 1 }}>
                       <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#fff' }} className="truncate">{item.title}</h4>
                       <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                          <span style={{ fontSize: '10px', color: '#8fa6c3', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Building size={12} style={{ color: '#64748b' }} /> {item.tenant.name}
                          </span>
                          <span style={{ fontSize: '10px', color: '#8fa6c3', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Tag size={12} style={{ color: '#64748b' }} /> {item.category.name}
                          </span>
                       </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginLeft: '20px' }}>
                       {actingId === item.id ? (
                         <Loader2 className="w-5 h-5 text-[#00b8b2] animate-spin" />
                       ) : (
                         <>
                           <button onClick={() => handleModeration(item.id, 'APPROVE')} className={styles.btnGhost} style={{ width: '36px', height: '36px', padding: 0, color: '#10b981' }}><CheckCircle2 size={18} /></button>
                           <button onClick={() => handleModeration(item.id, 'REJECT')} className={styles.btnGhost} style={{ width: '36px', height: '36px', padding: 0, color: '#ef4444' }}><XCircle size={18} /></button>
                           <Link href={`/dashboard/listings/${item.id}/edit`} className={styles.btnGhost} style={{ width: '36px', height: '36px', padding: 0 }}><ChevronRight size={18} /></Link>
                         </>
                       )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {data.moderationQueue?.length > 5 && (
              <Link href="/dashboard/moderation" style={{ display: 'block', padding: '12px', textAlign: 'center', fontSize: '11px', fontWeight: 800, color: '#8fa6c3', background: 'rgba(255,255,255,0.01)', textTransform: 'uppercase', letterSpacing: '0.1em' }} className="hover:text-white transition-all">
                Acessar Fila Completa de Segurança →
              </Link>
            )}
          </div>

          {/* Operational Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className={styles.card} style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 24px', fontSize: '15px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <PieChartIcon size={18} className="text-[#00b8b2]" /> Segmentação do Ecossistema
                </h3>
                <div style={{ height: '220px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data.operationalSummary.topCategories}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="count"
                            >
                                {data.operationalSummary.topCategories.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}
                                itemStyle={{ color: '#fff' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                   {data.operationalSummary.topCategories.map((cat: any, idx: number) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                         <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: COLORS[idx % COLORS.length] }} />
                         <span style={{ fontSize: '11px', color: '#8fa6c3' }}>{cat.name}</span>
                         <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff', marginLeft: 'auto' }}>{cat.count}</span>
                      </div>
                   ))}
                </div>
             </div>

             <div className={styles.card} style={{ display: 'grid', placeItems: 'center', textAlign: 'center', padding: '40px' }}>
                 <div>
                   <TrendingUp className="w-10 h-10 text-[#00b8b2] mx-auto mb-6 opacity-40 shadow-xl shadow-[#00b8b2]/20" />
                   <h4 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 800, color: '#fff' }}>Estabilidade do Core</h4>
                   <p style={{ margin: 0, fontSize: '13px', color: '#8fa6c3', lineHeight: 1.6 }}>Crescimento orgânico de <b>12%</b>.<br/>Base operacional operando em alta performance sem anomalias detectadas.</p>
                 </div>
             </div>
          </div>
        </div>

        {/* Right Column: Global Activity Log */}
        <div className="lg:col-span-4">
           <div className={styles.card} style={{ padding: 0, overflow: 'hidden', height: '100%' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Activity size={18} className="text-[#6366f1]" />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#fff' }}>Fluxo Global de Eventos</h3>
              </div>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {data.activityFeed?.map((log: any, idx: number) => (
                  <div key={log.id} style={{ position: 'relative', paddingLeft: '24px' }}>
                     <div style={{ position: 'absolute', left: 0, top: '6px', width: '8px', height: '8px', borderRadius: '50%', background: log.type === 'NEW_LEAD' ? '#6366f1' : 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.05)' }} />
                     {idx < data.activityFeed.length - 1 && (
                       <div style={{ position: 'absolute', left: '3px', top: '18px', width: '2px', height: 'calc(100% + 2px)', background: 'rgba(255,255,255,0.03)' }} />
                     )}
                     <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#eef6ff' }}>{log.title}</p>
                     <p style={{ margin: '2px 0 0', fontSize: '10px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {new Date(log.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} · {log.type}
                     </p>
                     {log.metadata?.investor && (
                        <div style={{ marginTop: '8px', padding: '6px 10px', borderRadius: '6px', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                           <Info size={10} className="text-[#6366f1]" />
                           <span style={{ fontSize: '10px', fontWeight: 800, color: '#6366f1' }}>{log.metadata.investor}</span>
                        </div>
                     )}
                  </div>
                ))}
                {(!data.activityFeed || data.activityFeed.length === 0) && (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>Nenhum log operacional no período.</div>
                )}
              </div>
              <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 'auto' }}>
                 <button className={styles.btnGhost} style={{ width: '100%', border: 'none', background: 'rgba(255,255,255,0.02)', fontSize: '11px', fontWeight: 800 }}>
                   VER REGISTROS AUDITÁVEIS COMPLETOS
                 </button>
              </div>
           </div>
        </div>
      </div>
    </>
  );
}
