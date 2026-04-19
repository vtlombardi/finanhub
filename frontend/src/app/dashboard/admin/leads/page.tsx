'use client';

import { useEffect, useState } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import {
  Inbox, Loader2, Search, Filter, MessageSquare, 
  ExternalLink, StickyNote, MoreHorizontal, ShieldCheck,
  ChevronRight, Calendar, User, Briefcase, Tag, AlertCircle,
  Clock, CheckCircle, Smartphone, Mail, Building, X, Shield, BarChart2,
} from 'lucide-react';
import { LeadsService } from '@/services/leads.service';
import { Lead } from '@shared/contracts';
import { useNotificationStore } from '@/store/useNotificationStore';
import styles from '@/styles/Dashboard.module.css';

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  NEW:           { label: 'Novo',           cls: styles.bBlue },
  UNDER_REVIEW:  { label: 'Em Análise',     cls: styles.bOrange },
  QUALIFIED:     { label: 'Qualificado',    cls: styles.bGreen },
  CONTACTED:     { label: 'Em Contato',     cls: styles.bViolet },
  PROPOSAL_SENT: { label: 'Com Proposta',   cls: styles.bViolet },
  WON:           { label: 'Convertido',     cls: styles.bGreen },
  LOST:          { label: 'Perdido',        cls: styles.bGhost },
};

const INTENT_CONFIG: Record<string, { label: string; cls: string }> = {
  HIGH:   { label: 'Alta',   cls: styles.bGreen },
  MEDIUM: { label: 'Média',  cls: styles.bOrange },
  LOW:    { label: 'Baixa',  cls: styles.bGhost },
};

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AdminLeadsPage() {
  useAuthGuard();
  const { show } = useNotificationStore();

  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  
  // Modals / Selection
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const loadLeads = async (pageToLoad = 1) => {
    setLoading(true);
    try {
      const response = await LeadsService.getAdminLeads({
        search: searchTerm || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        page: pageToLoad,
      });
      setLeads(response.data || []);
      setPagination({
        total: response.total,
        page: response.page,
        lastPage: response.lastPage
      });
      setPage(response.page);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao carregar Central de Leads.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads(1);
  }, [statusFilter]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingStatus(id);
    try {
      await LeadsService.updateLeadStatus(id, newStatus);
      show('Status atualizado com sucesso!', 'success');
      await loadLeads();
    } catch (err) {
      show('Erro ao atualizar status.', 'error');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedLead) return;
    setSavingNotes(true);
    try {
      await LeadsService.updateLeadInternalNotes(selectedLead.id, notes);
      show('Notas salvas com sucesso!', 'success');
      await loadLeads();
      setSelectedLead(null);
    } catch (err) {
      show('Erro ao salvar notas.', 'error');
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <>
      {/* Header Section */}
      <div className={styles.pageHeader}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Shield className="w-7 h-7 text-[#00b8b2]" /> Central de Leads Private
          </h1>
          <p>Gestão estratégica de intenções. Mediação institucional entre investidores e ativos de elite.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => loadLeads()} className={styles.btnGhost} style={{ height: '44px', border: 'none' }}>
            Atualizar Base
          </button>
          <button className={styles.btnBrand} style={{ height: '44px', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Exportar Intel <ExternalLink size={14} />
          </button>
        </div>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
         {[
           { label: 'Pipeline Total', value: pagination?.total || 0, icon: Inbox, color: '#00b8b2' },
           { label: 'Novos Interessados', value: leads.filter(l => l.status === 'NEW').length, icon: Clock, color: '#fb923c' },
           { label: 'High Intent', value: leads.filter(l => l.intentLevel === 'HIGH').length, icon: ShieldCheck, color: '#10b981' },
           { label: 'Negociações Ativas', value: leads.filter(l => l.status === 'CONTACTED').length, icon: BarChart2, color: '#6366f1' },
         ].map((s, idx) => (
           <div key={idx} className={styles.card} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                 <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${s.color}10`, display: 'grid', placeItems: 'center' }}>
                    <s.icon size={16} style={{ color: s.color }} />
                 </div>
                 <span style={{ fontSize: '11px', fontWeight: 800, color: '#8fa6c3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</span>
              </div>
              <p style={{ margin: 0, fontSize: '28px', fontWeight: 900, color: '#fff' }}>{s.value}</p>
           </div>
         ))}
      </div>

      {/* Control Tools */}
      <div className={styles.card} style={{ padding: '12px', marginBottom: '24px', display: 'flex', flexDirection: 'column', mdDirection: 'row', gap: '12px', alignItems: 'center' }}>
         <div style={{ position: 'relative', flex: 1, width: '100%' }}>
            <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#64748b' }} />
            <input 
              type="text" 
              placeholder="Buscar investidor, e-mail ou identificador do ativo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadLeads()}
              style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)', color: '#fff', fontSize: '14px' }}
            />
         </div>
         <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['all', 'NEW', 'QUALIFIED', 'CONTACTED', 'WON'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={statusFilter === s ? styles.btnBrand : styles.btnGhost}
                style={{ height: '36px', fontSize: '11px', padding: '0 16px' }}
              >
                {s === 'all' ? 'Ver Todos' : STATUS_CONFIG[s]?.label || s}
              </button>
            ))}
         </div>
      </div>

      {/* Main Table View */}
      {loading ? (
        <div style={{ display: 'grid', placeItems: 'center', height: '40vh' }}>
          <Loader2 className="w-10 h-10 text-[#00b8b2] animate-spin" />
        </div>
      ) : leads.length === 0 ? (
        <div className={styles.card} style={{ textAlign: 'center', padding: '100px 20px', borderStyle: 'dashed' }}>
           <Inbox size={48} style={{ color: '#64748b', opacity: 0.2, margin: '0 auto 20px' }} />
           <p style={{ color: '#8fa6c3' }}>Nenhum lead operacional localizado para os critérios aplicados.</p>
        </div>
      ) : (
        <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <tr>
                  <th style={{ padding: '16px 24px', fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Investidor de Elite</th>
                  <th style={{ padding: '16px 24px', fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Oportunidade / Tenant</th>
                  <th style={{ padding: '16px 24px', fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', textAlign: 'center' }}>HAYIA Score</th>
                  <th style={{ padding: '16px 24px', fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', textAlign: 'center' }}>Moderação Status</th>
                  <th style={{ padding: '16px 24px', fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Intel</th>
                </tr>
              </thead>
              <tbody style={{ divide: '1px solid rgba(255,255,255,0.04)' }}>
                {leads.map((lead) => {
                  const status = STATUS_CONFIG[lead.status] || STATUS_CONFIG.NEW;
                  const intent = lead.intentLevel ? INTENT_CONFIG[lead.intentLevel] : null;
                  
                  return (
                    <tr key={lead.id} className="hover:bg-white/[0.01] transition-all" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '18px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'grid', placeItems: 'center', fontSize: '14px', fontWeight: 800, color: '#00b8b2' }}>
                            {(lead.investor?.fullName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#fff' }}>{lead.investor?.fullName || 'Anonimo'}</p>
                            <p style={{ margin: 0, fontSize: '12px', color: '#8fa6c3', opacity: 0.6 }}>{lead.investor?.email || 'intel@private.hub'}</p>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '18px 24px' }}>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#eef6ff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>{lead.listing?.title || 'Ativo Descontinuado'}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <span style={{ fontSize: '9px', fontWeight: 900, background: 'rgba(0,184,178,0.1)', color: '#00b8b2', padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                              {lead.listing?.tenant?.name || 'ROOT'}
                            </span>
                            <span style={{ fontSize: '10px', color: '#64748b' }}>{new Date(lead.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                           <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', display: 'grid', placeItems: 'center', fontSize: '13px', fontWeight: 900, color: Number(lead.score) > 70 ? '#10b981' : '#8fa6c3' }}>
                              {lead.score || 0}
                           </div>
                           {intent && (
                             <span className={`${styles.badge} ${intent.cls}`} style={{ fontSize: '9px', padding: '1px 6px' }}>{intent.label}</span>
                           )}
                        </div>
                      </td>

                      <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                        <select 
                          value={lead.status}
                          disabled={updatingStatus === lead.id}
                          onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                          className={`${styles.badge} ${status.cls}`}
                          style={{ border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', background: 'rgba(0,0,0,0.5)', padding: '6px 12px' }}
                        >
                          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                            <option key={key} value={key} style={{ background: '#020617', color: '#fff' }}>{cfg.label}</option>
                          ))}
                        </select>
                      </td>

                      <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                           <button 
                             onClick={() => { setSelectedLead(lead); setNotes(lead.internalNotes || ''); }}
                             className={styles.btnGhost} 
                             style={{ width: '36px', height: '36px', padding: 0, border: lead.internalNotes ? '1px solid rgba(0,184,178,0.3)' : '1px solid rgba(255,255,255,0.06)', color: lead.internalNotes ? '#00b8b2' : '#8fa6c3' }}
                           >
                             <StickyNote size={16} />
                           </button>
                           <button className={styles.btnGhost} style={{ width: '36px', height: '36px', padding: 0 }}>
                             <ChevronRight size={16} />
                           </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination View */}
      {pagination && pagination.lastPage > 1 && (
        <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <button
            onClick={() => loadLeads(page - 1)}
            disabled={page === 1 || loading}
            className={styles.btnGhost}
            style={{ width: '40px', height: '40px', padding: 0 }}
          >
            <ChevronRight style={{ transform: 'rotate(180deg)' }} size={20} />
          </button>
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#8fa6c3' }}>
            Terminal <span style={{ color: '#fff' }}>{page}</span> de <span style={{ color: '#fff' }}>{pagination.lastPage}</span>
          </span>
          <button
            onClick={() => loadLeads(page + 1)}
            disabled={page === pagination.lastPage || loading}
            className={styles.btnGhost}
            style={{ width: '40px', height: '40px', padding: 0 }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Intelligence Notes Modal */}
      {selectedLead && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'grid', placeItems: 'center', zIndex: 2000 }}>
           <div className={styles.card} style={{ width: '100%', maxWidth: '500px', padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <StickyNote size={20} style={{ color: '#00b8b2' }} /> Notas Estratégicas
                 </h3>
                 <button onClick={() => setSelectedLead(null)} className={styles.btnGhost} style={{ width: '32px', height: '32px', padding: 0 }}><X size={18} /></button>
              </div>
              <div style={{ padding: '24px' }}>
                  <div style={{ marginBottom: '20px' }}>
                     <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Investidor Analisado</p>
                     <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#fff' }}>{selectedLead.investor?.fullName}</p>
                  </div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Log de Mediação (Privado)</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Registre o andamento da negociação, profilagem de risco e próximos passos operacionais..."
                    style={{ width: '100%', height: '160px', padding: '16px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', color: '#fff', fontSize: '14px', lineHeight: 1.6, outline: 'none', resize: 'none' }}
                  />
                  <p style={{ margin: '16px 0 0', fontSize: '11px', color: '#fb923c', fontStyle: 'italic', display: 'flex', gap: '8px' }}>
                    <AlertCircle size={14} /> Estas informações são confidenciais e nunca serão compartilhadas com as partes envolvidas.
                  </p>
              </div>
              <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                 <button onClick={() => setSelectedLead(null)} className={styles.btnGhost}>Descartar</button>
                 <button onClick={handleSaveNotes} disabled={savingNotes} className={styles.btnBrand} style={{ minWidth: '140px' }}>
                    {savingNotes ? <Loader2 size={16} className="animate-spin" /> : 'Sincronizar Notas'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </>
  );
}
