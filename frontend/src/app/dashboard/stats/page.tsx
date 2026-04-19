'use client';

import { useEffect, useState } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { api } from '@/services/api.client';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  TrendingUp, Eye, Users, DollarSign, Activity,
  Download, Loader2, RefreshCw, Shield, Zap, Info, ArrowUpRight
} from 'lucide-react';
import styles from '@/styles/Dashboard.module.css';
import { StatsKpis } from './components/StatsKpis';
import { PremiumChart } from './components/PremiumChart';
import { IntentAnalysis } from './components/IntentAnalysis';
import { HayiaAdvisory } from './components/HayiaAdvisory';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Kpis {
  activeDeals: number;
  totalLeads: number;
  leadsVariation: number;
  monthlyViews: number;
  viewsVariation: number;
  conversionRate: string;
  conversionVariation: string;
  potentialVolume: number;
}

interface TrendPoint {
  date: string;
  views: number;
  leads: number;
}

interface IntentPoint {
  level: string;
  count: number;
}

interface Summary {
  kpis: Kpis;
  trends: TrendPoint[];
  intentDistribution: IntentPoint[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTrendDate(iso: string) {
  const [, month, day] = iso.split('-');
  return `${day}/${month}`;
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0a0f1d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }}>
      <p style={{ color: '#64748b', fontSize: '11px', margin: '0 0 12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Período: {label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color, boxShadow: `0 0 10px ${p.color}` }} />
          <p style={{ color: '#fff', fontSize: '14px', margin: 0, fontWeight: 800 }}>
            {p.name}: <span style={{ color: p.color }}>{p.value}</span>
          </p>
        </div>
      ))}
    </div>
  );
}

function KpiCard({
  label, value, icon, sub, color
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  sub?: string;
  color: string;
}) {
  return (
    <div className={styles.card} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid rgba(255,255,255,0.03)', background: 'rgba(255,255,255,0.01)' }}>
      <div style={{ width: '40px', height: '40px', background: `${color}10`, borderRadius: '10px', display: 'grid', placeItems: 'center', color: color, border: `1px solid ${color}20` }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '32px', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.03em' }}>{value}</p>
        <p style={{ fontSize: '11px', color: '#64748b', margin: '6px 0 0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
        {sub && (
           <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
              <ArrowUpRight size={10} className="text-emerald-500" />
              <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 700 }}>{sub} em relação a jan/26</span>
           </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StatsPage() {
  useAuthGuard();

  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [days, setDays] = useState(30);

  const load = async (silent = false, period = days) => {
    if (silent) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      const { data } = await api.get<Summary>(`/dashboard/analytics/summary?days=${period}`);
      setSummary(data);
    } catch {
      setError('Falha na sincronização de inteligência operacional.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handlePeriodChange = (val: number) => {
    setDays(val);
    load(false, val);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data } = await api.get<string>('/dashboard/analytics/export/leads/csv');
      const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Erro na exportação do relatório.');
    } finally {
      setExporting(false);
    }
  };

  const trendData = summary?.trends.map(t => ({
    ...t,
    date: formatTrendDate(t.date),
  })) ?? [];

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '100vh', background: '#05070a' }}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#00b8b2] animate-spin mx-auto mb-4" />
          <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 700 }}>Recalibrando Inteligência...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px' }}>
        <div style={{ padding: '24px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239,68,68,0.05)', color: '#ef4444', textAlign: 'center' }}>
          {error}
        </div>
      </div>
    );
  }

  if (!summary) return null;

  let advisoryInsight = "Estabilidade operacional detectada. Mantenha o fluxo de respostas constante para garantir a conversão dos leads ativos.";
  if (summary.kpis.conversionRate === '0.00%') {
    advisoryInsight = "Seu ativo está recebendo visualizações, mas a falta de leads sugere que o preço ou a descrição podem estar fora da expectativa do mercado. Considere ajustar o pitch.";
  } else if (summary.kpis.leadsVariation > 20) {
    advisoryInsight = "Excelente performance! Seu pipeline cresceu significativamente. Recomendamos priorizar os leads de Alta Intenção para conversões rápidas.";
  } else if (summary.kpis.leadsVariation < -10) {
    advisoryInsight = "Notamos uma queda no volume de novos leads. Isso pode ser sazonal ou reflexo de novos competidores. Reúna seus documentos no Data Room para aumentar a confiança.";
  }

  return (
    <div className="p-0">
      <div className={styles.pageHeader}>
        <div>
          <h1>Inteligência & Performance</h1>
          <p>Visão estratégica consolidada e análise preditiva de ativos.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className={styles.btnGhost}
            style={{ height: '48px', padding: '0 20px', borderRadius: '12px' }}
          >
            <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Sincronizar Dados
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className={styles.btnBrand}
            style={{ height: '48px', padding: '0 24px', borderRadius: '12px' }}
          >
            {exporting
              ? <Loader2 size={16} className="mr-2 animate-spin" />
              : <Download size={16} className="mr-2" />
            }
            Exportar Bi-Leads
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '32px', display: 'flex', gap: '8px' }}>
        {[7, 30, 90].map((p) => (
          <button
            key={p}
            onClick={() => handlePeriodChange(p)}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 800,
              transition: 'all 0.2s',
              background: days === p ? 'rgba(0,184,178,0.1)' : 'rgba(255,255,255,0.02)',
              color: days === p ? '#00b8b2' : '#64748b',
              border: `1px solid ${days === p ? 'rgba(0,184,178,0.2)' : 'rgba(255,255,255,0.05)'}`,
            }}
          >
            Últimos {p} dias
          </button>
        ))}
      </div>

      <StatsKpis kpis={summary.kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-8">
          <PremiumChart data={summary.trends} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <IntentAnalysis data={summary.intentDistribution} />
            <div className={styles.card} style={{ padding: '32px' }}>
               <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: 0 }}>Distribuição Regional</h3>
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Áreas com maior incidência de interesse.</p>
               </div>
               <div style={{ padding: '40px 0', textAlign: 'center', opacity: 0.4 }}>
                  <Activity size={40} className="mx-auto mb-4 text-[#64748b]" />
                  <p style={{ fontSize: '13px', fontWeight: 700 }}>Processando dados geográficos...</p>
               </div>
            </div>
          </div>
        </div>

        <div className="col-span-1">
          <HayiaAdvisory 
            score={94.2} 
            trend={summary.kpis.leadsVariation >= 0 ? `Tendência de Alta (+${summary.kpis.leadsVariation.toFixed(1)}%)` : `Tendência de Baixa (${summary.kpis.leadsVariation.toFixed(1)}%)`}
            insight={advisoryInsight}
          />
        </div>
      </div>
    </div>
  );
}
