'use client';

import { useEffect, useState, useCallback } from 'react';
import { PlanGate } from '@/components/plans/PlanGate';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { api } from '@/services/api.client';
import {
  Lock, CheckCircle2, XCircle, Clock, FileText,
  Plus, Trash2, Loader2, ChevronDown, ChevronUp, Upload,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DataRoomRequest {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  message: string | null;
  createdAt: string;
  investor: { id: string; fullName: string; email: string };
  listing: { id: string; title: string; slug: string };
}

interface DataRoomDocument {
  id: string;
  name: string;
  url: string;
  mediaType: string;
  createdAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  PENDING:  { label: 'Aguardando',  cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30',   icon: Clock },
  APPROVED: { label: 'Aprovado',    cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
  REJECTED: { label: 'Rejeitado',   cls: 'bg-red-500/15 text-red-400 border-red-500/30',          icon: XCircle },
};

const FILTER_OPTIONS = [
  { label: 'Todos',        value: 'all'      },
  { label: 'Aguardando',   value: 'PENDING'  },
  { label: 'Aprovados',    value: 'APPROVED' },
  { label: 'Rejeitados',   value: 'REJECTED' },
];

// ─── DocumentsPanel (per-listing) ─────────────────────────────────────────────

function DocumentsPanel({ listingId }: { listingId: string }) {
  const [docs, setDocs] = useState<DataRoomDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [docName, setDocName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');

  const loadDocs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<DataRoomDocument[]>(`/dataroom/seller/${listingId}/documents`);
      setDocs(data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [listingId]);

  useEffect(() => { loadDocs(); }, [loadDocs]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!docName.trim()) { setError('Informe um nome para o documento antes de fazer upload.'); return; }
    setUploading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const { data: uploaded } = await api.post<{ url: string }>('/listings/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await api.post(`/dataroom/seller/${listingId}/documents`, {
        name: docName.trim(),
        url: uploaded.url,
        mediaType: file.type || 'document',
      });
      setDocName('');
      setShowAddForm(false);
      loadDocs();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao adicionar documento.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (doc: DataRoomDocument) => {
    if (!confirm(`Remover "${doc.name}" do Data Room?`)) return;
    try {
      await api.delete(`/dataroom/documents/${doc.id}`);
      loadDocs();
    } catch { /* silent */ }
  };

  return (
    <div className="border-t border-slate-800 bg-slate-950/40 px-5 py-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" /> Documentos no Data Room
        </span>
        <button
          onClick={() => { setShowAddForm(s => !s); setError(''); }}
          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Adicionar
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
      )}

      {showAddForm && (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 space-y-2">
          <input
            type="text"
            value={docName}
            onChange={e => setDocName(e.target.value)}
            className="input-premium w-full text-sm"
            placeholder="Nome do documento (ex: DRE 2024)"
          />
          <label className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer transition-colors ${
            uploading
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30'
          }`}>
            {uploading
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Upload className="w-3.5 h-3.5" />
            }
            {uploading ? 'Enviando...' : 'Selecionar arquivo'}
            <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-3">
          <Loader2 className="w-4 h-4 text-slate-600 animate-spin" />
        </div>
      ) : docs.length === 0 ? (
        <p className="text-xs text-slate-700 italic">Nenhum documento adicionado ainda.</p>
      ) : (
        <div className="space-y-1.5">
          {docs.map(doc => (
            <div key={doc.id} className="flex items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-300 hover:text-blue-400 truncate transition-colors"
                >
                  {doc.name}
                </a>
              </div>
              <button
                onClick={() => handleDelete(doc)}
                className="p-1 text-slate-600 hover:text-red-400 hover:bg-slate-800 rounded transition-colors shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DataRoomPage() {
  useAuthGuard();

  const [requests, setRequests] = useState<DataRoomRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedListingId, setExpandedListingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<DataRoomRequest[]>('/dataroom/requests');
      setRequests(data);
    } catch {
      setFeedback({ type: 'error', msg: 'Erro ao carregar solicitações.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDecision = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    setSubmitting(requestId + status);
    setFeedback(null);
    try {
      await api.patch(`/dataroom/requests/${requestId}`, { status });
      setFeedback({
        type: 'success',
        msg: status === 'APPROVED' ? 'Acesso aprovado. O investidor foi notificado.' : 'Solicitação rejeitada.',
      });
      load();
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err?.response?.data?.message || 'Erro ao processar.' });
    } finally {
      setSubmitting(null);
    }
  };

  const filtered = requests.filter(r => filter === 'all' || r.status === filter);
  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  // Group by listing for the documents panel (unique listing IDs in filtered)
  const uniqueListingIds = [...new Set(requests.map(r => r.listing.id))];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#020617] text-slate-100 p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Lock className="w-6 h-6 text-blue-500" /> Data Room
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Gerencie documentos confidenciais e solicitações de acesso dos investidores.
            </p>
          </div>
          {pendingCount > 0 && (
            <span className="text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-full">
              {pendingCount} aguardando aprovação
            </span>
          )}
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

        {/* Documents management — per listing */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-slate-400 mb-3">Documentos por Anúncio</h2>
          {uniqueListingIds.length === 0 && !loading ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center">
              <FileText className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Nenhum anúncio com solicitações ainda.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {uniqueListingIds.map(lid => {
                const req = requests.find(r => r.listing.id === lid)!;
                const isOpen = expandedListingId === lid;
                return (
                  <div key={lid} className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setExpandedListingId(isOpen ? null : lid)}
                      className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-800/20 transition-colors text-left"
                    >
                      <span className="text-sm font-medium text-white">{req.listing.title}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                    </button>
                    {isOpen && (
                      <PlanGate
                        minTier="PROFESSIONAL"
                        variant="blur"
                        title="Virtual Data Room Premium"
                        description="O gerenciamento de documentos confidenciais exige o plano Professional ou Elite para garantir a segurança e conformidade do deal."
                      >
                        <DocumentsPanel listingId={lid} />
                      </PlanGate>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Access requests */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-400">Solicitações de Acesso</h2>
            <div className="flex gap-2">
              {FILTER_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    filter === opt.value
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center">
              <Lock className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">Nenhuma solicitação {filter !== 'all' ? 'neste filtro' : 'recebida'}.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(req => {
                const cfg = STATUS_CONFIG[req.status];
                const StatusIcon = cfg.icon;
                const isBusy = (id: string) => submitting === req.id + id;

                return (
                  <div key={req.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 text-xs font-bold text-white">
                        {req.investor.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="text-sm font-semibold text-white">{req.investor.fullName}</span>
                          <span className="text-xs text-slate-500">{req.investor.email}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${cfg.cls}`}>
                            <StatusIcon className="w-3 h-3" /> {cfg.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          <span className="text-slate-600">Deal:</span> {req.listing.title}
                        </p>
                        {req.message && (
                          <p className="text-xs text-slate-400 mt-1 italic">&ldquo;{req.message}&rdquo;</p>
                        )}
                        <p className="text-[10px] text-slate-700 mt-1">
                          {new Date(req.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    {req.status === 'PENDING' && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleDecision(req.id, 'APPROVED')}
                          disabled={!!submitting}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 transition disabled:opacity-50"
                        >
                          {isBusy('APPROVED') ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          Aprovar
                        </button>
                        <button
                          onClick={() => handleDecision(req.id, 'REJECTED')}
                          disabled={!!submitting}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30 transition disabled:opacity-50"
                        >
                          {isBusy('REJECTED') ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
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
    </AdminLayout>
  );
}
