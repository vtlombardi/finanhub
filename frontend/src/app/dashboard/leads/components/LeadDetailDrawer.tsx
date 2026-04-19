'use client';

import React, { useState } from 'react';
import { 
  X, Zap, Shield, User, DollarSign, 
  MessageSquare, Calendar, ChevronRight, 
  FileText, TrendingUp, AlertCircle, CheckCircle2,
  Clock, ArrowRight, MoreHorizontal, Lock, ExternalLink 
} from 'lucide-react';
import styles from '@/styles/Dashboard.module.css';
import { DataRoomService } from '@/services/DataRoomService';
import Link from 'next/link';

interface LeadDetailDrawerProps {
  lead: any;
  onClose: () => void;
  onChat: (lead: any) => void;
  onStatusChange: (leadId: string, status: string) => void;
  onUpdateNotes: (leadId: string, notes: string) => void;
  onRefresh: () => void;
}

const STAGES = [
  { id: 'NEW',          label: 'Inbound' },
  { id: 'UNDER_REVIEW',  label: 'Em Análise' },
  { id: 'QUALIFIED',     label: 'Qualificado' },
  { id: 'PROPOSAL',      label: 'Proposta' },
  { id: 'IN_CONTACT',    label: 'Negociação' },
  { id: 'WON',           label: 'Fechado' },
];

export function LeadDetailDrawer({ lead, onClose, onChat, onStatusChange, onUpdateNotes, onRefresh }: LeadDetailDrawerProps) {
  const [notes, setNotes] = useState(lead.internalNotes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isGrantingAccess, setIsGrantingAccess] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  if (!lead) return null;

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    await onUpdateNotes(lead.id, notes);
    setIsSavingNotes(false);
  };

  const handleGrantAccess = async () => {
    if (!lead.listingId || !lead.investorId) return;
    setIsGrantingAccess(true);
    try {
      await DataRoomService.grantAccess(lead.listingId, lead.investorId);
      onRefresh();
    } catch (err) {
      console.error('Error granting access:', err);
    } finally {
      setIsGrantingAccess(false);
    }
  };

  const currentStageIndex = STAGES.findIndex(s => s.id === lead.status);
  const score = lead.score ?? 0;

  // Find the specific Data Room request for this investor/listing pair
  const dataRoomRequest = lead.listing?.dataRoomRequests?.find(
    (r: any) => r.investorId === lead.investorId
  );

  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        right: 0, 
        width: '500px', 
        height: '100%', 
        background: '#0a0f1d', 
        borderLeft: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideIn 0.3s ease-out'
      }}
    >
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>

      {/* Header */}
      <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '10px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Protocolo Negócio</span>
              <span style={{ fontSize: '10px', fontWeight: 900, color: '#00b8b2' }}>#{lead.id.slice(0, 8).toUpperCase()}</span>
           </div>
           <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#fff' }}>Dossiê do Lead</h2>
        </div>
        <button 
          onClick={onClose}
          style={{ padding: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: '#64748b', borderRadius: '10px', cursor: 'pointer' }}
          className="hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
        
        {/* Stage Progress */}
        <div style={{ marginBottom: '32px' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748b' }}>Status Atual</span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#00b8b2' }}>{STAGES[currentStageIndex]?.label}</span>
           </div>
           <div style={{ display: 'flex', gap: '4px' }}>
              {STAGES.map((s, idx) => (
                <div 
                  key={s.id} 
                  style={{ 
                    flex: 1, 
                    height: '4px', 
                    borderRadius: '2px', 
                    background: idx <= currentStageIndex ? '#00b8b2' : 'rgba(255,255,255,0.03)' 
                  }} 
                />
              ))}
           </div>
        </div>

        {/* Investor Profile */}
        <div className={styles.card} style={{ padding: '24px', marginBottom: '32px', border: '1px solid rgba(0,184,178,0.1)' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(0,184,178,0.1)', display: 'grid', placeItems: 'center', color: '#00b8b2' }}>
                 <User size={24} />
              </div>
              <div>
                 <div style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>{lead.investor?.fullName}</div>
                 <div style={{ fontSize: '13px', color: '#64748b' }}>{lead.investor?.email}</div>
              </div>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                 <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Patrimônio/Fundo</div>
                 <div style={{ fontSize: '13px', color: '#fff', fontWeight: 700 }}>{lead.investmentRange || 'Não Informado'}</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                 <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Match IA</div>
                 <div style={{ fontSize: '13px', color: score > 70 ? '#10b981' : '#fb923c', fontWeight: 700 }}>{score}% de Fit</div>
              </div>
           </div>
        </div>

        {/* HAYIA ADVANCED COUNSEL */}
        <div style={{ marginBottom: '32px' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Zap size={18} className="text-[#00b8b2]" />
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>HAYIA Counsel — Análise Estratégica</h3>
           </div>
           
           <div style={{ 
             padding: '24px', 
             background: 'linear-gradient(135deg, rgba(0,184,178,0.03) 0%, rgba(0,0,0,0) 100%)', 
             borderRadius: '20px', 
             border: '1px solid rgba(0,184,178,0.1)' 
           }}>
              <div style={{ marginBottom: '20px' }}>
                 <div style={{ fontSize: '11px', fontWeight: 800, color: '#00b8b2', textTransform: 'uppercase', marginBottom: '8px' }}>Diagnóstico de Intenção</div>
                 <p style={{ margin: 0, fontSize: '14px', color: '#8fa6c3', lineHeight: 1.6 }}>{lead.aiReasonSummary}</p>
              </div>

              <div className="space-y-4">
                 <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                       <CheckCircle2 size={12} className="text-emerald-400" />
                    </div>
                    <div>
                       <div style={{ fontSize: '12px', fontWeight: 800, color: '#fff', marginBottom: '2px' }}>Ação Recomendada</div>
                       <div style={{ fontSize: '12px', color: '#64748b' }}>{lead.aiRecommendedAction || 'Iniciar aproximação formal via chat.'}</div>
                    </div>
                 </div>
                 
                 <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(251,146,60,0.1)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                       <AlertCircle size={12} className="text-orange-400" />
                    </div>
                    <div>
                       <div style={{ fontSize: '12px', fontWeight: 800, color: '#fff', marginBottom: '2px' }}>Próximo Passo Sugerido</div>
                       <div style={{ fontSize: '12px', color: '#64748b' }}>Solicitar declaração de fundos (POF) antes de liberar o Data Room.</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Internal Notes */}
        <div style={{ marginBottom: '32px' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 900, color: '#fff', textTransform: 'uppercase' }}>Notas do Negócio</h3>
              <button 
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                style={{ fontSize: '11px', fontWeight: 800, color: '#00b8b2', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {isSavingNotes ? 'Salvando...' : 'Salvar'}
              </button>
           </div>
           <textarea 
             value={notes}
             onChange={(e) => setNotes(e.target.value)}
             placeholder="Anote detalhes da conversa, propostas verbais ou observações..."
             style={{ 
               width: '100%', 
               height: '80px', 
               background: 'rgba(0,0,0,0.3)', 
               border: '1px solid rgba(255,255,255,0.05)', 
               borderRadius: '12px', 
               padding: '16px', 
               color: '#fff', 
               fontSize: '13px', 
               fontFamily: 'inherit',
               resize: 'none',
               outline: 'none'
             }}
             className="focus:border-[#00b8b2]/30"
           />
        </div>

        {/* DATA ROOM SECTION */}
        <div style={{ marginBottom: '32px' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Shield size={18} className="text-[#fb923c]" />
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 900, color: '#fff', textTransform: 'uppercase' }}>Data Room & Confidencialidade</h3>
           </div>
           
           <div style={{ 
             padding: '24px', 
             background: 'rgba(251,146,60,0.03)', 
             borderRadius: '20px', 
             border: '1px solid rgba(251,146,60,0.1)' 
           }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                 <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Acesso ao Repositório</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Status da auditoria estratégica</div>
                 </div>
                 {dataRoomRequest?.status === 'APPROVED' ? (
                   <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16,185,129,0.1)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)' }}>
                      <CheckCircle2 size={12} className="text-emerald-500" />
                      <span style={{ fontSize: '10px', fontWeight: 900, color: '#10b981', textTransform: 'uppercase' }}>Acesso Liberado</span>
                   </div>
                 ) : (
                   <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <Lock size={12} className="text-[#64748b]" />
                      <span style={{ fontSize: '10px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>Bloqueado</span>
                   </div>
                 )}
              </div>

              {dataRoomRequest?.status === 'APPROVED' && (
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                   <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '9px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Aceite do NDA</div>
                      <div style={{ fontSize: '11px', color: dataRoomRequest?.acceptedNdaAt ? '#10b981' : '#fb923c', fontWeight: 700 }}>
                        {dataRoomRequest?.acceptedNdaAt ? `Sim (${new Date(dataRoomRequest.acceptedNdaAt).toLocaleDateString()})` : 'Pendente'}
                      </div>
                   </div>
                   <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '9px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Interação</div>
                      <div style={{ fontSize: '11px', color: '#fff', fontWeight: 700 }}>
                        Audit Trail Ativo
                      </div>
                   </div>
                </div>
              )}

              <button 
                onClick={() => handleGrantAccess()}
                disabled={dataRoomRequest?.status === 'APPROVED' || isGrantingAccess}
                style={{ 
                  width: '100%', 
                  height: '44px', 
                  borderRadius: '12px', 
                  background: dataRoomRequest?.status === 'APPROVED' ? 'rgba(255,255,255,0.02)' : '#fb923c', 
                  color: '#fff', 
                  fontSize: '12px', 
                  fontWeight: 800, 
                  border: 'none', 
                  cursor: (dataRoomRequest?.status === 'APPROVED' || isGrantingAccess) ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
                className={(dataRoomRequest?.status === 'APPROVED' || isGrantingAccess) ? '' : 'hover:scale-[1.02] active:scale-[0.98]'}
              >
                {dataRoomRequest?.status === 'APPROVED' ? (
                  <>
                    <Shield size={14} />
                    <span>Acesso Estratégico Ativo</span>
                  </>
                ) : (
                  <>
                    <Zap size={14} />
                    <span>{isGrantingAccess ? 'Liberando...' : 'Liberar Data Room Premium'}</span>
                  </>
                )}
              </button>
           </div>
        </div>

      </div>

      {/* Footer Actions */}
      <div style={{ padding: '24px 32px', borderTop: '1px solid rgba(255,255,255,0.03)', display: 'flex', gap: '12px' }}>
         <button 
           onClick={() => onChat(lead)}
           className={styles.btnBrand} 
           style={{ flex: 1, height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
         >
           <MessageSquare size={18} />
           <span>Abrir Chat</span>
         </button>
         
         <div style={{ position: 'relative', width: '48px' }}>
            <button 
              className={styles.btnGhost} 
              style={{ width: '48px', height: '48px', padding: 0, display: 'grid', placeItems: 'center' }}
            >
              <MoreHorizontal size={18} />
            </button>
         </div>
      </div>
    </div>
  );
}

