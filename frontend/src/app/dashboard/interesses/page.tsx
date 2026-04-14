'use client';

import { useMyInterests } from '@/hooks/useMyInterests';
import AdminLayout from '@/components/admin/AdminLayout';
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
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

// ─── Status Configuration ────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: any }> = {
  NEW: { 
    label: 'Recebido', 
    cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    icon: Inbox
  },
  UNDER_REVIEW: { 
    label: 'Em análise', 
    cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    icon: Search
  },
  QUALIFIED: { 
    label: 'Qualificado', 
    cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    icon: Sparkles
  },
  CONTACTED: { 
    label: 'Em contato', 
    cls: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    icon: Send
  },
  PROPOSAL_SENT: { 
    label: 'Proposta enviada', 
    cls: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    icon: DollarSign
  },
  WON: { 
    label: 'Finalizado (Sucesso)', 
    cls: 'bg-emerald-600/20 text-emerald-500 border-emerald-600/30',
    icon: CheckCircle2
  },
  LOST: { 
    label: 'Encerrado', 
    cls: 'bg-slate-700/50 text-slate-400 border-slate-600/50',
    icon: Clock
  },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function MyInterestsPage() {
  useAuthGuard();
  const { interests, loading, error } = useMyInterests();

  // Summary stats calculations
  const total = interests.length;
  const analysis = interests.filter(i => i.status === 'UNDER_REVIEW').length;
  const qualified = interests.filter(i => i.status === 'QUALIFIED' || i.status === 'PROPOSAL_SENT').length;

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#020617] text-slate-100 p-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Send className="w-8 h-8 text-blue-500" /> Meus Interesses
            </h1>
            <p className="text-slate-400 mt-2 max-w-2xl">
              Acompanhe o status e a evolução das oportunidades em que você manifestou interesse estratégico.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Link 
              href="/oportunidades"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20"
            >
              Buscar Oportunidades
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Interesses Enviados', value: total, icon: Send, color: 'text-blue-400' },
            { label: 'Em Análise', value: analysis, icon: Search, color: 'text-amber-400' },
            { label: 'Avançados / Qualificados', value: qualified, icon: Sparkles, color: 'text-emerald-400' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 hover:border-slate-700 transition-colors">
              <div className={`p-3 rounded-xl bg-slate-800/50 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Content area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-slate-500 animate-pulse">Carregando seus interesses...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-red-400 max-w-2xl mx-auto flex items-center gap-4">
            <Inbox className="w-6 h-6" />
            <p>{error}</p>
          </div>
        ) : interests.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-16 text-center max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Inbox className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Você ainda não tem interesses</h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
              Explore o marketplace para encontrar negócios e investimentos que combinam com seu perfil.
            </p>
            <Link 
              href="/oportunidades"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all border border-slate-700"
            >
              Explorar Oportunidades
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {interests.map((interest) => {
              const config = STATUS_CONFIG[interest.status] || STATUS_CONFIG.NEW;
              const StatusIcon = config.icon;

              return (
                <div 
                  key={interest.id}
                  className="group bg-slate-900/40 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden flex flex-col highlight-on-hover"
                >
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                          {interest.listing.category?.name || 'Oportunidade'}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                        <span className="text-[10px] text-slate-500">
                           Ref: #{interest.id.split('-')[0].toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                        {interest.listing.title}
                      </h3>
                    </div>

                    <div className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${config.cls}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {config.label}
                    </div>
                  </div>

                  {/* Summary grid */}
                  <div className="grid grid-cols-2 gap-y-3 gap-x-6 mb-6">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-slate-800/40">
                        <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Investimento</p>
                        <p className="text-xs text-slate-200 font-medium">{interest.investmentRange || 'Não informado'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-slate-800/40">
                        <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Objetivo</p>
                        <p className="text-xs text-slate-200 font-medium">{interest.objective || 'Interesse GERAL'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-slate-800/40">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Enviado em</p>
                        <p className="text-xs text-slate-200 font-medium">
                          {new Date(interest.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit', month: 'long', year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-slate-800/40">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Localização</p>
                        <p className="text-xs text-slate-200 font-medium">
                          {interest.listing.city || 'Nacional'}, {interest.listing.state || 'BR'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="mt-auto pt-4 border-t border-slate-800/50 flex items-center justify-between">
                    <p className="text-[11px] text-slate-600 italic">
                      Intermediação garantida pela plataforma Finanhub.
                    </p>
                    <Link 
                      href={`/oportunidades/${interest.listing.id}`}
                      className="inline-flex items-center gap-2 text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors"
                    >
                      Ver Oportunidade
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .glass-panel {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .highlight-on-hover:hover {
          box-shadow: 0 0 20px 0 rgba(37, 99, 235, 0.05);
          transform: translateY(-2px);
        }
      `}</style>
    </AdminLayout>
  );
}
