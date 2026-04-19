'use client';

import { useEffect, useState, useCallback } from 'react';
import { PlanGate } from '@/components/plans/PlanGate';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { api } from '@/services/api.client';
import {
  Lock, CheckCircle2, XCircle, Clock, FileText,
  Plus, Trash2, Loader2, ChevronDown, ChevronUp, Upload, Shield, Zap, Search, Eye, Download, Info
} from 'lucide-react';
import styles from '@/styles/Dashboard.module.css';

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

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: any; color: string }> = {
  PENDING:  { label: 'Protocolo Pendente',  cls: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: Clock, color: '#f59e0b' },
  APPROVED: { label: 'Acesso Liberado',    cls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: CheckCircle2, color: '#10b981' },
  REJECTED: { label: 'Acesso Revogado',   cls: 'bg-red-500/10 text-red-500 border-red-500/20', icon: XCircle, color: '#ef4444' },
};

const FILTER_OPTIONS = [
  { label: 'Todos os Protocolos', value: 'all' },
  { label: 'Pendentes',    value: 'PENDING'  },
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
    if (!docName.trim()) { setError('Identifique o documento antes do upload.'); return; }
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
      setError(err?.response?.data?.message || 'Erro no protocolo de upload.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (doc: DataRoomDocument) => {
    if (!confirm(`Remover "${doc.name}" do repositório seguro?`)) return;
    try {
      await api.delete(`/dataroom/documents/${doc.id}`);
      loadDocs();
    } catch { /* silent */ }
  };

  return (
    <div style={{ padding: '32px', background: 'rgba(0,0,0,0.25)', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <h4 style={{ margin: 0, fontSize: '11px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText size={14} className="text-[#00b8b2]" /> Repositório de Auditoria M&A
        </h4>
        <button
          onClick={() => { setShowAddForm(s => !s); setError(''); }}
          className={styles.btnBrand}
          style={{ height: '36px', fontSize: '11px', padding: '0 16px', borderRadius: '8px' }}
        >
          <Plus size={14} className="mr-2" /> Indexar Novo Documento
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: '24px', padding: '12px 20px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', fontSize: '12px', fontWeight: 700 }}>
          {error}
        </div>
      )}

      {showAddForm && (
        <div className={styles.card} style={{ marginBottom: '32px', padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <input
              type="text"
              value={docName}
              onChange={e => setDocName(e.target.value)}
              style={{ flex: 1, padding: '12px 20px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '13px' }}
              placeholder="Nome técnico do documento (ex: DRE Auditado 2024)"
            />
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              background: uploading ? 'rgba(255,255,255,0.03)' : '#00b8b2', 
              color: '#fff', 
              padding: '0 24px', 
              borderRadius: '10px', 
              fontSize: '13px', 
              fontWeight: 800, 
              cursor: uploading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              border: 'none'
            }}>
              {uploading
                ? <Loader2 size={16} className="animate-spin" />
                : <Upload size={16} />
              }
              {uploading ? 'Processando...' : 'Iniciar Upload'}
              <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <Loader2 size={32} className="text-[#00b8b2] animate-spin" />
        </div>
      ) : docs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
           <div style={{ background: 'rgba(255,255,255,0.02)', width: '56px', height: '56px', borderRadius: '16px', margin: '0 auto 20px', display: 'grid', placeItems: 'center' }}>
              <Shield size={24} className="text-[#1e293b]" />
           </div>
           <p style={{ fontSize: '14px', color: '#475569', fontWeight: 700 }}>Nenhum documento restrito configurado para este ativo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {docs.map(doc => (
            <div key={doc.id} className={styles.card} style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', display: 'grid', placeItems: 'center' }}>
                  <FileText size={18} className="text-[#00b8b2]" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 800, color: '#eef6ff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</p>
                  <p style={{ fontSize: '10px', color: '#475569', margin: '2px 0 0', fontWeight: 700, textTransform: 'uppercase' }}>{doc.mediaType.split('/')[1] || 'DOC'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href={doc.url}
                  className={styles.btnGhost}
                  style={{ width: '36px', height: '36px', padding: 0, borderRadius: '8px' }}
                  title="Visualizar Documento"
                >
                  <Eye size={14} />
                </a>
                <button
                  onClick={() => handleDelete(doc)}
                  className={styles.btnGhost}
                  style={{ width: '36px', height: '36px', padding: 0, borderRadius: '8px', color: '#ef4444' }}
                  title="Remover do Repositório"
                >
                  <Trash2 size={14} />
                </button>
              </div>
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
      setFeedback({ type: 'error', msg: 'Erro na sincronização de protocolos.' });
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
        msg: status === 'APPROVED' ? 'Acesso privilegiado concedido.' : 'Acesso ao repositório revogado.',
      });
      load();
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err?.response?.data?.message || 'Erro no processamento da decisão.' });
    } finally {
      setSubmitting(null);
    }
  };

  const filtered = requests.filter(r => filter === 'all' || r.status === filter);
  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  const uniqueListingIds = [...new Set(requests.map(r => r.listing.id))];

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Virtual Data Room</h1>
          <p>Terminal de custódia documental e gestão de privilégios de auditoria.</p>
        </div>
        {pendingCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', padding: '10px 20px', borderRadius: '12px' }}>
             <Zap size={16} className="text-amber-500 animate-pulse" />
             <span style={{ fontSize: '12px', fontWeight: 900, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{pendingCount} Protocolos Pendentes</span>
          </div>
        )}
      </div>

      {feedback && (
        <div style={{ 
          marginBottom: '40px', 
          padding: '20px 24px', 
          borderRadius: '12px',
          border: feedback.type === 'success' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
          background: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
          color: feedback.type === 'success' ? '#10b981' : '#ef4444',
          fontSize: '14px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          {feedback.msg}
        </div>
      )}

      {/* Repositories Section */}
      <div style={{ marginBottom: '64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
           <div style={{ width: '4px', height: '16px', background: '#00b8b2', borderRadius: '4px' }}></div>
           <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#fff', margin: 0 }}>Gestão de Repositórios por Ativo</h2>
        </div>

        {uniqueListingIds.length === 0 && !loading ? (
          <div className={styles.card} style={{ textAlign: 'center', padding: '100px 40px', borderStyle: 'dotted' }}>
            <FileText size={48} style={{ color: '#1e293b', margin: '0 auto 24px' }} />
            <p style={{ color: '#64748b', fontSize: '15px' }}>Inicie o processo de auditoria de um ativo para criar um Data Room.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {uniqueListingIds.map(lid => {
              const req = requests.find(r => r.listing.id === lid)!;
              const isOpen = expandedListingId === lid;
              return (
                <div key={lid} className={styles.card} style={{ padding: 0, overflow: 'hidden', border: isOpen ? '1px solid rgba(0,184,178,0.3)' : '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)', transition: '0.3s' }}>
                  <button
                    onClick={() => setExpandedListingId(isOpen ? null : lid)}
                    style={{ width: '100%', padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: isOpen ? 'rgba(0,184,178,0.03)' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                       <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', display: 'grid', placeItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <Lock size={20} className={isOpen ? 'text-[#00b8b2]' : 'text-[#475569]'} />
                       </div>
                       <div>
                          <p style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#fff' }}>{req.listing.title}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                             <span style={{ fontSize: '10px', fontWeight: 900, color: '#00b8b2', background: 'rgba(0,184,178,0.1)', padding: '2px 8px', borderRadius: '4px' }}>SECURE ROOM</span>
                             <span style={{ fontSize: '10px', color: '#475569', fontWeight: 700 }}>REF: {lid.split('-')[0].toUpperCase()}</span>
                          </div>
                       </div>
                    </div>
                    {isOpen ? <ChevronUp size={20} className="text-[#00b8b2]" /> : <ChevronDown size={20} className="text-[#475569]" />}
                  </button>
                  {isOpen && (
                    <PlanGate
                      minTier="PROFESSIONAL"
                      variant="blur"
                      title="Data Room Corporativo"
                      description="A custódia de documentos confidenciais exige o plano Professional ou Elite."
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

      {/* Access Requests Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <div style={{ width: '4px', height: '16px', background: '#fb923c', borderRadius: '4px' }}></div>
             <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#fff', margin: 0 }}>Protocolos de Acesso</h2>
          </div>
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
            {FILTER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={filter === opt.value ? styles.btnBrand : styles.btnGhost}
                style={{ height: '32px', fontSize: '11px', padding: '0 16px', borderRadius: '8px', border: 'none' }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', placeItems: 'center', height: '200px' }}>
            <Loader2 size={32} className="text-[#00b8b2] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.card} style={{ textAlign: 'center', padding: '60px 20px', borderStyle: 'dashed' }}>
            <p style={{ fontSize: '14px', color: '#64748b', fontWeight: 700 }}>Nenhum protocolo encontrado para o critério selecionado.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filtered.map(req => {
              const cfg = STATUS_CONFIG[req.status];
              const StatusIcon = cfg.icon;
              const isBusy = (id: string) => submitting === req.id + id;

              return (
                <div key={req.id} className={styles.card} style={{ padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '32px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px', minWidth: 0 }}>
                    <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.02)', borderRadius: '18px', display: 'grid', placeItems: 'center', fontSize: '20px', fontWeight: 900, color: '#fff', border: '1px solid rgba(255,255,255,0.05)' }}>
                      {req.investor.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                        <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#fff' }}>{req.investor.fullName}</h3>
                        <span className={`${styles.badge} ${cfg.cls}`} style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', padding: '4px 12px' }}>
                           <StatusIcon size={12} className="mr-2" /> {cfg.label}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '13px', color: '#475569', fontWeight: 700 }}>
                        Alvo: <span style={{ color: '#8fa6c3' }}>{req.listing.title}</span>
                      </p>
                      {req.message && (
                        <div style={{ marginTop: '16px', padding: '12px 18px', background: 'rgba(0,184,178,0.03)', borderRadius: '10px', border: '1px solid rgba(0,184,178,0.1)', maxWidth: '400px' }}>
                           <p style={{ margin: 0, fontSize: '12px', color: '#8fa6c3', lineHeight: 1.6, fontStyle: 'italic' }}>
                              &ldquo;{req.message}&rdquo;
                           </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px' }}>
                    <span style={{ fontSize: '11px', color: '#475569', fontWeight: 800, textTransform: 'uppercase' }}>
                      Protocolo: {new Date(req.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                    {req.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          onClick={() => handleDecision(req.id, 'REJECTED')}
                          disabled={!!submitting}
                          className={styles.btnGhost}
                          style={{ height: '44px', padding: '0 24px', fontSize: '13px', fontWeight: 800, color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.1)' }}
                        >
                          {isBusy('REJECTED') ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} className="mr-2" />}
                          Rejeitar
                        </button>
                        <button
                          onClick={() => handleDecision(req.id, 'APPROVED')}
                          disabled={!!submitting}
                          className={styles.btnBrand}
                          style={{ height: '44px', padding: '0 24px', fontSize: '13px', fontWeight: 800 }}
                        >
                          {isBusy('APPROVED') ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} className="mr-2" />}
                          Aprovar Protocolo
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
