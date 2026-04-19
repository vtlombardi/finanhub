'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ListingsService } from '@/services/ListingsService';
import { LeadsService } from '@/features/leads/leads.service';
import { 
  MessageCircle, 
  Info, 
  Send, 
  DollarSign, 
  Heart, 
  ChevronRight, 
  ShieldCheck, 
  MapPin, 
  Briefcase,
  TrendingUp,
  FileText,
  Lock,
  ArrowRight,
  ArrowLeft,
  Activity,
  History,
  FileSearch,
  CheckCircle,
  Clock
} from 'lucide-react';
import { DataRoomSection } from '@/components/deals/DataRoomSection';
import { useListingDetail } from '@/hooks/useListings';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useAuth } from '@/features/auth/AuthProvider';
import Link from 'next/link';
import styles from '@/styles/Dashboard.module.css';

// ─── Components ──────────────────────────────────────────────────────────────

const ProtocolBadge = ({ icon: Icon, children, color = '#3b82f6' }: { icon: any, children: React.ReactNode, color?: string }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-[10px] font-black text-[#475569] uppercase tracking-widest">
    <Icon size={12} style={{ color }} />
    {children}
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InternalDealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { show } = useNotificationStore();
  const slug = params.slug as string;

  const { listing: deal, loading, error, refresh } = useListingDetail(slug);

  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadMessage, setLeadMessage] = useState('');
  const [leadSent, setLeadSent] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalValue, setProposalValue] = useState('');
  const [proposalConditions, setProposalConditions] = useState('');
  const [proposalSent, setProposalSent] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);

  const requireAuth = () => {
    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=/dashboard/deals/${slug}`);
      return false;
    }
    return true;
  };

  const handleSendLead = async () => {
    if (!requireAuth() || !deal) return;
    if (!leadMessage.trim()) return;
    setSubmitting(true);
    try {
      const result = await LeadsService.createLead(deal.id, leadMessage);
      setLeadSent(true);
      setLeadId(result.id);
      setShowLeadForm(false);
      show('Interesse protocolado com sucesso!', 'success');
    } catch {
      show('Erro ao processar manifestação de interesse.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendProposal = async () => {
    if (!leadId) return;
    const value = parseFloat(proposalValue);
    if (isNaN(value) || value <= 0) return;
    setSubmitting(true);
    try {
      await LeadsService.createProposal(leadId, value, proposalConditions || undefined);
      setProposalSent(true);
      setShowProposalForm(false);
      show('Proposta de aquisição enviada!', 'success');
    } catch {
      show('Erro no envio da proposta institucional.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFavorite = async () => {
    if (!requireAuth() || !deal) return;
    try {
      const res = await ListingsService.toggleFavorite(deal.id);
      show(res.favorited ? 'Salvou nos favoritos.' : 'Removido dos favoritos.', 'success');
    } catch {
      show('Falha na atualização global.', 'error');
    }
  };

  if (error) {
    return (
      <div className="p-8">
        <Link href="/dashboard/deals" className="flex items-center gap-2 text-[#475569] hover:text-white transition mb-12 font-bold text-xs uppercase tracking-widest">
           <ArrowLeft size={14} /> Voltar ao Terminal
        </Link>
        <div className={styles.card} style={{ textAlign: 'center', padding: '100px 40px', borderStyle: 'dashed' }}>
          <p className="text-[#64748b] mb-6 font-bold">{error}</p>
          <button onClick={() => router.push('/dashboard/deals')} className={styles.btnBrand}>Recarregar Marketplace</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Back & Breadcrumb */}
      <div className="flex items-center justify-between mb-12">
        <Link href="/dashboard/deals" className="flex items-center gap-2 text-[#475569] hover:text-white transition font-black text-[10px] uppercase tracking-[0.2em] group">
           <div className="w-8 h-8 rounded-lg bg-white/[0.02] border border-white/[0.05] flex items-center justify-center group-hover:bg-white/5 group-hover:border-white/10 transition-all">
             <ArrowLeft size={14} />
           </div>
           Voltar ao Marketplace
        </Link>
        <div className="flex items-center gap-4">
           {deal && (
             <span className="text-[10px] font-black text-[#475569] uppercase tracking-widest px-3 py-1 bg-white/[0.01] border border-white/[0.03] rounded-md">
                Ref ID: #{deal.id.slice(0, 8)}
             </span>
           )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-12 animate-pulse">
          <div className="h-16 bg-white/[0.01] rounded-2xl w-3/4" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 h-[500px] bg-white/[0.01] rounded-[32px]" />
            <div className="h-[400px] bg-white/[0.01] rounded-[32px]" />
          </div>
        </div>
      ) : deal ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          <div className="lg:col-span-2 space-y-12">
            {/* Header Content */}
            <section>
              <div className="flex flex-wrap gap-3 mb-6">
                 <ProtocolBadge icon={Briefcase}>{deal.category?.name || 'Mercado M&A'}</ProtocolBadge>
                 <ProtocolBadge icon={MapPin} color="#00b8b2">{deal.state || 'Brasil'}</ProtocolBadge>
                 <ProtocolBadge icon={ShieldCheck} color="#10b981">Auditado • Finanhub Intelligence</ProtocolBadge>
              </div>
              <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-6">{deal.title}</h1>
              <div className="flex items-center gap-6 p-4 bg-white/[0.01] border border-white/[0.03] rounded-2xl w-fit">
                 <div className="flex items-center gap-3">
                   <Clock size={14} className="text-[#334155]" />
                   <span className="text-[11px] font-black text-[#475569] uppercase tracking-widest">Originado em {new Date(deal.createdAt).toLocaleDateString('pt-BR')}</span>
                 </div>
                 <div className="w-1 h-1 rounded-full bg-white/10" />
                 <div className="flex items-center gap-3">
                   <Activity size={14} className="text-[#00b8b2]" />
                   <span className="text-[11px] font-black text-[#00b8b2] uppercase tracking-widest">Status: Ativo</span>
                 </div>
              </div>
            </section>

            {/* Teaser Content */}
            <section className="space-y-6">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-[#00b8b210] border border-[#00b8b220] flex items-center justify-center text-[#00b8b2]">
                    <FileSearch size={20} />
                 </div>
                 <div>
                   <h2 className="text-lg font-black text-white m-0">Sumário Executivo</h2>
                   <p className="text-[11px] font-bold text-[#475569] m-0 uppercase tracking-widest">Teaser de Negócios & Proposta de Valor</p>
                 </div>
               </div>
               <div className={styles.card} style={{ padding: '40px', fontSize: '15px', lineHeight: 1.8, color: '#8fa6c3', fontWeight: 600, borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.04)', whiteSpace: 'pre-wrap' }}>
                 {deal.description}
               </div>
            </section>

            {/* Document Protocol Panel */}
            <section className="space-y-6">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                    <History size={20} />
                 </div>
                 <div>
                   <h2 className="text-lg font-black text-white m-0">Protocolos Data Room</h2>
                   <p className="text-[11px] font-bold text-[#475569] m-0 uppercase tracking-widest">Documentação Auditada & Histórico de Logs</p>
                 </div>
               </div>
               <div className={styles.card} style={{ padding: '0', borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                 <DataRoomSection listingId={deal.id} />
               </div>
            </section>

            {/* Action Resolution Flow */}
            <div className="pt-8 space-y-6">
               {showLeadForm && (
                 <div className={styles.card} style={{ padding: '40px', background: 'rgba(0,184,178,0.02)', border: '1px solid rgba(0,184,178,0.1)' }}>
                   <div className="flex items-center gap-4 mb-8">
                     <div className="w-12 h-12 rounded-2xl bg-[#00b8b2] text-black flex items-center justify-center">
                        <MessageCircle size={24} strokeWidth={3} />
                     </div>
                     <div>
                       <h3 className="text-xl font-black text-white m-0">Manifestar Interesse Institucional</h3>
                       <p className="text-sm text-[#00b8b2] font-bold m-0 uppercase tracking-widest">O vendedor receberá seus dados de operados verificados</p>
                     </div>
                   </div>
                   <textarea
                     value={leadMessage}
                     onChange={(e) => setLeadMessage(e.target.value)}
                     className="w-full h-40 bg-black/40 border border-white/5 rounded-2xl p-6 text-white text-sm outline-none focus:border-[#00b8b220] transition-all mb-8 font-medium"
                     placeholder="Escreva uma breve apresentação ou tese de investimento..."
                   />
                   <div className="flex gap-4">
                      <button 
                        onClick={handleSendLead}
                        disabled={submitting || !leadMessage.trim()}
                        className={styles.btnBrand}
                        style={{ height: '52px', padding: '0 32px' }}
                      >
                         {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Confirmar Protocolo'}
                      </button>
                      <button onClick={() => setShowLeadForm(false)} className={styles.btnGhost} style={{ height: '52px', padding: '0 24px' }}>Cancelar</button>
                   </div>
                 </div>
               )}

               {showProposalForm && leadId && (
                 <div className={styles.card} style={{ padding: '40px', background: 'rgba(139,92,246,0.02)', border: '1px solid rgba(139,92,246,0.1)' }}>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-violet-600 text-white flex items-center justify-center">
                         <DollarSign size={24} strokeWidth={3} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-white m-0">Provisionar Oferta de Aquisição (NBO)</h3>
                        <p className="text-sm text-violet-400 font-bold m-0 uppercase tracking-widest">Formalize sua tese preliminar de negociação</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                       <div className="space-y-4">
                         <label className="text-[10px] font-black text-[#475569] uppercase tracking-widest">Valor Ofertado (Equity/Asset)</label>
                         <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#334155] font-black">R$</span>
                            <input 
                              type="number"
                              className="w-full h-14 bg-black/40 border border-white/5 rounded-xl pl-12 pr-6 text-white font-mono text-xl font-black outline-none"
                              value={proposalValue}
                              onChange={(e) => setProposalValue(e.target.value)}
                              placeholder="0"
                            />
                         </div>
                       </div>
                       <div className="space-y-4">
                         <label className="text-[10px] font-black text-[#475569] uppercase tracking-widest">Termos Básicos (Cláusulas)</label>
                         <input 
                           type="text"
                           className="w-full h-14 bg-black/40 border border-white/5 rounded-xl px-6 text-white text-sm font-bold outline-none"
                           value={proposalConditions}
                           onChange={(e) => setProposalConditions(e.target.value)}
                           placeholder="Due Diligence, Earn-out, etc..."
                         />
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <button 
                        onClick={handleSendProposal}
                        disabled={submitting || !proposalValue}
                        className={styles.btnBrand}
                        style={{ height: '52px', padding: '0 32px', background: '#8b5cf6' }}
                       >
                          {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Registrar Oferta'}
                       </button>
                       <button onClick={() => setShowProposalForm(false)} className={styles.btnGhost} style={{ height: '52px', padding: '0 24px' }}>Cancelar</button>
                    </div>
                 </div>
               )}

               {leadSent && !proposalSent && (
                 <div className="p-8 rounded-[32px] bg-[#00b8b208] border border-[#00b8b210] flex flex-col md:flex-row items-center gap-8">
                    <div className="w-16 h-16 rounded-[24px] bg-[#00b8b215] flex items-center justify-center text-[#00b8b2] shrink-0">
                       <CheckCircle size={32} />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                       <h4 className="text-lg font-black text-white mb-1">Matching Protocolado</h4>
                       <p className="text-sm text-[#475569] font-medium m-0">Sua manifestação foi enviada. Para acelerar o fluxo de Data Room, configure uma oferta preliminar.</p>
                    </div>
                    {!showProposalForm && (
                      <button onClick={() => setShowProposalForm(true)} className={styles.btnBrand} style={{ whiteSpace: 'nowrap' }}>Configurar Oferta</button>
                    )}
                 </div>
               )}

               {proposalSent && (
                 <div className="p-8 rounded-[32px] bg-violet-600/[0.05] border border-violet-600/10 flex items-center gap-8">
                    <div className="w-16 h-16 rounded-[24px] bg-violet-600/10 flex items-center justify-center text-violet-500 shrink-0">
                       <CheckCircle size={32} />
                    </div>
                    <div>
                       <h4 className="text-lg font-black text-white mb-1">Oferta Institucional em Análise</h4>
                       <p className="text-sm text-[#475569] font-medium m-0">Seu protocolo de aquisição foi enviado. Aguarde retorno do orquestrador ou verifique o painel de leads.</p>
                    </div>
                 </div>
               )}
            </div>
          </div>

          <div className="space-y-8">
            {/* Resolution Card */}
            <div className={styles.card} style={{ padding: '40px', borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.06)', position: 'sticky', top: '40px' }}>
               <div className="mb-10">
                 <p className="text-[10px] font-black text-[#475569] uppercase tracking-[0.2em] mb-3">Valor de Referência</p>
                 <div className="text-4xl font-black text-white font-mono tracking-tighter mb-2">
                    R$ {(deal.price || 0).toLocaleString('pt-BR')}
                 </div>
                 <div className="text-[11px] font-bold text-[#00b8b2] uppercase flex items-center gap-2">
                    <TrendingUp size={12} /> Target Valuation
                 </div>
               </div>

               <div className="h-px bg-white/5 mb-10" />

               <div className="space-y-6 mb-12">
                  <div className="flex items-center justify-between">
                     <span className="text-[11px] font-bold text-[#475569] uppercase tracking-widest">Originador</span>
                     <span className="text-[11px] font-black text-white uppercase">{deal.tenant?.name || 'Vendedor Direto'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-[11px] font-bold text-[#475569] uppercase tracking-widest">Auditado em</span>
                     <span className="text-[11px] font-black text-white uppercase">{new Date(deal.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-[11px] font-bold text-[#475569] uppercase tracking-widest">Confidencialidade</span>
                     <span className="text-[11px] font-black text-[#10b981] uppercase flex items-center gap-1">
                        <Lock size={10} /> Alta (NDA)
                     </span>
                  </div>
               </div>

               <div className="space-y-4">
                 {!leadSent ? (
                   <button 
                    onClick={() => { if (requireAuth()) setShowLeadForm(true); }}
                    className={styles.btnBrand} 
                    style={{ width: '100%', height: '60px', borderRadius: '18px', fontSize: '14px' }}
                   >
                     Protocolar Interesse
                   </button>
                 ) : !proposalSent ? (
                   <button 
                    onClick={() => setShowProposalForm(true)}
                    className={styles.btnBrand} 
                    style={{ width: '100%', height: '60px', borderRadius: '18px', fontSize: '14px', background: '#8b5cf6' }}
                   >
                     Provisionar Oferta
                   </button>
                 ) : (
                   <button 
                    onClick={() => router.push('/dashboard/leads')}
                    className={styles.btnGhost} 
                    style={{ width: '100%', height: '60px', borderRadius: '18px', fontSize: '14px', border: '1px solid rgba(255,255,255,0.05)' }}
                   >
                     Gestão de Leads
                   </button>
                 )}
                 
                 <button 
                  onClick={handleFavorite}
                  className="w-full h-14 rounded-xl border border-white/[0.05] bg-white/[0.01] text-[#475569] hover:text-rose-500 hover:border-rose-500/20 transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3"
                 >
                    <Heart size={14} /> Adicionar aos Favoritos
                 </button>
               </div>

               <div className="mt-10 p-5 bg-black/20 rounded-2xl border border-white/5 flex items-start gap-4">
                 <ShieldCheck size={20} className="text-[#334155] shrink-0" />
                 <p className="text-[10px] font-bold text-[#334155] leading-relaxed m-0 uppercase italic tracking-tighter">
                   Este dossiê é restrito. Toda interação é registrada para fins de conformidade e auditoria M&A.
                 </p>
               </div>
            </div>
          </div>

        </div>
      ) : null}
    </div>
  );
}

function Loader2({ size, className }: { size?: number, className?: string }) {
  return <Activity size={size} className={className} />;
}
