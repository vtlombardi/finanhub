'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api.client';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  Lock, Unlock, FileText, Download, Send,
  Clock, XCircle, Loader2, ShieldCheck,
} from 'lucide-react';

interface DataRoomDocument {
  id: string;
  name: string;
  url: string;
  mediaType: string;
  createdAt: string;
}

interface DataRoomRequest {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  message: string | null;
  createdAt: string;
}

type Phase = 'idle' | 'form' | 'loading' | 'pending' | 'approved' | 'rejected' | 'error';

const FILE_ICONS: Record<string, string> = {
  pdf: 'fa-file-pdf-o',
  doc: 'fa-file-word-o',
  docx: 'fa-file-word-o',
  xls: 'fa-file-excel-o',
  xlsx: 'fa-file-excel-o',
  default: 'fa-file-o',
};

function fileIcon(url: string) {
  const ext = url.split('.').pop()?.toLowerCase() ?? '';
  return FILE_ICONS[ext] ?? FILE_ICONS.default;
}

export function DataRoomSection({ listingId }: { listingId: string }) {
  const { isAuthenticated, user } = useAuth();
  const [phase, setPhase] = useState<Phase>('loading');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [documents, setDocuments] = useState<DataRoomDocument[]>([]);

  // Load existing request status on mount (if authenticated)
  useEffect(() => {
    if (!isAuthenticated) { setPhase('idle'); return; }

    api.get<DataRoomRequest | null>('/dataroom/request', { params: { listingId } })
      .then(({ data }) => {
        if (!data) { setPhase('idle'); return; }
        if (data.status === 'APPROVED') {
          setPhase('approved');
          loadDocuments();
        } else if (data.status === 'REJECTED') {
          setPhase('rejected');
        } else {
          setPhase('pending');
        }
      })
      .catch(() => setPhase('idle'));
  }, [isAuthenticated, listingId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadDocuments = () => {
    api.get<DataRoomDocument[]>(`/dataroom/${listingId}/documents`)
      .then(({ data }) => setDocuments(data))
      .catch(() => {});
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/dataroom/request', { listingId, message: message.trim() || undefined });
      setPhase('pending');
    } catch {
      setPhase('error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Unauthenticated ────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <section className="bg-slate-800/20 p-6 rounded-2xl border border-blue-500/10 flex items-start gap-4">
        <ShieldCheck className="text-blue-500 shrink-0 mt-1" size={24} />
        <div>
          <h3 className="font-semibold text-slate-200">Ambiente de Deal Protegido</h3>
          <p className="text-sm text-slate-400 mt-1">
            Faça login para solicitar acesso ao Data Room e visualizar documentos confidenciais
            como DREs, contratos e balanços patrimoniais.
          </p>
        </div>
      </section>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <section className="bg-slate-800/20 p-6 rounded-2xl border border-slate-700/30 flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
        <span className="text-sm text-slate-500">Verificando acesso ao Data Room...</span>
      </section>
    );
  }

  // ── Approved — show documents ──────────────────────────────────────────────
  if (phase === 'approved') {
    return (
      <section className="glass-panel p-6 rounded-2xl border-l-4 border-l-emerald-500 space-y-4">
        <h3 className="font-semibold text-slate-200 flex items-center gap-2">
          <Unlock size={18} className="text-emerald-400" /> Data Room — Acesso Liberado
        </h3>
        {documents.length === 0 ? (
          <p className="text-sm text-slate-500 italic">Nenhum documento disponível ainda. O vendedor adicionará em breve.</p>
        ) : (
          <div className="space-y-2">
            {documents.map(doc => (
              <a
                key={doc.id}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-4 bg-slate-800/40 border border-slate-700/50 rounded-xl px-4 py-3 hover:border-emerald-500/40 hover:bg-slate-800/60 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <i className={`fa ${fileIcon(doc.url)} text-emerald-400 text-lg`} />
                  <span className="text-sm text-slate-200 truncate">{doc.name}</span>
                </div>
                <Download className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors shrink-0" />
              </a>
            ))}
          </div>
        )}
      </section>
    );
  }

  // ── Pending ────────────────────────────────────────────────────────────────
  if (phase === 'pending') {
    return (
      <section className="bg-amber-500/5 p-6 rounded-2xl border border-amber-500/20 flex items-start gap-4">
        <Clock className="text-amber-400 shrink-0 mt-1" size={22} />
        <div>
          <h3 className="font-semibold text-amber-300">Solicitação Enviada</h3>
          <p className="text-sm text-slate-400 mt-1">
            Sua solicitação de acesso ao Data Room está aguardando aprovação do vendedor.
            Você será notificado quando houver uma resposta.
          </p>
        </div>
      </section>
    );
  }

  // ── Rejected ───────────────────────────────────────────────────────────────
  if (phase === 'rejected') {
    return (
      <section className="bg-red-500/5 p-6 rounded-2xl border border-red-500/20 flex items-start gap-4">
        <XCircle className="text-red-400 shrink-0 mt-1" size={22} />
        <div>
          <h3 className="font-semibold text-red-300">Acesso Não Autorizado</h3>
          <p className="text-sm text-slate-400 mt-1">
            O vendedor não aprovou sua solicitação de acesso ao Data Room desta operação.
          </p>
        </div>
      </section>
    );
  }

  // ── Form (idle / error) ────────────────────────────────────────────────────
  return (
    <section className="glass-panel p-6 rounded-2xl border-l-4 border-l-blue-500 space-y-4">
      <h3 className="font-semibold text-slate-200 flex items-center gap-2">
        <Lock size={18} className="text-blue-400" /> Solicitar Acesso ao Data Room
      </h3>
      <p className="text-sm text-slate-400">
        Os documentos confidenciais desta operação (DREs, contratos, balanço patrimonial) estão
        protegidos por NDA inicial. Solicite acesso e aguarde a aprovação do vendedor.
      </p>

      {phase === 'error' && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          Erro ao enviar solicitação. Tente novamente.
        </div>
      )}

      {phase === 'form' ? (
        <form onSubmit={handleRequest} className="space-y-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Mensagem de apresentação <span className="text-slate-600">(opcional)</span>
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Breve apresentação da sua empresa e interesse na operação..."
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-blue-500/50 min-h-[90px] resize-y"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
            >
              {submitting
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Send size={14} />
              }
              {submitting ? 'Enviando...' : 'Solicitar Acesso'}
            </button>
            <button
              type="button"
              onClick={() => setPhase('idle')}
              className="text-sm text-slate-500 hover:text-slate-300 transition px-3"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setPhase('form')}
          className="flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-500/50 px-4 py-2.5 rounded-xl transition-colors"
        >
          <FileText size={16} /> Solicitar Acesso aos Documentos
        </button>
      )}
    </section>
  );
}
