'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PublicHeader } from "@/components/layout/PublicHeader";
import { ListingsService } from '@/services/ListingsService';
import { 
  MessageCircle, 
  Info, 
  DollarSign, 
  Heart, 
  ShieldCheck, 
  MapPin, 
  Briefcase,
  TrendingUp,
  FileText,
  Lock,
  ArrowRight,
  CheckCircle,
  Users,
  Award,
  Zap,
  BarChart3,
  Calendar,
  ChevronRight,
  Share2,
  Bookmark,
  ChevronLeft,
  Loader2
} from 'lucide-react';
import { DataRoomSection } from '@/components/deals/DataRoomSection';
import { useAuth } from '@/features/auth/AuthProvider';
import Link from 'next/link';
import { Listing } from '@shared/contracts';

// ─── Sub-Components ──────────────────────────────────────────────────────────

const SectionHeading = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle?: string }) => (
  <div className="flex flex-col gap-1 mb-6">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-[#12b3af]/10 border border-[#12b3af]/20 flex items-center justify-center text-[#12b3af]">
        <Icon size={20} />
      </div>
      <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
    </div>
    {subtitle && <p className="text-gray-500 text-sm ml-13">{subtitle}</p>}
  </div>
);

const MetricCard = ({ label, value, icon: Icon }: { label: string, value: string, icon: any }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 transition-all hover:border-[#12b3af]/30 group">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-[#12b3af] transition-colors">
        <Icon size={16} />
      </div>
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
    </div>
    <div className="text-xl font-bold text-white tracking-tight">{value}</div>
  </div>
);

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const id = params.id as string;

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetail() {
      try {
        setLoading(true);
        const data = await ListingsService.getListingById(id);
        setListing(data);
      } catch (err) {
        setError('Não foi possível carregar os detalhes desta oportunidade.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#12b3af] animate-spin mb-4" />
        <p className="text-gray-400 font-medium animate-pulse">Consultando ativos estratégicos...</p>
      </main>
    );
  }

  if (error || !listing) {
    return (
      <main className="min-h-screen bg-[#020617] text-white">
        <PublicHeader />
        <div className="pt-40 text-center px-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 mb-6">
            <Info size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-4">{error || 'Oportunidade não encontrada'}</h1>
          <Link href="/oportunidades" className="bg-[#12b3af] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#0e8a87] transition-all inline-block">
            Voltar para o Hub
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] text-gray-300 selection:bg-[#12b3af]/30">
      <PublicHeader />

      {/* Hero Section */}
      <div className="pt-32 pb-16 bg-gradient-to-b from-[#020617] to-transparent relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#12b3af]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-8">
            <Link href="/" className="hover:text-white transition-colors">Início</Link>
            <ChevronRight size={12} />
            <Link href="/oportunidades" className="hover:text-white transition-colors">Oportunidades</Link>
            <ChevronRight size={12} />
            <span className="text-[#12b3af]">Detalhe do Negócio</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Header Content */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex flex-wrap gap-3">
                <span className="bg-[#12b3af]/10 border border-[#12b3af]/20 text-[#12b3af] text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-[2px]">
                  {listing.category?.name || 'Oportunidade'}
                </span>
                {listing.company?.isVerified && (
                  <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-[2px]">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Parceiro Verificado
                  </div>
                )}
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 text-gray-400 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-[2px]">
                  ID: #{listing.id.slice(0, 8)}
                </div>
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
                {listing.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-gray-500">
                <div className="flex items-center gap-2">
                  <MapPin className="text-[#12b3af]" size={18} />
                  {listing.city}, {listing.state || 'Brasil'}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="text-gray-600" size={18} />
                  Publicado em {new Date(listing.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="text-blue-500" size={18} />
                  Anúncio Validado pela Finanhub
                </div>
              </div>
            </div>

            {/* Price Snapshot (Desktop) */}
            <div className="lg:col-span-4 hidden lg:flex flex-col items-end justify-end pb-2">
               <div className="text-right">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[3px] mb-2">Valor Estimado</p>
                  <p className="text-5xl font-black text-white tracking-tighter">
                    {listing.price ? `R$ ${Number(listing.price).toLocaleString('pt-BR')}` : 'Sob consulta'}
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* Gallery Mock (Premium Layout) */}
            <div className="group relative aspect-[16/9] rounded-[32px] overflow-hidden border border-white/5 bg-white/5">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
              <img 
                src={listing.logoUrl || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"} 
                className="w-full h-full object-cover grayscale-[0.2] transition-transform duration-700 group-hover:scale-105"
                alt="Opportunity Image"
              />
              <div className="absolute bottom-8 right-8 z-20 flex gap-2">
                <button className="bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-full hover:bg-[#12b3af] transition-all">
                  <Share2 size={20} className="text-white" />
                </button>
                <button className="bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-full hover:bg-rose-500 transition-all">
                  <Bookmark size={20} className="text-white" />
                </button>
              </div>
            </div>

            {/* Financial Highlights */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MetricCard 
                label="Faturamento Anual" 
                value={listing.revenue || "R$ 12M+ / ano"} 
                icon={TrendingUp} 
              />
              <MetricCard 
                label="EBITDA" 
                value={listing.ebitda || "R$ 2.4M (20%)"} 
                icon={BarChart3} 
              />
              <MetricCard 
                label="Quadro de Funcionários" 
                value={listing.employeesCount || "15 - 25 colaboradores"} 
                icon={Users} 
              />
            </section>

            {/* Vision Overview */}
            <section className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 md:p-12 space-y-8">
              <SectionHeading 
                icon={Info} 
                title="Visão Geral do Negócio" 
                subtitle="Resumo executivo e tese de investimento condensada."
              />
              <div className="prose prose-invert prose-teal max-w-none">
                <p className="text-lg leading-relaxed text-gray-400 font-medium">
                  {listing.description}
                </p>
                {/* Additional content could be added here if available in the model */}
              </div>
            </section>

            {/* Strategic Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <section>
                 <SectionHeading icon={Zap} title="Diferenciais Competitivos" />
                 <ul className="space-y-4">
                    {[
                      "Modelo de receita recorrente consolidado",
                      "Baixa dependência do fundador",
                      "Carteira de clientes pulverizada",
                      "Tecnologia proprietária escalável"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm font-medium text-gray-400">
                        <CheckCircle size={16} className="text-[#12b3af] mt-0.5" />
                        {item}
                      </li>
                    ))}
                 </ul>
               </section>

               <section>
                 <SectionHeading icon={Award} title="Potencial de Crescimento" />
                 <p className="text-sm font-medium leading-loose text-gray-500">
                    O negócio apresenta alta capilaridade para expansão em regiões não atendidas através do modelo de licenciamento de marca, com ROI estimado em 18 meses para novas unidades operacionais.
                 </p>
               </section>
            </div>

            {/* Data Room Section */}
            <DataRoomSection listingId={listing.id} />

            {/* Strategic Footer Warning */}
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-6 flex items-start gap-4">
              <ShieldCheck className="text-blue-500 mt-1" />
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-1">Nota de Intermediação Segura</h4>
                <p className="text-[10px] text-gray-500 font-bold leading-normal uppercase tracking-tight">
                  Toda a comunicação nesta plataforma é monitorada e protegida. A liberação de dados confidenciais ocorre apenas após a validação mútua de interesses. Jamais transfira valores fora do ecossistema Finanhub.
                </p>
              </div>
            </div>

          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Main Action Sidebar */}
            <div className="sticky top-32 space-y-6">
              
              {/* Financial Control Box */}
              <div className="bg-[#12b3af]/5 border border-[#12b3af]/20 rounded-[32px] p-8 space-y-8 backdrop-blur-md">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Atratividade</span>
                    <span className="text-[10px] font-black text-[#12b3af] uppercase tracking-widest">Score AI: 9.4</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#12b3af] w-[94%]" />
                  </div>
                </div>

                <div className="space-y-4">
                  <button className="w-full bg-[#12b3af] hover:bg-[#0e8a87] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[2px] shadow-xl shadow-[#12b3af]/20 transition-all flex items-center justify-center gap-3">
                    <MessageCircle size={18} />
                    Demonstrar Interesse
                  </button>
                  <button className="w-full bg-white/5 hover:bg-white/10 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[2px] border border-white/5 transition-all flex items-center justify-center gap-3">
                    <FileText size={18} />
                    Solicitar Análise
                  </button>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-4">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-gray-500 uppercase tracking-widest">Localização</span>
                    <span className="text-white">{listing.city}, {listing.state}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-gray-500 uppercase tracking-widest">Setor</span>
                    <span className="text-white">{listing.category?.name}</span>
                  </div>
                </div>
              </div>

              {/* Advertiser Reputation Block */}
              <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xl font-black text-white border border-white/10">
                    {listing.company?.name ? listing.company.name.charAt(0) : "A"}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight">{listing.company?.name || "Anunciante Privado"}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle size={12} className="text-[#12b3af]" />
                      <span className="text-[9px] font-black text-[#12b3af] uppercase tracking-widest italic">Parceiro Verificado</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Confiança</p>
                    <p className="text-xs font-bold text-white">Excelente (9.8)</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Taxa Resp.</p>
                    <p className="text-xs font-bold text-emerald-500">92% em 2h</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Atuação</p>
                    <p className="text-xs font-bold text-white">8 anos+</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Anúncios</p>
                    <p className="text-xs font-bold text-white">12 publicados</p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                   <p className="text-[10px] text-gray-500 font-bold italic leading-relaxed text-center">
                     "Investidor focado em Tech e Health. Histórico limpo em 4 transações intermediadas via Finanhub."
                   </p>
                </div>

                <button className="w-full text-[10px] font-black text-gray-500 hover:text-[#12b3af] uppercase tracking-[2px] transition-colors">
                  Ver Perfil de Negócios
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Similar Opportunities */}
      <SimilarOpportunitiesSection currentId={listing.id} />
    </main>
  );
}

function SimilarOpportunitiesSection({ currentId }: { currentId: string }) {
  const [similar, setSimilar] = useState<Listing[]>([]);

  useEffect(() => {
    ListingsService.getSimilar(currentId).then(setSimilar).catch(() => {});
  }, [currentId]);

  if (similar.length === 0) return null;

  return (
    <section className="bg-white/[0.01] border-t border-white/5 py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-extrabold text-white mb-2">Oportunidades Sugeridas</h2>
            <p className="text-gray-500 font-medium">Teses de investimento similares em sua região ou setor.</p>
          </div>
          <Link href="/oportunidades" className="text-sm font-black text-[#12b3af] uppercase tracking-[2px] flex items-center gap-2 group">
            Ver Todas
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {similar.slice(0, 3).map((item) => (
            <Link key={item.id} href={`/oportunidades/${item.id}`} className="group">
               <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 h-full transition-all hover:bg-white/10 hover:border-[#12b3af]/20">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{item.category?.name || 'Mercado'}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-[#12b3af] transition-colors mb-6 line-clamp-2">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <span className="text-lg font-black text-[#12b3af]">
                      {item.price ? `R$ ${Number(item.price).toLocaleString('pt-BR')}` : 'Sob consulta'}
                    </span>
                    <ArrowRight size={20} className="text-gray-700 group-hover:text-[#12b3af] transition-all" />
                  </div>
               </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
