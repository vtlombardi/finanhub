'use client';

import { useEffect, useState } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useAuth } from '@/features/auth/AuthProvider';
import { api } from '@/services/api.client';
import {
  ShieldAlert, CheckCircle2, XCircle, Flag, Zap,
  ChevronDown, ChevronUp, History, Loader2, AlertTriangle, X, Shield, History as HistoryIcon,
} from 'lucide-react';
import styles from '@/styles/Dashboard.module.css';

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
  { label: 'Flagged IA', value: 'FLAGGED' },
  { label: 'Ativos', value: 'ACTIVE' },
  { label: 'Suspensos', value: 'SUSPENDED' },
];

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  PENDING_AI_REVIEW: { label: 'Aguardando IA', cls: styles.bOrange },
  FLAGGED:           { label: 'Flagged',       cls: styles.bRed },
  ACTIVE:            { label: 'Ativo',         cls: styles.bGreen },
  SUSPENDED:         { label: 'Suspenso',      cls: styles.bGhost },
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
    if (p >= 0.7) return '#ef4444';
    if (p >= 0.4) return '#fb923c';
    return '#10b981';
  };

  return (
    <>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Shield className="w-6 h-6 text-[#fb923c]" /> Terminal de Moderação
          </h1>
          <p>Revise anúncios sinalizados pela IA HAYIA ou aguardando aprovação ética.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
           <span style={{ fontSize: '11px', color: '#8fa6c3', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
             {total} Pendentes
           </span>
        </div>
      </div>

      {feedback && (
        <div className={styles.card} style={{ 
          marginBottom: '24px', 
          padding: '12px 20px', 
          border: feedback.type === 'success' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
          color: feedback.type === 'success' ? '#10b981' : '#ef4444',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {feedback.msg}
        </div>
      )}

      {/* Filters Bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {STATUS_FILTER_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => { setStatusFilter(opt.value); setPage(1); }}
            className={statusFilter === opt.value ? styles.btnBrand : styles.btnGhost}
            style={{ height: '36px', fontSize: '12px', padding: '0 16px' }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Queue items */}
      {loading ? (
        <div style={{ display: 'grid', placeItems: 'center', height: '40vh' }}>
          <Loader2 className="w-10 h-10 text-[#00b8b2] animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className={styles.card} style={{ textAlign: 'center', padding: '80px 20px', borderStyle: 'dashed' }}>
          <CheckCircle2 className="w-12 h-12 text-[#10b981] mx-auto mb-4 opacity-50" />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>Tudo limpo!</h3>
          <p style={{ color: '#8fa6c3', fontSize: '14px' }}>Não existem ativos na fila de espera para este filtro.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {items.map(item => {
            const insight = item.aiInsights?.[0];
            const isExpanded = expandedId === item.id;
            const isBusy = submitting?.startsWith(item.id);
            const cfg = STATUS_CONFIG[item.status] || { label: item.status, cls: '' };

            return (
              <div key={item.id} className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '24px' }}>
                  <div className="flex items-start justify-between gap-6 flex-wrap md:flex-nowrap">
                    
                    {/* Ativo Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <span className={`${styles.badge} ${cfg.cls}`} style={{ fontSize: '9px' }}>
                          {cfg.label}
                        </span>
                        {item.category && (
                          <span style={{ fontSize: '11px', color: '#8fa6c3', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {item.category.name}
                          </span>
                        )}
                        <span style={{ fontSize: '11px', color: '#64748b' }}>#{item.id.slice(0, 8)}</span>
                      </div>
                      <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#fff' }}>{item.title}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '8px 0' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Building className="w-3.5 h-3.5 text-[#8fa6c3]" />
                            <span style={{ fontSize: '12px', color: '#eef6ff', fontWeight: 600 }}>{item.tenant.name}</span>
                         </div>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock className="w-3.5 h-3.5 text-[#8fa6c3]" />
                            <span style={{ fontSize: '12px', color: '#8fa6c3' }}>{new Date(item.createdAt).toLocaleDateString()}</span>
                         </div>
                         {item.price !== null && (
                           <span style={{ fontSize: '12px', fontWeight: 800, color: '#00b8b2' }}>
                              R$ {Number(item.price).toLocaleString('pt-BR')}
                           </span>
                         )}
                      </div>
                      <p style={{ margin: 0, fontSize: '13px', color: '#8fa6c3', lineHeight: 1.6 }} className="line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    {/* AI Radar */}
                    {insight && (
                      <div className={styles.card} style={{ width: '180px', padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
                         <p style={{ margin: '0 0 12px', fontSize: '10px', fontWeight: 800, color: '#8fa6c3', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <Zap className="w-3 h-3 text-[#fb923c]" /> HAYIA Intelligence
                         </p>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                             <AlertTriangle className="w-5 h-5" style={{ color: scamColor(insight.scamProbability) }} />
                             <span style={{ fontSize: '18px', fontWeight: 900, color: scamColor(insight.scamProbability) }}>
                               {(insight.scamProbability * 100).toFixed(0)}%
                             </span>
                             <span style={{ fontSize: '10px', color: '#8fa6c3' }}>SCORE<br/>RISCO</span>
                         </div>
                         {insight.flags.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                               {insight.flags.map(f => (
                                 <span key={f} style={{ fontSize: '9px', fontWeight: 800, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '2px 6px', borderRadius: '4px' }}>
                                   {f}
                                 </span>
                               ))}
                            </div>
                         )}
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  {canModerate && (
                    <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                       <button
                          onClick={() => handleAction(item.id, 'APPROVE')}
                          disabled={!!isBusy}
                          className={styles.btnBrand}
                          style={{ height: '36px', fontSize: '12px', padding: '0 16px' }}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Aprovar
                        </button>
                        <button
                          onClick={() => handleAction(item.id, 'OVERRIDE_AI')}
                          disabled={!!isBusy}
                          className={styles.btnGhost}
                          style={{ height: '36px', fontSize: '12px', padding: '0 16px', color: '#00b8b2' }}
                        >
                          <Zap className="w-4 h-4 mr-2" /> Override IA
                        </button>
                        <button
                          onClick={() => handleAction(item.id, 'FLAG')}
                          disabled={!!isBusy}
                          className={styles.btnGhost}
                          style={{ height: '36px', fontSize: '12px', padding: '0 16px', color: '#fb923c' }}
                        >
                          <Flag className="w-4 h-4 mr-2" /> Flaggar
                        </button>
                        <button
                          onClick={() => handleAction(item.id, 'REJECT')}
                          disabled={!!isBusy}
                          className={styles.btnGhost}
                          style={{ height: '36px', fontSize: '12px', padding: '0 16px', color: '#ef4444' }}
                        >
                          <XCircle className="w-4 h-4 mr-2" /> Rejeitar
                        </button>

                        <div style={{ flex: 1 }} />

                        <button
                          onClick={() => openHistory(item.id)}
                          className={styles.btnGhost}
                          style={{ height: '32px', padding: '0 12px', fontSize: '11px', border: 'none' }}
                        >
                          <HistoryIcon className="w-3.5 h-3.5 mr-1" /> Histórico
                        </button>
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}
                          className={styles.btnGhost}
                          style={{ height: '32px', padding: '0 12px', fontSize: '11px', border: 'none' }}
                        >
                          {isExpanded ? 'Ocultar Motivo' : 'Adicionar Motivo'}
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
                        </button>
                    </div>
                  )}
                </div>

                {isExpanded && (
                  <div style={{ padding: '0 24px 24px' }}>
                     <input
                        type="text"
                        value={reasons[item.id] || ''}
                        onChange={e => setReasons(r => ({ ...r, [item.id]: e.target.value }))}
                        placeholder="Justificativa ética para auditoria..."
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)', color: '#fff', fontSize: '13px' }}
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
        <div style={{ display: 'flex', items: 'center', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className={styles.btnGhost}
            style={{ height: '36px', padding: '0 16px' }}
          >
            Anterior
          </button>
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#00b8b2', padding: '0 12px' }}>{page} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={styles.btnGhost}
            style={{ height: '36px', padding: '0 16px' }}
          >
            Próxima
          </button>
        </div>
      )}

      {/* History Modal */}
      {historyListingId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'grid', placeItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div className={styles.card} style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', maxHeight: '80vh', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <HistoryIcon className="w-5 h-5 text-[#00b8b2]" /> Auditoria de Moderação
               </h3>
               <button onClick={() => setHistoryListingId(null)} className={styles.btnGhost} style={{ width: '32px', height: '32px', padding: 0 }}>
                  <X className="w-4 h-4" />
               </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              {loadingHistory ? (
                <div style={{ display: 'grid', placeItems: 'center', padding: '40px' }}>
                   <Loader2 className="w-8 h-8 text-[#00b8b2] animate-spin" />
                </div>
              ) : history.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#8fa6c3', fontSize: '14px' }}>Nenhum registro encontrado para este ativo.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                   {history.map(h => (
                     <div key={h.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                           <span style={{ fontSize: '13px', fontWeight: 800, color: '#eef6ff' }}>{ACTION_LABELS[h.action] || h.action}</span>
                           <span style={{ fontSize: '11px', color: '#64748b' }}>{new Date(h.createdAt).toLocaleString()}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '11px', color: '#8fa6c3' }}>
                           Status: <span style={{ color: '#fff' }}>{h.previousStatus}</span> → <span style={{ color: '#00b8b2' }}>{h.newStatus}</span>
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#64748b' }}>Auditor: {h.moderator.fullName}</p>
                        {h.reason && (
                          <div style={{ marginTop: '12px', padding: '8px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: '3px solid #00b8b2', fontSize: '12px', color: '#8fa6c3', fontStyle: 'italic' }}>
                            &ldquo;{h.reason}&rdquo;
                          </div>
                        )}
                     </div>
                   ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
