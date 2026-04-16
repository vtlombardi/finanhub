'use client';

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { 
  Users, Building, FileText, Target, Wallet, TrendingUp, 
  Clock, ShieldAlert, CheckCircle2, XCircle, Loader2,
  ChevronRight, ArrowUpRight, ArrowDownRight, Activity, 
  PieChart as PieChartIcon, AlertTriangle
} from 'lucide-react';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { useAuth } from '@/features/auth/AuthProvider';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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
      const reason = prompt('Motivo da rejeição:');
      if (reason) await rejectListing(id, reason);
    }
    setActingId(null);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 text-[#00b8b2] animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Consolidando dados globais da plataforma...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-8 text-center max-w-lg mx-auto mt-20 bg-red-500/10 border border-red-500/20 rounded-3xl">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Acesso Restrito</h2>
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      </AdminLayout>
    );
  }

  const kpis = data?.kpis || {};
  const cardData = [
    { label: 'Usuários Totais', value: kpis.totalUsers, icon: <Users className="w-5 h-5 text-blue-400" />, trend: '+4%', isUp: true },
    { label: 'Empresas/Tenants', value: kpis.totalTenants, icon: <Building className="w-5 h-5 text-emerald-400" />, trend: '+2%', isUp: true },
    { label: 'Anúncios Totais', value: kpis.totalListings, icon: <FileText className="w-5 h-5 text-[#00b8b2]" />, trend: '+12%', isUp: true },
    { label: 'Leads Gerados', value: kpis.totalLeads, icon: <Target className="w-5 h-5 text-indigo-400" />, trend: '+8%', isUp: true },
    { label: 'Receita Est. (30d)', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(kpis.estimatedRevenue30d || 0), icon: <Wallet className="w-5 h-5 text-amber-400" />, trend: '+15%', isUp: true },
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#020617] text-slate-100 p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <ShieldAlert className="w-7 h-7 text-[#00b8b2]" /> Central do Administrador
            </h1>
            <p className="text-sm text-slate-500 mt-1">Visão global e controle operacional da Finanhub.</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/60 px-4 py-2 rounded-xl border border-slate-800">
            <Clock className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
            </span>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {cardData.map((kpi, idx) => (
            <div key={idx} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 hover:border-slate-700/50 transition-all group backdrop-blur-sm shadow-xl shadow-black/20">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-slate-800/50 rounded-xl group-hover:scale-110 transition-transform">
                  {kpi.icon}
                </div>
                <div className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-lg ${kpi.isUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                  {kpi.isUp ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                  {kpi.trend}
                </div>
              </div>
              <p className="text-3xl font-mono font-bold text-white mb-1">{kpi.value.toLocaleString()}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{kpi.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Moderation Queue */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500" /> Fila de Moderação
                    </h2>
                    <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                        {data.moderationQueue?.length || 0} pendentes
                    </span>
                </div>
                {data.moderationQueue?.length === 0 ? (
                    <div className="p-12 text-center">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3 opacity-20" />
                        <p className="text-slate-500 font-medium">Nenhum anúncio aguardando moderação.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-800">
                        {data.moderationQueue.slice(0, 5).map((item: any) => (
                            <div key={item.id} className="p-6 flex items-center justify-between hover:bg-slate-800/10 transition-colors">
                                <div className="flex-1 min-w-0 pr-4">
                                    <h3 className="text-sm font-bold text-white line-clamp-1">{item.title}</h3>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                                            <Building className="w-3 h-3 text-slate-700" /> {item.tenant.name}
                                        </span>
                                        <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                                            <Tag className="w-3 h-3 text-slate-700" /> {item.category.name}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {actingId === item.id ? (
                                        <Loader2 className="w-5 h-5 text-[#00b8b2] animate-spin" />
                                    ) : (
                                        <>
                                            <button 
                                                onClick={() => handleModeration(item.id, 'APPROVE')}
                                                className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-colors border border-emerald-500/10 hover:border-emerald-500/30"
                                                title="Aprovar"
                                            >
                                                <CheckCircle2 className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => handleModeration(item.id, 'REJECT')}
                                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors border border-red-500/10 hover:border-red-500/30"
                                                title="Rejeitar"
                                            >
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                            <Link href={`/dashboard/listings/${item.id}/edit`} className="p-2 text-slate-400 hover:bg-slate-800 rounded-xl transition-colors">
                                                <ChevronRight className="w-5 h-5" />
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {data.moderationQueue?.length > 5 && (
                    <Link href="/dashboard/moderation" className="block w-full text-center py-4 bg-slate-900/50 hover:bg-slate-900 text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-all">
                        Ver fila completa
                    </Link>
                )}
            </div>

            {/* Operational Summary - Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-sm">
                    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <PieChartIcon className="w-5 h-5 text-blue-400" /> Categorias Ativas
                    </h2>
                    <div className="h-64">
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
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-3 mt-4">
                        {data.operationalSummary.topCategories.map((cat: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                    <span className="text-xs text-slate-400">{cat.name}</span>
                                </div>
                                <span className="text-xs font-bold text-slate-200">{cat.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-sm flex flex-col justify-center text-center">
                    <TrendingUp className="w-12 h-12 text-[#00b8b2] mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-white mb-2">Desempenho Estável</h3>
                    <p className="text-sm text-slate-500">A plataforma apresenta um crescimento de 12% no volume de listings em relação ao mês anterior.</p>
                </div>
            </div>

          </div>

          {/* Activity Feed Column */}
          <div className="lg:col-span-4">
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm sticky top-6">
                <div className="p-6 border-b border-slate-800">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-500" /> Atividade Recente
                    </h2>
                </div>
                <div className="p-6 space-y-6">
                    {data.activityFeed?.map((log: any, idx: number) => (
                        <div key={log.id} className="relative pl-6 before:absolute before:left-0 before:top-1.5 before:w-1.5 before:h-1.5 before:bg-slate-700 before:rounded-full after:absolute after:left-[2px] after:top-6 after:bottom-[-20px] after:w-[2px] after:bg-slate-800 last:after:hidden">
                            <p className="text-xs font-bold text-slate-200">{log.title}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                                {new Date(log.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • 
                                <span className="ml-1 uppercase tracking-widest text-[8px] font-bold text-slate-600">{log.type}</span>
                            </p>
                            {log.metadata?.investor && (
                                <p className="text-[9px] text-indigo-400 mt-1 uppercase font-bold tracking-wider">Investidor: {log.metadata.investor}</p>
                            )}
                        </div>
                    ))}
                    {(!data.activityFeed || data.activityFeed.length === 0) && (
                        <div className="text-center py-10">
                            <p className="text-xs text-slate-600 italic">Nenhuma atividade registrada.</p>
                        </div>
                    )}
                </div>
                <div className="p-6 bg-slate-800/20">
                    <button className="w-full bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white py-2.5 rounded-xl transition-all">
                        Ver Logs Auditáveis
                    </button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
