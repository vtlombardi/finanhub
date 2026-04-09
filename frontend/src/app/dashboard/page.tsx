'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  DashboardService,
  DashboardMetrics,
  RecentLead,
  AnalyticsSummary,
} from '@/features/dashboard/dashboard.service';
import {
  LayoutGrid,
  TrendingUp,
  Users,
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ArrowRight,
  BarChart2,
  Eye,
  Zap,
} from 'lucide-react';

import { HayiaInsightCard } from '@/components/plans/HayiaInsightCard';

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex items-start gap-4 hover:border-slate-700 transition-colors">
      <div className={`p-3 rounded-xl ${color} shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold text-white leading-none">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Mini bar chart (sem dependência externa) ─────────────────────────────────
function TrendsChart({ trends }: { trends: AnalyticsSummary['trends'] }) {
  const maxViews = Math.max(...trends.map((t) => t.views), 1);
  const maxLeads = Math.max(...trends.map((t) => t.leads), 1);
  const globalMax = Math.max(maxViews, maxLeads, 1);

  const dayLabels = trends.map((t) => {
    const d = new Date(t.date + 'T12:00:00');
    return d.toLocaleDateString('pt-BR', { weekday: 'short' });
  });

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-white">Atividade — Últimos 7 dias</h3>
          <p className="text-xs text-slate-500 mt-0.5">Visualizações e novos leads</p>
        </div>
        <div className="flex gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block"></span> Visitas
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block"></span> Leads
          </span>
        </div>
      </div>

      <div className="flex items-end gap-2 h-32">
        {trends.map((t, i) => (
          <div key={t.date} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex gap-0.5 items-end h-24">
              <div
                className="flex-1 bg-blue-500/70 rounded-t-sm transition-all"
                style={{ height: `${(t.views / globalMax) * 100}%`, minHeight: t.views > 0 ? '4px' : '0' }}
                title={`${t.views} visitas`}
              />
              <div
                className="flex-1 bg-emerald-500/70 rounded-t-sm transition-all"
                style={{ height: `${(t.leads / globalMax) * 100}%`, minHeight: t.leads > 0 ? '4px' : '0' }}
                title={`${t.leads} leads`}
              />
            </div>
            <span className="text-[10px] text-slate-600 capitalize">{dayLabels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Intent badge ─────────────────────────────────────────────────────────────
function IntentBadge({ level }: { level: string | null }) {
  if (!level) return null;
  const map: Record<string, string> = {
    HIGH: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    MEDIUM: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    LOW: 'bg-slate-700 text-slate-400 border-slate-600',
  };
  const labels: Record<string, string> = { HIGH: 'Alta', MEDIUM: 'Média', LOW: 'Baixa' };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${map[level] ?? map.LOW}`}>
      {labels[level] ?? level}
    </span>
  );
}

// ─── Classification badge ─────────────────────────────────────────────────────
function ClassBadge({ cls }: { cls: string | null }) {
  if (!cls) return <span className="text-[10px] text-slate-600 italic">Aguardando IA</span>;
  const map: Record<string, string> = {
    QUALIFIED: 'text-emerald-400',
    WARM: 'text-amber-400',
    UNQUALIFIED: 'text-slate-500',
  };
  const labels: Record<string, string> = {
    QUALIFIED: 'Qualificado',
    WARM: 'Morno',
    UNQUALIFIED: 'Não qualificado',
  };
  return (
    <span className={`text-[10px] font-medium ${map[cls] ?? 'text-slate-400'}`}>
      {labels[cls] ?? cls}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  useAuthGuard();
  const { user } = useAuth();

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [leads, setLeads] = useState<RecentLead[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [m, l] = await Promise.all([
          DashboardService.getMetrics(),
          DashboardService.getRecentLeads(),
        ]);
        setMetrics(m);
        setLeads(l);
      } catch (err) {
        console.error('Dashboard metrics error:', err);
      }

      try {
        const a = await DashboardService.getAnalytics();
        setAnalytics(a);
      } catch {
        // Analytics requer role OWNER/ADMIN — falha silenciosa para USER
      }

      setLoading(false);
    };

    load();
  }, []);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(v);

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}min atrás`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h atrás`;
    return `${Math.floor(hrs / 24)}d atrás`;
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#020617] text-slate-100 p-6 font-sans">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Painel de Controle</h1>
            <p className="text-sm text-slate-500 mt-1">
              Bem-vindo de volta{user?.email ? `, ${user.email}` : ''}.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard/listings/new/edit"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              <Zap className="w-4 h-4" /> Novo Anúncio
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm text-slate-500">Carregando painel...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <HayiaInsightCard />

            {/* KPIs row 1 — Listings */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                label="Total de Anúncios"
                value={metrics?.listings.total ?? 0}
                icon={LayoutGrid}
                color="bg-blue-600"
              />
              <KpiCard
                label="Anúncios Ativos"
                value={metrics?.listings.active ?? 0}
                sub="visíveis no marketplace"
                icon={CheckCircle}
                color="bg-emerald-600"
              />
              <KpiCard
                label="Em Revisão IA"
                value={metrics?.listings.pending ?? 0}
                sub="aguardando aprovação"
                icon={Clock}
                color="bg-amber-600"
              />
              <KpiCard
                label="Sinalizados"
                value={metrics?.listings.flagged ?? 0}
                sub="requer atenção"
                icon={AlertTriangle}
                color="bg-red-600"
              />
            </div>

            {/* KPIs row 2 — Leads/Proposals/Analytics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                label="Total de Leads"
                value={metrics?.leads.total ?? 0}
                sub="investidores interessados"
                icon={Users}
                color="bg-indigo-600"
              />
              <KpiCard
                label="Propostas"
                value={metrics?.proposals.total ?? 0}
                icon={FileText}
                color="bg-violet-600"
              />
              <KpiCard
                label="Volume de Propostas"
                value={formatCurrency(Number(metrics?.proposals.volumeTotal ?? 0))}
                sub="valor total ofertado"
                icon={DollarSign}
                color="bg-teal-600"
              />
              <KpiCard
                label="Visitas (30 dias)"
                value={analytics?.kpis.monthlyViews ?? 0}
                sub={`Conversão: ${analytics?.kpis.conversionRate ?? '0%'}`}
                icon={Eye}
                color="bg-sky-600"
              />
            </div>

            {/* Trends + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart — takes 2/3 */}
              <div className="lg:col-span-2">
                {analytics?.trends && analytics.trends.length > 0 ? (
                  <TrendsChart trends={analytics.trends} />
                ) : (
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex items-center justify-center h-full min-h-[200px]">
                    <div className="text-center">
                      <BarChart2 className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                      <p className="text-sm text-slate-600">Dados de tendência disponíveis após as primeiras visitas.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick actions — takes 1/3 */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-white mb-2">Ações Rápidas</h3>

                {[
                  { label: 'Gerenciar Anúncios', href: '/dashboard/listings', icon: LayoutGrid, desc: 'Ver, editar e criar' },
                  { label: 'Mensagens', href: '/dashboard/messages', icon: TrendingUp, desc: 'Inbox de conversas' },
                  { label: 'Ver Marketplace', href: '/deals', icon: Eye, desc: 'Visualizar vitrine pública' },
                ].map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/60 transition-colors group"
                  >
                    <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-slate-700 transition-colors">
                      <action.icon className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200">{action.label}</p>
                      <p className="text-xs text-slate-600">{action.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                  </Link>
                ))}

                {/* Status summary */}
                {metrics && (metrics.listings.pending > 0 || metrics.listings.flagged > 0) && (
                  <div className="mt-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <p className="text-xs font-semibold text-amber-400 mb-1">Requer atenção</p>
                    {metrics.listings.pending > 0 && (
                      <p className="text-xs text-slate-400">
                        {metrics.listings.pending} anúncio{metrics.listings.pending > 1 ? 's' : ''} em revisão IA
                      </p>
                    )}
                    {metrics.listings.flagged > 0 && (
                      <p className="text-xs text-slate-400">
                        {metrics.listings.flagged} anúncio{metrics.listings.flagged > 1 ? 's' : ''} sinalizado{metrics.listings.flagged > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Leads */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-semibold text-white">Leads Recentes</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Últimas manifestações de interesse</p>
                </div>
                <Link
                  href="/dashboard/leads"
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
                >
                  Ver todos <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {leads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <Users className="w-10 h-10 text-slate-700 mb-3" />
                  <p className="text-sm text-slate-600">Nenhum lead recebido ainda.</p>
                  <p className="text-xs text-slate-700 mt-1">Ative seus anúncios para começar a receber interesse.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/60">
                  {leads.map((lead) => (
                    <div key={lead.id} className="px-6 py-4 hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0">
                          {/* Avatar */}
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 text-xs font-bold text-white">
                            {lead.investor.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-white">{lead.investor.fullName}</span>
                              <IntentBadge level={lead.intentLevel} />
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 truncate">
                              {lead.investor.email} · {lead.listing.title}
                            </p>
                            <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                              {lead.message}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 text-right space-y-1">
                          <p className="text-[10px] text-slate-600">{timeAgo(lead.createdAt)}</p>
                          <ClassBadge cls={lead.aiClassification} />
                          {lead.score !== null && (
                            <div className="flex items-center justify-end gap-1 mt-1">
                              <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500"
                                  style={{ width: `${lead.score}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-slate-500">{lead.score}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </AdminLayout>
  );
}
