'use client';

import { useState, useEffect } from 'react';
import { Users, DollarSign, CheckCircle2, XCircle, Clock, Brain, Sparkles, AlertTriangle, Zap } from 'lucide-react';
import { LeadsService } from '@/features/leads/leads.service';

export default function LeadsDashboardPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await LeadsService.getTenantLeads();
        setLeads(data);
      } catch {
        setLeads([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleUpdateStatus = async (proposalId: string, status: string) => {
    try {
      await LeadsService.updateProposalStatus(proposalId, status);
      const data = await LeadsService.getTenantLeads();
      setLeads(data);
    } catch {
      alert('Erro ao atualizar status da proposta.');
    }
  };

  const ProposalStatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, { label: string; classes: string }> = {
      OPEN: { label: 'Aberta', classes: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
      ACCEPTED: { label: 'Aceita', classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
      REJECTED: { label: 'Rejeitada', classes: 'bg-red-500/10 text-red-400 border-red-500/20' },
      COUNTER_OFFER: { label: 'Contra-oferta', classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    };
    const s = map[status] || { label: status, classes: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
    return <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${s.classes}`}>{s.label}</span>;
  };

  // Score visual ring
  const ScoreRing = ({ score }: { score: number | null }) => {
    if (score === null || score === undefined) {
      return (
        <div className="h-14 w-14 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center flex-shrink-0" title="Aguardando IA">
          <Brain size={18} className="text-slate-600 animate-pulse" />
        </div>
      );
    }
    const color = score >= 70 ? 'emerald' : score >= 40 ? 'amber' : 'red';
    const colorMap: Record<string, string> = {
      emerald: 'border-emerald-400 text-emerald-400',
      amber: 'border-amber-400 text-amber-400',
      red: 'border-red-400 text-red-400',
    };
    return (
      <div className={`h-14 w-14 rounded-full border-2 ${colorMap[color]} flex items-center justify-center flex-shrink-0`} title={`Score IA: ${score}`}>
        <span className="text-sm font-bold">{score}</span>
      </div>
    );
  };

  // AI classification badge
  const AiClassBadge = ({ classification }: { classification: string | null }) => {
    if (!classification) return null;
    const map: Record<string, { label: string; icon: any; classes: string }> = {
      QUALIFIED: { label: 'Qualificado', icon: Sparkles, classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
      WARM: { label: 'Parcial', icon: Zap, classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
      UNQUALIFIED: { label: 'Não Qualificado', icon: AlertTriangle, classes: 'bg-red-500/10 text-red-400 border-red-500/20' },
    };
    const c = map[classification] || { label: classification, icon: Brain, classes: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
    const Icon = c.icon;
    return (
      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border inline-flex items-center gap-1 ${c.classes}`}>
        <Icon size={12} /> {c.label}
      </span>
    );
  };

  if (loading) {
    return <div className="p-8 text-slate-400 animate-pulse">Carregando oportunidades...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100 flex items-center gap-2">
          <Users size={24} className="text-blue-400" /> Leads & Propostas
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Leads ordenados por score de qualificação IA. A decisão final é sempre sua.
        </p>
      </div>

      {leads.length === 0 ? (
        <div className="glass-panel rounded-xl p-12 text-center">
          <Users size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-300">Nenhum lead captado</h3>
          <p className="text-slate-500 text-sm mt-2">Publique anúncios para começar a receber manifestações de interesse.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <div key={lead.id} className="glass-panel rounded-xl overflow-hidden">
              {/* Lead Header with AI Score */}
              <div className="p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800">
                <div className="flex gap-4">
                  {/* Score Ring */}
                  <ScoreRing score={lead.score} />

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <p className="font-medium text-slate-200">{lead.investor?.fullName || 'Investidor'}</p>
                      <AiClassBadge classification={lead.aiClassification} />
                    </div>
                    <p className="text-xs text-slate-500">{lead.investor?.email}</p>
                    <p className="text-sm text-slate-400 mt-2 italic">&quot;{lead.message}&quot;</p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-slate-500 mb-1">Interessado em</p>
                  <p className="text-sm font-medium text-blue-400">{lead.listing?.title || 'Anúncio'}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {/* AI Insight Bar */}
              {(lead.aiReasonSummary || lead.aiRecommendedAction) && (
                <div className="px-6 py-3 bg-gradient-to-r from-indigo-500/5 to-blue-500/5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-2 text-xs text-indigo-300 flex-shrink-0">
                    <Brain size={14} className="text-indigo-400" />
                    <span className="font-semibold uppercase tracking-wider">Análise IA</span>
                  </div>
                  <div className="flex-1 text-sm text-slate-400">{lead.aiReasonSummary}</div>
                  {lead.aiRecommendedAction && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-indigo-300 text-xs font-medium whitespace-nowrap flex-shrink-0">
                      <Sparkles size={12} /> {lead.aiRecommendedAction}
                    </div>
                  )}
                </div>
              )}

              {/* AI Error */}
              {lead.aiError && (
                <div className="px-6 py-3 bg-red-500/5 border-b border-slate-800 flex items-center gap-2 text-xs text-red-400">
                  <AlertTriangle size={14} />
                  <span>Falha na qualificação automática: {lead.aiError}</span>
                </div>
              )}

              {/* AI Pending */}
              {!lead.aiProcessedAt && !lead.aiError && (
                <div className="px-6 py-3 bg-slate-800/20 border-b border-slate-800 flex items-center gap-2 text-xs text-slate-500">
                  <Brain size={14} className="animate-pulse" />
                  <span>Qualificação IA em processamento...</span>
                </div>
              )}

              {/* Propostas do Lead */}
              {lead.proposals && lead.proposals.length > 0 && (
                <div className="px-6 py-4 bg-slate-900/30">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
                    Propostas ({lead.proposals.length})
                  </p>
                  <div className="space-y-3">
                    {lead.proposals.map((prop: any) => (
                      <div key={prop.id} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-emerald-400">
                            <DollarSign size={16} />
                            <span className="font-mono font-semibold">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(Number(prop.valueOffered))}
                            </span>
                          </div>
                          <ProposalStatusBadge status={prop.status} />
                        </div>
                        {prop.status === 'OPEN' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateStatus(prop.id, 'ACCEPTED')}
                              className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition"
                              title="Aceitar"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(prop.id, 'REJECTED')}
                              className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                              title="Rejeitar"
                            >
                              <XCircle size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sem proposta ainda */}
              {(!lead.proposals || lead.proposals.length === 0) && (
                <div className="px-6 py-4 bg-slate-900/20">
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Clock size={12} /> Aguardando proposta formal do investidor.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
