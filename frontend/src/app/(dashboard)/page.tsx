'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Users, FileText, DollarSign, TrendingUp, Clock, AlertTriangle, Sparkles } from 'lucide-react';
import { DashboardService } from '@/features/dashboard/dashboard.service';
import { ListingsService } from '@/features/listings/listings.service';
import Link from 'next/link';

interface Metrics {
  listings: { total: number; active: number; pending: number; flagged: number };
  leads: { total: number };
  proposals: { total: number; volumeTotal: number };
}

export default function DashboardOverviewPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recommended, setRecommended] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [m, leads] = await Promise.all([
          DashboardService.getMetrics(),
          DashboardService.getRecentLeads(),
        ]);
        setMetrics(m);
        setRecentLeads(leads);
        // Fetch recommendations (non-blocking)
        ListingsService.getRecommended().then(setRecommended).catch(() => {});
      } catch {
        // Fallback silencioso — backend pode estar offline
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const cards = metrics
    ? [
        { label: 'Anúncios Ativos', value: metrics.listings.active, icon: BarChart3, color: 'emerald' },
        { label: 'Em Análise (IA)', value: metrics.listings.pending, icon: Clock, color: 'amber' },
        { label: 'Flagged', value: metrics.listings.flagged, icon: AlertTriangle, color: 'red' },
        { label: 'Leads Recebidos', value: metrics.leads.total, icon: Users, color: 'blue' },
        { label: 'Propostas', value: metrics.proposals.total, icon: FileText, color: 'indigo' },
        {
          label: 'Volume (R$)',
          value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(
            Number(metrics.proposals.volumeTotal),
          ),
          icon: DollarSign,
          color: 'cyan',
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-panel h-28 rounded-xl bg-slate-800/50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Dashboard Empresarial</h1>
        <p className="text-slate-400 text-sm mt-1">Visão consolidada da operação M&A do seu Tenant.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          const colorMap: Record<string, string> = {
            emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20',
            amber: 'from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/20',
            red: 'from-red-500/20 to-red-500/5 text-red-400 border-red-500/20',
            blue: 'from-blue-500/20 to-blue-500/5 text-blue-400 border-blue-500/20',
            indigo: 'from-indigo-500/20 to-indigo-500/5 text-indigo-400 border-indigo-500/20',
            cyan: 'from-cyan-500/20 to-cyan-500/5 text-cyan-400 border-cyan-500/20',
          };
          const classes = colorMap[card.color] || colorMap.blue;

          return (
            <div
              key={card.label}
              className={`glass-panel rounded-xl p-6 border bg-gradient-to-br ${classes} transition-all hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-300">{card.label}</span>
                <Icon size={20} />
              </div>
              <p className="text-3xl font-bold tracking-tight">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Leads Feed */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-2">
          <TrendingUp size={18} className="text-blue-400" />
          <h2 className="font-medium text-slate-200">Leads Recentes</h2>
        </div>

        {recentLeads.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            Nenhum lead captado ainda. Publique seus anúncios para atrair investidores.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {recentLeads.map((lead: any, i: number) => (
              <div key={lead.id || i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                <div>
                  <p className="text-sm font-medium text-slate-200">{lead.investor?.fullName || 'Investidor Anônimo'}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    interessado em <span className="text-slate-400">{lead.listing?.title || 'Anúncio'}</span>
                  </p>
                </div>
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Deals */}
      {recommended.length > 0 && (
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-400" />
            <h2 className="font-medium text-slate-200">Recomendados para Você</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommended.map((deal: any) => (
              <Link href={`/deals/${deal.slug || deal.id}`} key={deal.id} className="group">
                <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30 hover:border-indigo-500/40 transition-all">
                  <span className="text-xs text-slate-500">{deal.category?.name || 'M&A'}</span>
                  <h3 className="text-sm font-medium text-slate-200 mt-1 group-hover:text-indigo-400 transition-colors line-clamp-2">{deal.title}</h3>
                  <p className="font-mono text-sm text-slate-400 mt-2">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(Number(deal.price || 0))}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
