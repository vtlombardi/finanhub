'use client';

import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, Users, FileText, Eye, ArrowUpRight, ArrowDownRight, 
  Target, Download, Calendar
} from 'lucide-react';
import { AnalyticsService, AnalyticsSummary } from '@/features/analytics/analytics.service';

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AnalyticsService.getSummary()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Business Intelligence</h1>
          <p className="text-slate-500 mt-1">Desempenho operacional e métricas de conversão em tempo real.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            <Calendar className="w-4 h-4" />
            Últimos 30 dias
          </button>
          <button 
            onClick={() => AnalyticsService.exportLeads()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
          >
            <Download className="w-4 h-4" />
            Exportar Relatório
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Visualizações" 
          value={data?.kpis.monthlyViews || 0} 
          change="+12.5%" 
          icon={<Eye className="w-5 h-5 text-blue-600" />} 
          color="blue"
        />
        <KPICard 
          title="Novos Leads" 
          value={data?.kpis.totalLeads || 0} 
          change="+8.2%" 
          icon={<Users className="w-5 h-5 text-indigo-600" />} 
          color="indigo"
        />
        <KPICard 
          title="Taxa de Conversão" 
          value={data?.kpis.conversionRate || '0%'} 
          change="-0.4%" 
          icon={<Target className="w-5 h-5 text-emerald-600" />} 
          color="emerald"
        />
        <KPICard 
          title="Deals Ativos" 
          value={data?.kpis.activeDeals || 0} 
          change="---" 
          icon={<FileText className="w-5 h-5 text-amber-600" />} 
          color="amber"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Tendência de Engajamento
            </h3>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Views</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Leads</span>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.trends}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                <Area type="monotone" dataKey="leads" stroke="#6366f1" strokeWidth={3} fillOpacity={0.1} fill="#6366f1" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Small Stats / Summary Panel */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative">
          <div className="relative z-10">
            <h3 className="font-semibold text-lg mb-6">Eficiência do Pipeline</h3>
            <div className="space-y-6">
              <StatRow label="Leads por Deal" value="4.2" progress={70} />
              <StatRow label="Média propostas/lead" value="0.8" progress={45} />
              <StatRow label="Tempo médio p/ Resposta" value="1.5h" progress={85} />
              <StatRow label="Qualificação por IA" value="100%" progress={100} />
            </div>
            
            <div className="mt-12 p-4 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
              <p className="text-sm text-slate-300">Dica Pro:</p>
              <p className="text-xs text-white mt-1">Sua taxa de resposta está 20% acima da média do setor M&A.</p>
            </div>
          </div>
          {/* Background decoration */}
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, change, icon, color }: any) {
  const isUp = change.startsWith('+');
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 rounded-xl bg-${color}-50 group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        {change !== '---' && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {change}
          </span>
        )}
      </div>
      <h4 className="text-slate-500 text-sm font-medium">{title}</h4>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  );
}

function StatRow({ label, value, progress }: any) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
}
