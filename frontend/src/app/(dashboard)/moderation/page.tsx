'use client';

import { useState, useEffect } from 'react';
import { Shield, CheckCircle2, XCircle, AlertTriangle, RotateCcw, Clock, History } from 'lucide-react';
import { ModerationService } from '@/features/moderation/moderation.service';

export default function ModerationPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeHistory, setActiveHistory] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [history, setHistory] = useState<any[]>([]);
  const [reasonInput, setReasonInput] = useState('');
  const [pendingAction, setPendingAction] = useState<{ listingId: string; action: string } | null>(null);

  useEffect(() => {
    ModerationService.getQueue().then(setQueue).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleAction = async (listingId: string, action: string) => {
    if (action === 'REJECT' || action === 'FLAG') {
      setPendingAction({ listingId, action });
      return;
    }
    try {
      await ModerationService.applyAction(listingId, action);
      setQueue(queue.filter((l) => l.id !== listingId));
    } catch {
      alert('Erro na ação de moderação.');
    }
  };

  const confirmAction = async () => {
    if (!pendingAction) return;
    try {
      await ModerationService.applyAction(pendingAction.listingId, pendingAction.action, reasonInput || undefined);
      setQueue(queue.filter((l) => l.id !== pendingAction.listingId));
      setPendingAction(null);
      setReasonInput('');
    } catch {
      alert('Erro na ação de moderação.');
    }
  };

  const loadHistory = async (listingId: string) => {
    if (activeHistory === listingId) { setActiveHistory(null); return; }
    const h = await ModerationService.getHistory(listingId);
    setHistory(h);
    setActiveHistory(listingId);
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; classes: string }> = {
      PENDING_AI_REVIEW: { label: 'Em Análise IA', classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
      FLAGGED: { label: 'Sinalizado', classes: 'bg-red-500/10 text-red-400 border-red-500/20' },
    };
    const s = map[status] || { label: status, classes: 'bg-slate-500/10 text-slate-400' };
    return <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${s.classes}`}>{s.label}</span>;
  };

  if (loading) return <div className="p-8 text-slate-400 animate-pulse">Carregando fila de moderação...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100 flex items-center gap-2">
          <Shield size={24} className="text-amber-400" /> Moderação
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {queue.length} anúncio{queue.length !== 1 ? 's' : ''} aguardando revisão humana.
        </p>
      </div>

      {/* Reason Modal */}
      {pendingAction && (
        <div className="glass-panel rounded-xl p-6 border-l-4 border-l-red-500 animate-in slide-in-from-top-2 duration-200">
          <h3 className="font-semibold text-slate-200 mb-3">Motivo da {pendingAction.action === 'REJECT' ? 'Rejeição' : 'Sinalização'}</h3>
          <textarea
            value={reasonInput}
            onChange={(e) => setReasonInput(e.target.value)}
            placeholder="Descreva o motivo (obrigatório para auditoria)..."
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 outline-none focus:border-red-500/50 min-h-[80px] resize-y"
          />
          <div className="flex gap-3 mt-3">
            <button
              onClick={confirmAction}
              disabled={!reasonInput.trim()}
              className="bg-red-600 hover:bg-red-500 text-white rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50"
            >
              Confirmar
            </button>
            <button
              onClick={() => { setPendingAction(null); setReasonInput(''); }}
              className="text-sm text-slate-400 hover:text-slate-200 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {queue.length === 0 ? (
        <div className="glass-panel rounded-xl p-12 text-center">
          <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-4" />
          <h3 className="text-lg font-medium text-slate-300">Fila limpa</h3>
          <p className="text-slate-500 text-sm mt-2">Todos os anúncios foram revisados.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {queue.map((listing) => (
            <div key={listing.id} className="glass-panel rounded-xl overflow-hidden">
              <div className="p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {statusBadge(listing.status)}
                    <span className="text-xs text-slate-500">{listing.tenant?.name}</span>
                  </div>
                  <h3 className="font-semibold text-slate-200 text-lg">{listing.title}</h3>
                  <p className="text-sm text-slate-400 mt-1 line-clamp-2">{listing.description}</p>

                  {/* AI Insight */}
                  {listing.aiInsights?.[0] && (
                    <div className="mt-3 text-xs text-slate-500 flex items-center gap-2">
                      <AlertTriangle size={12} className="text-amber-400" />
                      Scam prob: {(Number(listing.aiInsights[0].scamProbability) * 100).toFixed(1)}%
                      {listing.aiInsights[0].flags?.length > 0 && (
                        <span className="text-red-400"> — Flags: {listing.aiInsights[0].flags.join(', ')}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleAction(listing.id, 'APPROVE')}
                    className="px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 text-sm font-medium transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={16} /> Aprovar
                  </button>
                  <button
                    onClick={() => handleAction(listing.id, 'REJECT')}
                    className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 text-sm font-medium transition flex items-center gap-1.5"
                  >
                    <XCircle size={16} /> Rejeitar
                  </button>
                  {listing.status === 'FLAGGED' && (
                    <button
                      onClick={() => handleAction(listing.id, 'OVERRIDE_AI')}
                      className="px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 text-sm font-medium transition flex items-center gap-1.5"
                      title="Aprovar apesar da sinalização da IA"
                    >
                      <RotateCcw size={16} /> Override
                    </button>
                  )}
                  <button
                    onClick={() => loadHistory(listing.id)}
                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-800 transition"
                    title="Histórico"
                  >
                    <History size={16} />
                  </button>
                </div>
              </div>

              {/* History panel */}
              {activeHistory === listing.id && history.length > 0 && (
                <div className="px-6 py-4 bg-slate-900/40 border-t border-slate-800">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Histórico de Moderação</p>
                  <div className="space-y-2">
                    {history.map((h) => (
                      <div key={h.id} className="flex items-center justify-between text-xs bg-slate-800/50 rounded-lg p-2.5">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${h.action === 'APPROVE' || h.action === 'OVERRIDE_AI' ? 'text-emerald-400' : h.action === 'REJECT' ? 'text-red-400' : 'text-amber-400'}`}>
                            {h.action}
                          </span>
                          <span className="text-slate-500">por {h.moderator?.fullName || 'Sistema'}</span>
                          {h.reason && <span className="text-slate-600 italic">— {h.reason}</span>}
                        </div>
                        <span className="text-slate-600">{new Date(h.createdAt).toLocaleString('pt-BR')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
