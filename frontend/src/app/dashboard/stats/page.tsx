'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { api } from '@/services/api.client';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  TrendingUp, Eye, Users, DollarSign, Activity,
  Download, Loader2, RefreshCw,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Kpis {
  activeDeals: number;
  totalLeads: number;
  totalProposals: number;
  monthlyViews: number;
  conversionRate: string;
}

interface TrendPoint {
  date: string;
  views: number;
  leads: number;
}

interface Summary {
  kpis: Kpis;
  trends: TrendPoint[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTrendDate(iso: string) {
  const [, month, day] = iso.split('-');
  return `${day}/${month}`;
}

// Custom tooltip for recharts
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, icon, sub,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl px-5 py-4 flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-white leading-none">{value}</p>
        <p className="text-xs text-slate-500 mt-1">{label}</p>
        {sub && <p className="text-[10px] text-slate-600 mt-0.5">{sub}</p>}
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

  const load = async (silent = false) => {
    if (silent) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      const { data } = await api.get<Summary>('/dashboard/analytics/summary');
      setSummary(data);
    } catch {
      setError('Erro ao carregar métricas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

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
      setError('Erro ao exportar leads.');
    } finally {
      setExporting(false);
    }
  };

  const trendData = summary?.trends.map(t => ({
    ...t,
    date: formatTrendDate(t.date),
  })) ?? [];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#020617] text-slate-100 p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-500" /> Métricas
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Performance do seu workspace nos últimos 30 dias.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => load(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 px-3 py-2 rounded-xl border border-slate-700 hover:border-slate-600 transition disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
            <button
              onClick={handleExport}
              disabled={exporting || !summary}
              className="flex items-center gap-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl border border-slate-700 transition disabled:opacity-40"
            >
              {exporting
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Download className="w-3.5 h-3.5" />
              }
              Exportar Leads CSV
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : summary ? (
          <>
            {/* KPI grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
              <KpiCard
                label="Deals ativos"
                value={summary.kpis.activeDeals}
                icon={<TrendingUp className="w-5 h-5 text-blue-400" />}
              />
              <KpiCard
                label="Leads recebidos"
                value={summary.kpis.totalLeads}
                icon={<Users className="w-5 h-5 text-violet-400" />}
              />
              <KpiCard
                label="Propostas formais"
                value={summary.kpis.totalProposals}
                icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
              />
              <KpiCard
                label="Views (30 dias)"
                value={summary.kpis.monthlyViews}
                icon={<Eye className="w-5 h-5 text-amber-400" />}
                sub="visitas aos seus anúncios"
              />
              <KpiCard
                label="Taxa de conversão"
                value={summary.kpis.conversionRate}
                icon={<Activity className="w-5 h-5 text-pink-400" />}
                sub="views → leads"
              />
            </div>

            {/* Trend chart */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-sm font-semibold text-white">Atividade — últimos 7 dias</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Visualizações e novos leads por dia</p>
                </div>
              </div>

              {trendData.every(d => d.views === 0 && d.leads === 0) ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-600">
                  <Activity className="w-8 h-8 mb-2 opacity-40" />
                  <p className="text-sm">Sem atividade nos últimos 7 dias.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={trendData} barGap={4} barCategoryGap="30%">
                    <CartesianGrid
                      vertical={false}
                      stroke="#1e293b"
                      strokeDasharray="3 3"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                      width={28}
                      allowDecimals={false}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: '11px', color: '#94a3b8', paddingTop: '16px' }}
                    />
                    <Bar
                      dataKey="views"
                      name="Visualizações"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={32}
                    />
                    <Bar
                      dataKey="leads"
                      name="Leads"
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}
