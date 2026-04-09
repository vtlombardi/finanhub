'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useAuth } from '@/features/auth/AuthProvider';
import { api } from '@/services/api.client';
import {
  ShieldAlert, CheckCircle2, XCircle, Flag, Zap,
  ChevronDown, ChevronUp, History, Loader2, AlertTriangle,
} from 'lucide-react';

interface AiInsight {
  scamProbability: number;
  recommendedTitle: string | null;
  flags: string[];
}

interface QueueItem {
  id: string;
  title: string;
  description: string;
  price: number | null;
  status: string;
  createdAt: string;
  tenant: { name: string };
  category: { name: string } | null;
  aiInsights: AiInsight[];
}

interface ModerationHistoryEntry {
  id: string;
  action: string;
  reason: string | null;
  previousStatus: string;
  newStatus: string;
  createdAt: string;
  moderator: { fullName: string; email: string };
}

const STATUS_FILTER_OPTIONS = [
  { label: 'Pendentes + Flagged', value: 'PENDING_AI_REVIEW,FLAGGED' },
  { label: 'Aguardando IA', value: 'PENDING_AI_REVIEW' },
  { label: 'Flagged pela IA', value: 'FLAGGED' },
  { label: 'Ativos', value: 'ACTIVE' },
  { label: 'Suspensos', value: 'SUSPENDED' },
];

const STATUS_BADGES: Record<string, string> = {
  PENDING_AI_REVIEW: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  FLAGGED: 'bg-red-500/15 text-red-400 border-red-500/30',
  ACTIVE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  SUSPENDED: 'bg-slate-700 text-slate-400 border-slate-600',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING_AI_REVIEW: 'Aguardando IA',
  FLAGGED: 'Flagged',
  ACTIVE: 'Ativo',
  SUSPENDED: 'Suspenso',
};

const ACTION_LABELS: Record<string, string> = {
  APPROVE: 'Aprovado',
  REJECT: 'Rejeitado',
  FLAG: 'Flagado',
  OVERRIDE_AI: 'Override IA',
};

export default function ModerationPage() {
  useAuthGuard();
  const { user } = useAuth();

  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING_AI_REVIEW,FLAGGED');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const [historyListingId, setHistoryListingId] = useState<string | null>(null);
  const [history, setHistory] = useState<ModerationHistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const canModerate = user?.role === 'OWNER' || user?.role === 'ADMIN';

  const loadQueue = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/moderation/queue', {
        params: { status: statusFilter, page, limit: 15 },
      });
      setItems(data.data);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch {
      setFeedback({ type: 'error', msg: 'Erro ao carregar fila de moderação.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadQueue(); }, [statusFilter, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAction = async (
    listingId: string,
    action: 'APPROVE' | 'REJECT' | 'FLAG' | 'OVERRIDE_AI',
  ) => {
    setSubmitting(listingId + action);
    setFeedback(null);
    try {
      await api.post(`/moderation/${listingId}/action`, {
        action,
        reason: reasons[listingId] || undefined,
      });
      setFeedback({ type: 'success', msg: `Ação "${ACTION_LABELS[action]}" aplicada com sucesso.` });
      setReasons(r => { const c = { ...r }; delete c[listingId]; return c; });
      setExpandedId(null);
      loadQueue();
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err?.response?.data?.message || 'Erro ao aplicar ação.' });
    } finally {
      setSubmitting(null);
    }
  };

  const openHistory = async (listingId: string) => {
    setHistoryListingId(listingId);
    setLoadingHistory(true);
    try {
      const { data } = await api.get(`/moderation/${listingId}/history`);
      setHistory(data);
    } catch {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const scamColor = (p: number) => {
    if (p >= 0.7) return 'text-red-400';
    if (p >= 0.4) return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#020617] text-slate-100 p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-amber-500" /> Moderação
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Revise anúncios sinalizados pela IA ou aguardando aprovação manual.
            </p>
          </div>
          <span className="text-xs text-slate-500 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
            {total} item{total !== 1 ? 's' : ''} na fila
          </span>
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

        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {STATUS_FILTER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { setStatusFilter(opt.value); setPage(1); }}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                statusFilter === opt.value
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Queue */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">Fila vazia — nenhum item para revisar.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => {
              const insight = item.aiInsights?.[0];
              const isExpanded = expandedId === item.id;
              const isBusy = submitting?.startsWith(item.id);

              return (
                <div key={item.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      {/* Listing info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-1.5">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_BADGES[item.status] || 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                            {STATUS_LABELS[item.status] || item.status}
                          </span>
                          {item.category && (
                            <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                              {item.category.name}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-600">Seller: {item.tenant.name}</span>
                          <span className="text-[10px] text-slate-700">
                            {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-white leading-snug">{item.title}</h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                        {item.price !== null && (
                          <p className="text-xs font-mono text-slate-400 mt-1">
                            R$ {Number(item.price).toLocaleString('pt-BR')}
                          </p>
                        )}
                      </div>

                      {/* AI Insight card */}
                      {insight && (
                        <div className="shrink-0 bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 min-w-[148px] space-y-1.5">
                          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">AI Insight</p>
                          <div className="flex items-center gap-1.5">
                            <AlertTriangle className={`w-3.5 h-3.5 ${scamColor(insight.scamProbability)}`} />
                            <span className={`text-xs font-mono font-bold ${scamColor(insight.scamProbability)}`}>
                              {(insight.scamProbability * 100).toFixed(0)}% risco
                            </span>
                          </div>
                          {insight.flags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {insight.flags.map(f => (
                                <span key={f} className="text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 rounded px-1.5 py-0.5">
                                  {f}
                                </span>
                              ))}
                            </div>
                          )}
                          {insight.recommendedTitle && (
                            <p className="text-[10px] text-slate-400 italic leading-tight">
                              &ldquo;{insight.recommendedTitle}&rdquo;
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    {canModerate && (
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleAction(item.id, 'APPROVE')}
                          disabled={!!isBusy}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 transition disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Aprovar
                        </button>
                        <button
                          onClick={() => handleAction(item.id, 'OVERRIDE_AI')}
                          disabled={!!isBusy}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 transition disabled:opacity-50"
                        >
                          <Zap className="w-3.5 h-3.5" /> Override IA
                        </button>
                        <button
                          onClick={() => handleAction(item.id, 'FLAG')}
                          disabled={!!isBusy}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-600/20 border border-amber-500/30 text-amber-400 hover:bg-amber-600/30 transition disabled:opacity-50"
                        >
                          <Flag className="w-3.5 h-3.5" /> Flaggar
                        </button>
                        <button
                          onClick={() => handleAction(item.id, 'REJECT')}
                          disabled={!!isBusy}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30 transition disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Rejeitar
                        </button>

                        <div className="flex-1" />

                        <button
                          onClick={() => openHistory(item.id)}
                          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition"
                        >
                          <History className="w-3.5 h-3.5" /> Histórico
                        </button>
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}
                          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition"
                        >
                          Motivo {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Expandable reason input */}
                  {isExpanded && (
                    <div className="border-t border-slate-800 px-5 py-4 bg-slate-950/40">
                      <label className="block text-xs text-slate-400 mb-2">
                        Motivo da ação (incluído no histórico e notificação ao seller)
                      </label>
                      <input
                        type="text"
                        value={reasons[item.id] || ''}
                        onChange={e => setReasons(r => ({ ...r, [item.id]: e.target.value }))}
                        placeholder="Ex: Preço irrealista para o segmento..."
                        className="input-premium w-full text-sm"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-xs text-slate-400 hover:text-slate-200 disabled:opacity-40 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 transition"
            >
              Anterior
            </button>
            <span className="text-xs text-slate-500">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="text-xs text-slate-400 hover:text-slate-200 disabled:opacity-40 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 transition"
            >
              Próxima
            </button>
          </div>
        )}

        {/* History modal */}
        {historyListingId && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-400" /> Histórico de Moderação
                </h3>
                <button
                  onClick={() => setHistoryListingId(null)}
                  className="text-slate-500 hover:text-slate-200 transition text-sm"
                >
                  Fechar
                </button>
              </div>

              {loadingHistory ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                </div>
              ) : history.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">Nenhuma ação registrada.</p>
              ) : (
                <div className="overflow-y-auto space-y-3 pr-1">
                  {history.map(h => (
                    <div key={h.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-300">
                          {ACTION_LABELS[h.action] || h.action}
                        </span>
                        <span className="text-[10px] text-slate-600">
                          {new Date(h.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        {h.previousStatus} → {h.newStatus} · por {h.moderator.fullName}
                      </p>
                      {h.reason && (
                        <p className="text-xs text-slate-400 mt-1 italic">&ldquo;{h.reason}&rdquo;</p>
                      )}
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
