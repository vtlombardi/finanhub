'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PublicHeader } from "@/components/layout/PublicHeader";
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
  ArrowRight
} from 'lucide-react';
import { DataRoomSection } from '@/components/deals/DataRoomSection';
import { useListingDetail } from '@/hooks/useListings';
import { useNotificationStore } from '@/store/useNotificationStore';
import Link from 'next/link';

// ─── Components ──────────────────────────────────────────────────────────────

const InfoBadge = ({ icon: Icon, children }: { icon: any, children: React.ReactNode }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/50 border border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
    <Icon size={12} className="text-blue-500" />
    {children}
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { show } = useNotificationStore();
  const slug = params.slug as string;

  const { listing: deal, loading, error, refresh } = useListingDetail(slug);

  // States para Formulários
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadMessage, setLeadMessage] = useState('');
  const [leadSent, setLeadSent] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalValue, setProposalValue] = useState('');
  const [proposalConditions, setProposalConditions] = useState('');
  const [proposalSent, setProposalSent] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const requireAuth = () => {
    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=/deals/${slug}`);
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
      show('Interesse manifestado com sucesso!', 'success');
      // Ao manifestar interesse, já rolamos para a seção de sucessos/próximo passo
    } catch {
      show('Erro ao enviar manifestação de interesse.', 'error');
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
      show('Proposta enviada com sucesso!', 'success');
    } catch {
      show('Erro ao enviar proposta.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFavorite = async () => {
    if (!requireAuth() || !deal) return;
    try {
      const res = await ListingsService.toggleFavorite(deal.id);
      show(res.favorited ? 'Adicionado aos favoritos!' : 'Removido dos favoritos.', 'success');
    } catch {
      show('Erro ao atualizar favoritos.', 'error');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <main className="min-h-screen bg-[#020617] text-slate-100">
        <PublicHeader />
        <div className="pt-40 text-center">
          <p className="text-slate-500 mb-6">{error}</p>
          <Link href="/deals" className="text-blue-500 font-bold hover:underline">Voltar para o Marketplace</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100">
      <PublicHeader />

      {loading ? (
        <div className="pt-40 max-w-5xl mx-auto px-6 space-y-8 h-screen">
          <div className="h-12 bg-slate-900 rounded-2xl animate-pulse w-2/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 h-96 bg-slate-900 rounded-3xl animate-pulse" />
            <div className="h-64 bg-slate-900 rounded-3xl animate-pulse" />
          </div>
        </div>
      ) : deal ? (
        <>
          {/* Hero Section */}
          <div className="pt-32 pb-16 bg-[#020617] border-b border-white/[0.03] relative overflow-hidden">
             <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
             <div className="max-w-5xl mx-auto px-6 relative z-10">
                <div className="flex flex-wrap gap-3 mb-6">
                   <InfoBadge icon={Briefcase}>{deal.category?.name || 'Mercado M&A'}</InfoBadge>
                   <InfoBadge icon={MapPin}>{deal.state || 'Brasil'}</InfoBadge>
                   <InfoBadge icon={ShieldCheck}>Auditado por Finanhub</InfoBadge>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500 leading-[1.15] mb-4">
                  {deal.title}
                </h1>
                <p className="text-slate-500 text-lg font-medium max-w-3xl">
                   Oportunidade originada em {new Date(deal.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}.
                </p>
             </div>
          </div>

          <div className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
            
            {/* Core Dossier Body */}
            <div className="md:col-span-2 space-y-12">
              
              {/* Executive Summary */}
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Info size={18} />
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Dossiê Executivo (Teaser)</h2>
                </div>
                <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 leading-relaxed text-slate-400 font-medium text-lg whitespace-pre-wrap">
                  {deal.description}
                </div>
              </section>

              {/* Data Room Preview */}
              <section className="space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                      <Lock size={18} />
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Data Room & Documentos</h2>
                 </div>
                 <DataRoomSection listingId={deal.id} />
              </section>

              {/* Forms & Flow */}
              <div className="space-y-6 pt-4">
                
                {/* Interest Form */}
                {showLeadForm && (
                  <div className="bg-blue-600/5 border border-blue-500/20 rounded-3xl p-8 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3">
                       <Send size={20} className="text-blue-400" />
                       <h3 className="text-xl font-bold text-white">Manifestar Interesse</h3>
                    </div>
                    <p className="text-slate-500 text-sm">Ao enviar, o vendedor e a equipe técnica da Finanhub serão notificados para validar sua conexão e iniciar a troca de informações confidenciais.</p>
                    <textarea
                      value={leadMessage}
                      onChange={(e) => setLeadMessage(e.target.value)}
                      placeholder="Descreva brevemente sua motivação ou pergunte algo específico sobre a tese..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-slate-200 placeholder-slate-600 outline-none focus:border-blue-500/40 min-h-[140px] resize-none font-medium"
                    />
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handleSendLead}
                        disabled={submitting || !leadMessage.trim()}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-sm transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {submitting ? 'Enviando...' : 'Confirmar Envio'}
                        <ArrowRight size={16} />
                      </button>
                      <button onClick={() => setShowLeadForm(false)} className="text-slate-500 font-bold text-sm hover:text-white transition">Cancelar</button>
                    </div>
                  </div>
                )}

                {/* Proposal Form (Fluid Step) */}
                {showProposalForm && leadId && (
                  <div className="bg-emerald-600/5 border border-emerald-500/20 rounded-3xl p-8 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3">
                       <DollarSign size={20} className="text-emerald-400" />
                       <h3 className="text-xl font-bold text-white">Enviar Proposta Não-Vinculante (NBO)</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest">Valor Ofertado (R$)</label>
                        <input
                          type="number"
                          value={proposalValue}
                          onChange={(e) => setProposalValue(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-emerald-100 placeholder-slate-800 outline-none focus:border-emerald-500/40 font-mono text-lg font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest">Condições / Vantagens</label>
                        <input
                          type="text"
                          value={proposalConditions}
                          onChange={(e) => setProposalConditions(e.target.value)}
                          placeholder="Due diligence, pagamento em 12x..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-200 placeholder-slate-700 outline-none focus:border-emerald-500/40"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handleSendProposal}
                        disabled={submitting || !proposalValue}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold text-sm transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {submitting ? 'Enviando...' : 'Confirmar Oferta'}
                        <ArrowRight size={16} />
                      </button>
                      <button onClick={() => setShowProposalForm(false)} className="text-slate-500 font-bold text-sm hover:text-white transition">Cancelar</button>
                    </div>
                  </div>
                )}

                {/* Success Notifications */}
                {leadSent && !proposalSent && (
                  <div className="bg-blue-600/10 border border-blue-500/20 text-blue-300 p-6 rounded-3xl flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                       <ShieldCheck className="text-blue-400" />
                       <p className="font-bold">Interesse enviado com sucesso!</p>
                    </div>
                    <p className="text-slate-400 text-sm font-medium">Você iniciou uma conexão estratégica. Para acelerar o processo, você pode submeter uma proposta formal agora mesmo.</p>
                    {!showProposalForm && (
                       <button 
                        onClick={() => setShowProposalForm(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-xs w-fit hover:bg-blue-500 transition"
                       >
                         Submeter Proposta Agora
                       </button>
                    )}
                  </div>
                )}

                {proposalSent && (
                  <div className="bg-emerald-600/10 border border-emerald-500/20 text-emerald-300 p-6 rounded-3xl flex items-center gap-4 shadow-2xl shadow-emerald-900/10">
                    <ShieldCheck className="text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-bold">Proposta em Análise</p>
                      <p className="text-emerald-400/60 text-xs font-medium mt-1">Sua oferta foi enviada. Acesse seu painel de Leads para acompanhar.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sticky Sidebar CTA */}
            <div className="md:col-span-1">
              <div className="bg-slate-900/40 border border-slate-800 rounded-[32px] p-8 sticky top-32 space-y-8 backdrop-blur-sm">
                
                <div>
                   <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Valuation Estimado</p>
                   <p className="text-4xl font-mono font-bold text-white tracking-tighter">
                      R$ {(deal.price || 0).toLocaleString('pt-BR')}
                   </p>
                </div>

                <div className="h-px bg-white/5 w-full" />

                <div className="space-y-4">
                   <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-600">Originador:</span>
                      <span className="text-slate-300">{deal.tenant?.name || 'Seller Direct'}</span>
                   </div>
                   <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-600">ID Referência:</span>
                      <span className="text-slate-300 font-mono">#{deal.id.slice(0, 8)}</span>
                   </div>
                </div>

                <div className="pt-4 space-y-4">
                  {!leadSent ? (
                    <button 
                      onClick={() => { if (requireAuth()) setShowLeadForm(true); }}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-2xl py-5 font-bold text-sm transition-all shadow-xl shadow-blue-600/10 active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={18}/> Manifestar Interesse
                    </button>
                  ) : !proposalSent ? (
                    <button
                      onClick={() => setShowProposalForm(true)}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl py-5 font-bold text-sm transition-all shadow-xl shadow-emerald-600/10 active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <DollarSign size={18}/> Enviar Proposta
                    </button>
                  ) : (
                    <Link
                      href="/dashboard/leads"
                      className="w-full bg-slate-800 text-slate-200 rounded-2xl py-5 font-bold text-sm block text-center hover:bg-slate-700 transition"
                    >
                      Ver no Dashboard
                    </Link>
                  )}

                  <button
                    onClick={handleFavorite}
                    className="w-full flex items-center justify-center gap-2 py-4 border border-slate-800 rounded-2xl text-slate-500 hover:text-rose-500 hover:bg-rose-500/5 transition-all text-sm font-bold"
                  >
                    <Heart size={16} /> Salvar como Favorito
                  </button>
                </div>

                <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800/50 flex items-start gap-3">
                   <ShieldCheck size={18} className="text-slate-600 mt-0.5" />
                   <p className="text-[10px] text-slate-600 font-bold leading-relaxed uppercase tracking-tight">
                     Transação Segura e Criptografada. Seus dados só são revelados após aceitação mútua de NDA.
                   </p>
                </div>
              </div>
            </div>
          </div>

          <SimilarDealsSection dealId={deal.id} />
        </>
      ) : null}
    </main>
  );
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function SimilarDealsSection({ dealId }: { dealId: string }) {
  const [similar, setSimilar] = useState<any[]>([]);

  useState(() => {
    ListingsService.getSimilar(dealId).then(setSimilar).catch(() => setSimilar([]));
  });

  if (similar.length === 0) return null;

  return (
    <section className="bg-slate-950/30 border-t border-white/5 py-24 pb-32">
       <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-2xl font-bold text-white">Considere também</h2>
              <p className="text-slate-500 font-medium mt-1">Oportunidades em setores ou faixas de valuation correlatas.</p>
            </div>
            <Link href="/deals" className="text-slate-500 hover:text-blue-500 font-bold text-sm flex items-center gap-1 transition-colors">
              Marketplace Completo <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similar.slice(0, 3).map((item) => (
              <Link href={`/deals/${item.slug || item.id}`} key={item.id} className="group">
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-[32px] p-8 hover:border-blue-500/20 transition-all duration-500 h-full flex flex-col">
                   <div className="flex items-center gap-2 mb-4">
                      <Tag size={12} className="text-slate-700" />
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{item.category?.name || 'M&A Deal'}</span>
                   </div>
                   <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">{item.title}</h3>
                   <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                     <p className="font-mono text-lg font-bold text-slate-400 tracking-tighter">
                        R$ {(item.price || 0).toLocaleString('pt-BR')}
                     </p>
                     <ArrowRight size={18} className="text-slate-700 group-hover:text-blue-500 transition-colors" />
                   </div>
                </div>
              </Link>
            ))}
          </div>
       </div>
    </section>
  );
}
