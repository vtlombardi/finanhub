'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PublicHeader } from "@/components/layout/PublicHeader";
import { ListingsService } from '@/features/listings/listings.service';
import { LeadsService } from '@/features/leads/leads.service';
import { ShieldCheck, MessageCircle, Info, Send, DollarSign, Heart } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthProvider';
import Link from 'next/link';

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deal, setDeal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Lead & Proposal State
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadMessage, setLeadMessage] = useState('');
  const [leadSent, setLeadSent] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalValue, setProposalValue] = useState('');
  const [proposalConditions, setProposalConditions] = useState('');
  const [proposalSent, setProposalSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const slug = params.slug as string;

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const data = await ListingsService.getListingBySlug(slug);
        setDeal(data);
      } catch {
        setDeal({
          id: '123', slug: 'tech-saas-b2b',
          title: 'SaaS B2B com ARR constante e Churn Zero',
          description: 'A companhia de Software as a Service opera há 5 anos provendo infraestrutura baseada em nuvem para logísticas...',
          price: 4000000,
          category: { name: 'Tecnologia (Software/SaaS)' },
          status: 'ACTIVE',
          tenant: { name: 'Empresa Privada (#4192)' }
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDeal();
  }, [slug]);

  const requireAuth = () => {
    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=/deals/${slug}`);
      return false;
    }
    return true;
  };

  const handleSendLead = async () => {
    if (!requireAuth()) return;
    if (!leadMessage.trim()) return;
    setSubmitting(true);
    try {
      const result = await LeadsService.createLead(deal.id, leadMessage);
      setLeadSent(true);
      setLeadId(result.id);
      setShowLeadForm(false);
    } catch {
      alert('Erro ao enviar manifestação de interesse.');
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
    } catch {
      alert('Erro ao enviar proposta.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFavorite = async () => {
    if (!requireAuth()) return;
    try {
      const res = await ListingsService.toggleFavorite(deal.id);
      alert(res.favorited ? 'Adicionado aos favoritos!' : 'Removido dos favoritos.');
    } catch {
      alert('Erro ao atualizar favoritos.');
    }
  };

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-100">
      <PublicHeader />

      {loading ? (
         <div className="pt-32 max-w-4xl mx-auto px-6 h-screen flex flex-col gap-4">
             <div className="h-10 bg-slate-800 rounded animate-pulse w-3/4"></div>
             <div className="h-64 bg-slate-800 rounded animate-pulse w-full mt-4"></div>
         </div>
      ) : deal ? (
         <>
         <div className="pt-32 pb-12 bg-slate-900 border-b border-slate-800">
           <div className="max-w-4xl mx-auto px-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700 mb-4">
                 {deal.category?.name || 'Mercado M&A'}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400 leading-tight">
                {deal.title}
              </h1>
           </div>
         </div>

         <div className="max-w-4xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
           
           {/* Conteúdo Dossiê */}
           <div className="md:col-span-2 space-y-8">
              <section className="glass-panel p-8 rounded-2xl space-y-4">
                 <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Info size={20} className="text-blue-500"/> Visão Executiva (Tese)
                 </h2>
                 <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                   {deal.description}
                 </p>
              </section>

              <section className="bg-slate-800/20 p-6 rounded-2xl border border-blue-500/10 flex items-start gap-4">
                 <ShieldCheck className="text-blue-500 shrink-0 mt-1" size={24} />
                 <div>
                    <h3 className="font-semibold text-slate-200">Ambiente de Deal Protegido</h3>
                    <p className="text-sm text-slate-400 mt-1">Essa operação encontra-se sob manto NDA inicial. Para visualizar documentos sensíveis de balanço (DREs) ou nome explícito da razão social, inicie um contato solicitando liberação no Data Room.</p>
                 </div>
              </section>

              {/* Lead Form Expandido */}
              {showLeadForm && (
                <section className="glass-panel p-6 rounded-2xl border-l-4 border-l-blue-500 space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                  <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                    <Send size={18} className="text-blue-400" /> Manifestar Interesse
                  </h3>
                  <textarea
                    value={leadMessage}
                    onChange={(e) => setLeadMessage(e.target.value)}
                    placeholder="Gostaria de saber mais sobre esta oportunidade. Minha empresa atua no setor..."
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-slate-200 placeholder-slate-500 outline-none focus:border-blue-500/50 min-h-[120px] resize-y"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleSendLead}
                      disabled={submitting || !leadMessage.trim()}
                      className="btn-primary flex items-center gap-2 disabled:opacity-50"
                    >
                      <Send size={16} /> {submitting ? 'Enviando...' : 'Enviar Manifestação'}
                    </button>
                    <button
                      onClick={() => setShowLeadForm(false)}
                      className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </section>
              )}

              {/* Proposal Form */}
              {showProposalForm && leadId && (
                <section className="glass-panel p-6 rounded-2xl border-l-4 border-l-emerald-500 space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                  <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                    <DollarSign size={18} className="text-emerald-400" /> Enviar Proposta Formal
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-400 block mb-1">Valor Ofertado (R$)</label>
                      <input
                        type="number"
                        value={proposalValue}
                        onChange={(e) => setProposalValue(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500/50 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 block mb-1">Condições (opcional)</label>
                      <input
                        type="text"
                        value={proposalConditions}
                        onChange={(e) => setProposalConditions(e.target.value)}
                        placeholder="Due diligence prévia..."
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleSendProposal}
                      disabled={submitting || !proposalValue}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-5 py-2.5 font-medium flex items-center gap-2 transition disabled:opacity-50"
                    >
                      <DollarSign size={16} /> {submitting ? 'Enviando...' : 'Submeter Proposta'}
                    </button>
                    <button
                      onClick={() => setShowProposalForm(false)}
                      className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </section>
              )}

              {/* Success States */}
              {leadSent && !proposalSent && (
                <div className="bg-blue-500/10 border border-blue-500/20 text-blue-300 p-4 rounded-xl text-sm">
                  ✅ Interesse manifestado com sucesso! O vendedor será notificado. Você pode agora enviar uma proposta formal.
                </div>
              )}
              {proposalSent && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-4 rounded-xl text-sm">
                  ✅ Proposta enviada com sucesso! Acompanhe o status no seu Dashboard.
                </div>
              )}
           </div>

           {/* Call To Action Sidebar (Sticky) */}
           <div className="md:col-span-1">
             <div className="glass-panel p-6 rounded-2xl sticky top-28 border-t-4 border-t-blue-500 space-y-4">
                <p className="text-sm text-slate-400 font-medium tracking-wide">VALUATION ESTIMADO</p>
                <p className="text-3xl font-mono font-bold text-slate-100">
                   R$ {(deal.price || 0).toLocaleString('pt-BR')}
                </p>
                
                <div className="w-full h-px bg-slate-800"></div>

                <div className="text-sm text-slate-400 space-y-2">
                   <p><span className="text-slate-500">Origem:</span> {deal.tenant?.name || 'Seller Anônimo'}</p>
                   <p><span className="text-slate-500">Status:</span> Ativo & Auditado</p>
                </div>

                <div className="space-y-3 pt-2">
                  {/* Manifestar Interesse */}
                  {!leadSent ? (
                    <button 
                      onClick={() => { if (requireAuth()) setShowLeadForm(true); }}
                      className="w-full btn-primary flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={18}/> Manifestar Interesse
                      {!isAuthenticated && <span className="text-xs text-blue-200/50 ml-1">(Login)</span>}
                    </button>
                  ) : !proposalSent ? (
                    <button
                      onClick={() => setShowProposalForm(true)}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-5 py-3 font-medium flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20"
                    >
                      <DollarSign size={18}/> Enviar Proposta
                    </button>
                  ) : (
                    <div className="text-center text-emerald-400 text-sm font-medium py-3">
                      ✅ Proposta Enviada
                    </div>
                  )}

                  {/* Favoritar */}
                  <button
                    onClick={handleFavorite}
                    className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800/50 hover:text-rose-400 transition text-sm"
                  >
                    <Heart size={16} /> Favoritar
                  </button>
                </div>
             </div>
           </div>
         </div>

         {/* Deals Similares */}
         <SimilarDeals dealId={deal.id} />
         </>
      ) : (
         <div className="pt-32 text-center text-slate-500">Deal não encontrado ou indisponível.</div>
      )}
    </main>
  );
}

function SimilarDeals({ dealId }: { dealId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [similar, setSimilar] = useState<any[]>([]);

  useEffect(() => {
    ListingsService.getSimilar(dealId).then(setSimilar).catch(() => setSimilar([]));
  }, [dealId]);

  if (similar.length === 0) return null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 border-t border-slate-800">
      <h2 className="text-xl font-semibold text-slate-200 mb-6">Oportunidades Similares</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {similar.map((item) => (
          <Link href={`/deals/${item.slug || item.id}`} key={item.id} className="group">
            <div className="glass-panel rounded-xl p-4 hover:border-blue-500/40 transition-all h-full">
              <span className="text-xs text-slate-500 font-medium">{item.category?.name || 'M&A'}</span>
              <h3 className="text-sm font-medium text-slate-200 mt-1.5 line-clamp-2 group-hover:text-blue-400 transition-colors">{item.title}</h3>
              <p className="font-mono text-sm text-slate-400 mt-2">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(Number(item.price || 0))}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
