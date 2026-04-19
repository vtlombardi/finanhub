'use client';

import { useEffect, useState, useMemo } from 'react';
import { DataRoomService } from '@/services/DataRoomService';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  Lock, Unlock, FileText, Download, Send,
  Clock, XCircle, Loader2, ShieldCheck, Zap,
  ChevronRight, AlertCircle, FileDigit, Landmark, 
  Scale, Workflow, ShieldAlert, History
} from 'lucide-react';
import { NdaModal } from './NdaModal';

interface DataRoomDocument {
  id: string;
  title: string;
  url: string;
  category: string;
  createdAt: string;
}

interface DataRoomRequest {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  message: string | null;
  acceptedNdaAt: string | null;
  createdAt: string;
}

type Phase = 'idle' | 'form' | 'loading' | 'pending' | 'approved' | 'rejected' | 'error';

const CATEGORY_MAP: Record<string, { label: string; icon: any; color: string }> = {
  FINANCIAL: { label: 'Financeiro', icon: Landmark, color: '#00b8b2' },
  LEGAL: { label: 'Jurídico', icon: Scale, color: '#fb923c' },
  OPERATIONAL: { label: 'Operacional', icon: Workflow, color: '#3b82f6' },
  CORPORATE: { label: 'Societário', icon: ShieldAlert, color: '#8b5cf6' },
  TAX: { label: 'Tributário', icon: History, color: '#f43f5e' },
  HR: { label: 'RH', icon: Landmark, color: '#10b981' },
  OTHER: { label: 'Outros', icon: FileText, color: '#64748b' },
};

export function DataRoomSection({ listingId }: { listingId: string }) {
  const { isAuthenticated, user } = useAuth();
  const [phase, setPhase] = useState<Phase>('loading');
  const [request, setRequest] = useState<DataRoomRequest | null>(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [documents, setDocuments] = useState<DataRoomDocument[]>([]);
  const [showNdaModal, setShowNdaModal] = useState(false);

  // Load existing request status on mount (if authenticated)
  useEffect(() => {
    if (!isAuthenticated) { setPhase('idle'); return; }

    DataRoomService.getRequestStatus(listingId)
      .then((data) => {
        if (!data) { setPhase('idle'); return; }
        setRequest(data);
        if (data.status === 'APPROVED') {
          setPhase('approved');
          loadDocuments();
          
          // Se aprovado mas não aceitou NDA, mostrar modal
          if (!data.acceptedNdaAt) {
            setShowNdaModal(true);
          }
        } else if (data.status === 'REJECTED') {
          setPhase('rejected');
        } else {
          setPhase('pending');
        }
      })
      .catch(() => setPhase('idle'));
  }, [isAuthenticated, listingId]);

  const loadDocuments = () => {
    DataRoomService.getDocuments(listingId)
      .then((data) => setDocuments(data))
      .catch(() => {});
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await DataRoomService.createRequest(listingId, message.trim() || undefined);
      setPhase('pending');
    } catch {
      setPhase('error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptNda = async () => {
    try {
      await DataRoomService.acceptNda(listingId);
      setShowNdaModal(false);
      // Refresh status
      const updatedStatus = await DataRoomService.getRequestStatus(listingId);
      setRequest(updatedStatus);
    } catch (err) {
      console.error('Falha ao aceitar NDA:', err);
    }
  };

  const handleViewDocument = async (doc: DataRoomDocument) => {
    try {
      await DataRoomService.logView(doc.id);
      window.open(doc.url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Falha ao registrar visualização:', err);
      // Ainda tenta abrir o documento
      window.open(doc.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Group documents by category
  const groupedDocuments = useMemo(() => {
    const groups: Record<string, DataRoomDocument[]> = {};
    documents.forEach(doc => {
      if (!groups[doc.category]) groups[doc.category] = [];
      groups[doc.category].push(doc);
    });
    return groups;
  }, [documents]);

  // ── Unauthenticated ────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <section id="data-room-section" style={{ 
        background: 'rgba(255,255,255,0.02)', 
        border: '1px solid rgba(255,255,255,0.05)', 
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        gap: '16px'
      }}>
        <div style={{ 
          width: '48px', 
          height: '48px', 
          borderRadius: '12px', 
          background: 'rgba(59,130,246,0.1)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <ShieldCheck className="text-[#3b82f6]" size={24} />
        </div>
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Data Room & Repositório Privado</h3>
          <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>
            Faça login para solicitar acesso ao repositório estratégico desta operação e visualizar documentos confidenciais (DRE, Contratos, Balanços).
          </p>
        </div>
      </section>
    );
  }

  // ── Seller/Owner Case ──────────────────────────────────────────────────────
  // We check if the current user is the owner of the listing via tenantId
  // We'll need the listing tenantId. If not passed, we might need to verify or assume.
  // Assuming listing object is available or we can check via request (backend will handle 403 if wrong).
  // But for better UX, if we have listingId, and we are logged in, we check.
  // To keep it simple and robust, we add a check if the user is the seller.
  const isSeller = user?.tenantId && listing?.tenantId && user.tenantId === listing.tenantId;

  if (isSeller) {
    return (
      <section id="data-room-section" style={{ 
        background: 'rgba(59,130,246,0.05)', 
        border: '1px solid rgba(59,130,246,0.2)', 
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '12px', 
            background: 'rgba(59,130,246,0.1)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Lock className="text-[#3b82f6]" size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Gestão de Data Room (Seu Anúncio)</h3>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>
              Como anunciante, você pode gerenciar os documentos confidenciais, aceitar termos de NDA e controlar o acesso dos interessados.
            </p>
          </div>
        </div>
        
        <Link 
          href={`/dashboard/listings/${listingId}/dataroom`}
          style={{
            background: '#3b82f6',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 600,
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Settings size={16} />
          Gerenciar Repositório & Documentos
        </Link>
      </section>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
        <Loader2 size={16} className="text-[#00b8b2] animate-spin" />
        <span style={{ fontSize: '13px', color: '#64748b' }}>Verificando credenciais do Data Room...</span>
      </div>
    );
  }

  // ── Approved ───────────────────────────────────────────────────────────────
  if (phase === 'approved') {
    const isNdaPending = !request?.acceptedNdaAt;

    return (
      <section style={{ 
        background: 'rgba(255,255,255,0.02)', 
        border: '1px solid rgba(255,255,255,0.05)', 
        borderRadius: '20px',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
              <Unlock size={20} className="text-[#10b981] mx-auto" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>Repositório Estratégico</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 800, textTransform: 'uppercase' }}>Acesso Liberado</span>
              </div>
            </div>
          </div>
          
          {!isNdaPending && (
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
              NDA Aceito em {new Date(request!.acceptedNdaAt!).toLocaleDateString()}
            </div>
          )}
        </div>

        <div style={{ padding: '24px' }}>
          {isNdaPending ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Lock size={32} className="text-[#64748b] mx-auto mb-4 opacity-50" />
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Documentos Protegidos</h4>
              <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '300px', margin: '0 auto 20px' }}>
                Você precisa aceitar os termos de confidencialidade para visualizar os arquivos desta operação.
              </p>
              <button 
                onClick={() => setShowNdaModal(true)}
                className="bg-[#00b8b2] hover:bg-[#0e8a87] text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              >
                Acessar Termos de Sigilo
              </button>
            </div>
          ) : documents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '12px' }}>
              <p style={{ fontSize: '13px', color: '#64748b' }}>Aguardando upload de documentos pelo vendedor.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {Object.entries(groupedDocuments).map(([category, docs]) => {
                const config = CATEGORY_MAP[category] || CATEGORY_MAP.OTHER;
                const Icon = config.icon;
                
                return (
                  <div key={category}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                       <Icon size={14} style={{ color: config.color }} />
                       <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: config.color, letterSpacing: '0.05em' }}>
                         {config.label}
                       </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                      {docs.map(doc => (
                        <div 
                          key={doc.id}
                          onClick={() => handleViewDocument(doc)}
                          style={{ 
                            background: 'rgba(255,255,255,0.03)', 
                            border: '1px solid rgba(255,255,255,0.05)', 
                            borderRadius: '12px', 
                            padding: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          className="hover:border-[#00b8b2]/30 hover:bg-[rgba(0,184,178,0.03)] group"
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                            <div style={{ color: '#00b8b2' }}>
                               <FileDigit size={18} />
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {doc.title}
                            </span>
                          </div>
                          <Download size={14} className="text-[#475569] group-hover:text-[#00b8b2] shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <NdaModal 
          isOpen={showNdaModal}
          onClose={() => {
            // Se fechar e não aceitou, mantemos o estado de pendência
            if (!request?.acceptedNdaAt) {
              // Note: This modal is mandatory for viewing
            }
            setShowNdaModal(false);
          }}
          listingTitle="esta operação"
          onAccept={handleAcceptNda}
        />
      </section>
    );
  }

  // ── Pending ────────────────────────────────────────────────────────────────
  if (phase === 'pending') {
    return (
      <section style={{ 
        background: 'rgba(251,146,60,0.03)', 
        border: '1px solid rgba(251,146,60,0.1)', 
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        gap: '16px'
      }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(251,146,60,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Clock className="text-[#fb923c]" size={24} />
        </div>
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fb923c', marginBottom: '4px' }}>Solicitação em Análise</h3>
          <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' }}>
            Sua solicitação de acesso foi enviada. O anunciante analisará seu perfil e liberará o repositório estratégico conforme o avanço da negociação.
          </p>
        </div>
      </section>
    );
  }

  // ── Rejected ───────────────────────────────────────────────────────────────
  if (phase === 'rejected') {
    return (
      <section style={{ 
        background: 'rgba(244,63,94,0.03)', 
        border: '1px solid rgba(244,63,94,0.1)', 
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        gap: '16px'
      }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(244,63,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <XCircle className="text-[#f43f5e]" size={24} />
        </div>
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#f43f5e', marginBottom: '4px' }}>Acesso Restrito</h3>
          <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' }}>
            Infelizmente, seu acesso ao repositório estratégico não foi autorizado para esta operação no momento.
          </p>
        </div>
      </section>
    );
  }

  // ── Form (idle / error) ────────────────────────────────────────────────────
  return (
    <section style={{ 
      background: 'rgba(255,255,255,0.02)', 
      border: '1px solid rgba(255,255,255,0.05)', 
      borderRadius: '20px',
      padding: '24px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(0,184,178,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Lock size={20} className="text-[#00b8b2]" />
        </div>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>Solicitar Acesso ao Data Room</h3>
          <p style={{ fontSize: '12px', color: '#64748b' }}>Documentos estratégicos e análise fundamentalista</p>
        </div>
      </div>

      <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '20px' }}>
        O Data Room contém documentos confidenciais sobre o ativo. O acesso é liberado manualmente pelo vendedor após validação inicial do interesse.
      </p>

      {phase === 'error' && (
        <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', color: '#f43f5e', fontSize: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={14} />
          Falha ao enviar solicitação. Tente novamente ou contate o suporte.
        </div>
      )}

      {phase === 'form' ? (
        <form onSubmit={handleRequest} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginBottom: '8px', letterSpacing: '0.05em' }}>
              Mensagem de Apresentação <span style={{ color: '#475569' }}>(Opcional)</span>
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Ex: Gostaria de analisar os dados para follow-up da tese..."
              style={{ 
                width: '100%', 
                background: 'rgba(0,0,0,0.2)', 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '12px', 
                padding: '16px', 
                color: '#fff', 
                fontSize: '13px',
                minHeight: '100px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#00b8b2'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{ 
                flex: 1, 
                height: '44px', 
                background: '#00b8b2', 
                color: '#fff', 
                borderRadius: '12px', 
                fontSize: '13px', 
                fontWeight: 800, 
                border: 'none', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px',
                cursor: submitting ? 'default' : 'pointer',
                opacity: submitting ? 0.7 : 1
              }}
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={14} />}
              {submitting ? 'Enviando...' : 'Confirmar Solicitação'}
            </button>
            <button
              type="button"
              onClick={() => setPhase('idle')}
              style={{ height: '44px', padding: '0 20px', background: 'transparent', color: '#64748b', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setPhase('form')}
          style={{ 
            width: '100%', 
            height: '48px', 
            background: 'rgba(0,184,178,0.1)', 
            border: '1px solid rgba(0,184,178,0.2)', 
            borderRadius: '14px', 
            color: '#00b8b2', 
            fontSize: '13px', 
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          className="hover:bg-[#00b8b2] hover:text-white"
        >
          <Zap size={16} />
          <span>Solicitar Acesso Estratégico</span>
        </button>
      )}
    </section>
  );
}
