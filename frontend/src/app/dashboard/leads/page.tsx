'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import {
  Inbox, ChevronDown, ChevronUp, Loader2, DollarSign,
  CheckCircle2, XCircle, Clock, TrendingUp, Zap, MessageSquare,
} from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';
import { Lead, Proposal } from '@shared/contracts';


// ─── Constants ───────────────────────────────────────────────────────────────

const INTENT_CONFIG: Record<string, { label: string; cls: string }> = {
  HIGH:   { label: 'Alto',   cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  MEDIUM: { label: 'Médio',  cls: 'bg-amber-500/15  text-amber-400  border-amber-500/30'  },
  LOW:    { label: 'Baixo',  cls: 'bg-slate-700      text-slate-400  border-slate-600'      },
};

const PROPOSAL_STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  OPEN:          { label: 'Aberta',          cls: 'bg-blue-500/15   text-blue-400   border-blue-500/30'   },
  ACCEPTED:      { label: 'Aceita',          cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  REJECTED:      { label: 'Rejeitada',       cls: 'bg-red-500/15    text-red-400    border-red-500/30'    },
  COUNTER_OFFER: { label: 'Contraproposta',  cls: 'bg-violet-500/15 text-violet-400 border-violet-500/30' },
  WITHDRAWN:     { label: 'Retirada',        cls: 'bg-slate-700     text-slate-400  border-slate-600'     },
};

const FILTER_OPTIONS = [
  { label: 'Todos',             value: 'all'       },
  { label: 'Com propostas',     value: 'proposals' },
  { label: 'Score alto',        value: 'high'      },
  { label: 'Aguardando IA',     value: 'pending_ai'},
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LeadsPage() {
  useAuthGuard();
  const { leads, loading, error, updateProposalStatus } = useLeads();

  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    if (error) setFeedback({ type: 'error', msg: error });
  }, [error]);

  const handleProposalAction = async (
    proposalId: string,
    status: 'ACCEPTED' | 'REJECTED',
  ) => {
    setSubmitting(proposalId);
    setFeedback(null);
    const result = await updateProposalStatus(proposalId, status);
    
    if (result.success) {
      setFeedback({
        type: 'success',
        msg: status === 'ACCEPTED' ? 'Proposta aceita! O investidor será notificado.' : 'Proposta rejeitada.',
      });
    } else {
      setFeedback({ type: 'error', msg: result.message || 'Erro ao atualizar proposta.' });
    }
    setSubmitting(null);
  };

  const filtered = leads.filter(l => {
    if (filter === 'proposals') return l.proposals.length > 0;
    if (filter === 'high')      return l.intentLevel === 'HIGH' || (l.score ?? 0) >= 70;
    if (filter === 'pending_ai') return !l.aiProcessedAt;
    return true;
  });

  // Summary stats
  const totalProposals = leads.reduce((acc, l) => acc + l.proposals.length, 0);
  const openProposals  = leads.reduce((acc, l) => acc + l.proposals.filter(p => p.status === 'OPEN').length, 0);
  const highIntent     = leads.filter(l => l.intentLevel === 'HIGH').length;

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#020617] text-slate-100 p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Inbox className="w-6 h-6 text-blue-500" /> Leads & Propostas
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manifestações de interesse de investidores nos seus anúncios.
            </p>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Leads recebidos', value: leads.length,   icon: <MessageSquare className="w-4 h-4 text-blue-400" />   },
            { label: 'Propostas abertas', value: openProposals, icon: <Clock className="w-4 h-4 text-amber-400" />          },
            { label: 'Alto interesse',   value: highIntent,    icon: <TrendingUp className="w-4 h-4 text-emerald-400" />   },
          ].map(s => (
            <div key={s.label} className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-3">
              {s.icon}
              <div>
                <p className="text-xl font-bold text-white leading-none">{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`mb-4 p-3 rounded-xl text-sm border ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {feedback.msg}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-5">
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                filter === opt.value
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
              }`}
            >
              {opt.label}
              {opt.value === 'proposals' && totalProposals > 0 && (
                <span className="ml-1.5 bg-blue-500/30 text-blue-300 rounded-full px-1.5 py-px text-[10px]">
                  {totalProposals}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Lead list */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
            <Inbox className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">
              {filter === 'all' ? 'Nenhum lead recebido ainda.' : 'Nenhum lead neste filtro.'}
            </p>
            {filter === 'all' && (
              <p className="text-sm text-slate-600 mt-1">
                Quando um investidor manifestar interesse, ele aparecerá aqui.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(lead => {
              const isExpanded = expandedId === lead.id;
              const intent = lead.intentLevel ? INTENT_CONFIG[lead.intentLevel] : null;
              const hasOpenProposals = lead.proposals.some(p => p.status === 'OPEN');
              const initials = lead.investor.fullName
                .split(' ')
                .slice(0, 2)
                .map(n => n[0])
                .join('')
                .toUpperCase();

              return (
                <div
                  key={lead.id}
                  className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden"
                >
                  {/* Lead header row */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : lead.id)}
                    className="w-full text-left p-5 hover:bg-slate-800/20 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 text-sm font-bold text-white">
                        {initials}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-0.5">
                          <span className="text-sm font-semibold text-white">
                            {lead.investor.fullName}
                          </span>
                          <span className="text-xs text-slate-500">{lead.investor.email}</span>

                          {intent && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${intent.cls}`}>
                              {intent.label} interesse
                            </span>
                          )}

                          {lead.score !== null && (
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                              score {lead.score}
                            </span>
                          )}

                          {hasOpenProposals && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-amber-500/15 text-amber-400 border-amber-500/30">
                              proposta aguardando
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400">
                          <span className="text-slate-600">em</span> {lead.listing.title}
                        </p>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-1 italic">
                          &ldquo;{lead.message}&rdquo;
                        </p>
                      </div>

                      {/* Meta */}
                      <div className="shrink-0 flex flex-col items-end gap-1.5">
                        <span className="text-[10px] text-slate-600">
                          {new Date(lead.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit', month: 'short',
                          })}
                        </span>
                        {lead.proposals.length > 0 && (
                          <span className="text-[10px] text-slate-500">
                            {lead.proposals.length} proposta{lead.proposals.length !== 1 ? 's' : ''}
                          </span>
                        )}
                        {isExpanded
                          ? <ChevronUp className="w-4 h-4 text-slate-600 mt-1" />
                          : <ChevronDown className="w-4 h-4 text-slate-600 mt-1" />
                        }
                      </div>
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="border-t border-slate-800 divide-y divide-slate-800/60">

                      {/* Full message */}
                      <div className="px-5 py-4">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                          Mensagem do investidor
                        </p>
                        <p className="text-sm text-slate-300 leading-relaxed">{lead.message}</p>
                      </div>

                      {/* AI Insights */}
                      {lead.aiProcessedAt ? (
                        <div className="px-5 py-4 bg-slate-950/30">
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-blue-400" /> Análise da IA
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {lead.aiClassification && (
                              <div className="bg-slate-800/50 rounded-xl p-3">
                                <p className="text-[10px] text-slate-500 mb-1">Classificação</p>
                                <p className="text-xs font-semibold text-slate-200">{lead.aiClassification}</p>
                              </div>
                            )}
                            {lead.aiReasonSummary && (
                              <div className="bg-slate-800/50 rounded-xl p-3 sm:col-span-2">
                                <p className="text-[10px] text-slate-500 mb-1">Resumo</p>
                                <p className="text-xs text-slate-300 leading-relaxed">{lead.aiReasonSummary}</p>
                              </div>
                            )}
                            {lead.aiRecommendedAction && (
                              <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-3 sm:col-span-3">
                                <p className="text-[10px] text-blue-400 mb-1">Ação recomendada pela IA</p>
                                <p className="text-xs text-slate-300">{lead.aiRecommendedAction}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="px-5 py-3 bg-slate-950/30 flex items-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 text-slate-600 animate-spin" />
                          <p className="text-xs text-slate-600">Análise de IA em processamento...</p>
                        </div>
                      )}

                      {/* Proposals */}
                      <div className="px-5 py-4">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
                          Propostas ({lead.proposals.length})
                        </p>

                        {lead.proposals.length === 0 ? (
                          <p className="text-xs text-slate-600 italic">
                            Nenhuma proposta formal enviada ainda.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {lead.proposals.map(p => {
                              const cfg = PROPOSAL_STATUS_CONFIG[p.status];
                              const isOpen = p.status === 'OPEN';
                              const isBusy = submitting === p.id;

                              return (
                                <div
                                  key={p.id}
                                  className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex items-start justify-between gap-4 flex-wrap"
                                >
                                  <div className="space-y-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-base font-bold font-mono text-white">
                                        {new Intl.NumberFormat('pt-BR', {
                                          style: 'currency',
                                          currency: 'BRL',
                                          maximumFractionDigits: 0,
                                        }).format(Number(p.valueOffered))}
                                      </span>
                                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.cls}`}>
                                        {cfg.label}
                                      </span>
                                    </div>
                                    {p.conditions && (
                                      <p className="text-xs text-slate-400">
                                        <span className="text-slate-600">Condições: </span>{p.conditions}
                                      </p>
                                    )}
                                    <p className="text-[10px] text-slate-600">
                                      Enviada em {new Date(p.createdAt).toLocaleDateString('pt-BR', {
                                        day: '2-digit', month: 'short', year: 'numeric',
                                      })}
                                    </p>
                                  </div>

                                  {isOpen && (
                                    <div className="flex gap-2 shrink-0">
                                      <button
                                        onClick={() => handleProposalAction(p.id, 'ACCEPTED')}
                                        disabled={!!isBusy}
                                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 transition disabled:opacity-50"
                                      >
                                        {isBusy
                                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                          : <CheckCircle2 className="w-3.5 h-3.5" />
                                        }
                                        Aceitar
                                      </button>
                                      <button
                                        onClick={() => handleProposalAction(p.id, 'REJECTED')}
                                        disabled={!!isBusy}
                                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30 transition disabled:opacity-50"
                                      >
                                        {isBusy
                                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                          : <XCircle className="w-3.5 h-3.5" />
                                        }
                                        Rejeitar
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
