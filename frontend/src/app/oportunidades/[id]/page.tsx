'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  MapPin, 
  Star, 
  Calendar, 
  CheckCircle, 
  Info, 
  ChevronRight, 
  ShieldCheck, 
  TrendingUp, 
  BarChart3, 
  Users, 
  Zap, 
  Award, 
  ArrowRight, 
  Share2, 
  Bookmark, 
  MessageCircle, 
  FileText, 
  Loader2 
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthProvider';
import { ListingsService } from '@/services/ListingsService';
import { LeadInterestModal } from '@/components/opportunities/LeadInterestModal';
import { Header as PublicHeader } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { DataRoomSection } from '@/components/deals/DataRoomSection';
import { BuyingSellingAdTemplate } from '@/components/opportunities/BuyingSellingAdTemplate';

// Types (assuming they are defined or can be inferred)
interface Listing {
  id: string;
  title: string;
  category?: { name: string };
  city: string;
  state: string;
  createdAt: string;
  price: string;
  logoUrl?: string;
  revenue?: string;
  ebitda?: string;
  employeesCount?: string;
  description: string;
  features?: { name: string }[];
  matchScore?: number;
  company?: {
    name: string;
    isVerified: boolean;
    trustScore?: string;
    responseRate?: number;
    responseTime?: string;
    yearsActive?: number;
    dealsCount?: number;
    bio?: string;
  };
}

function MetricCard({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-2">
      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
        <Icon className="w-4 h-4 text-[#00b8b2]" />
      </div>
      <div>
        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-base font-semibold text-white tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function SectionHeading({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) {
  return (
    <div className="space-y-1.5 mb-4">
      <div className="flex items-center gap-2.5">
        <Icon className="w-4 h-4 text-[#00b8b2]" />
        <h3 className="text-sm font-semibold text-white uppercase tracking-widest">{title}</h3>
      </div>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const id = params.id as string;

  const [listing, setListing] = useState<Listing | null>(null);
  const [similarOpportunities, setSimilarOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadObjective, setLeadObjective] = useState<'Demonstração de Interesse' | 'Solicitação de Análise'>('Demonstração de Interesse');

  useEffect(() => {
    async function fetchDetail() {
      // Suporte para modo demo
      if (id === 'demo') {
        setListing({
          id: 'demo-123',
          title: 'SaaS de Logística Inteligente - Expansão Global',
          subtitle: 'Empresa SaaS High-Growth',
          description: 'Esta é uma oportunidade de investimento em um SaaS de logística que utiliza IA para otimização de rotas. Com mais de 200 clientes ativos, a plataforma apresenta escala global.',
          price: 15000000,
          annualRevenue: 4200000,
          ebitda: 840000,
          ebitdaMargin: 20,
          category: { name: 'Compra e Venda de Empresas' },
          subcategory: { name: 'Venda de Empresa' },
          city: 'São Paulo',
          state: 'SP',
          createdAt: new Date().toISOString(),
          operationStructure: 'Venda de 100% das Cotas',
          verified: true,
          company: {
            name: 'NexCapital Tech',
            isVerified: true
          }
        } as any);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Lógica inteligente: Se parece UUID busca por ID, senão por Slug
        const isUuid = id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
        
        const data = isUuid 
          ? await ListingsService.getListingById(id)
          : await ListingsService.getListingBySlug(id);
          
        setListing(data);
        
        // Buscar similares
        const similar = await ListingsService.getSimilar(data.id);
        setSimilarOpportunities(similar);

        // Se logado, verificar se está nos favoritos
        if (isAuthenticated) {
          const favorites = await ListingsService.getMyFavorites();
          const isFav = favorites.some((f: any) => f.id === data.id);
          setIsFavorited(isFav);
        }
      } catch (err) {
        setError('Não foi possível carregar os detalhes desta oportunidade.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id, isAuthenticated]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      router.push(`/login?callback=/oportunidades/${id}`);
      return;
    }
    if (!listing) return;
    
    try {
      const { favorited } = await ListingsService.toggleFavorite(listing.id);
      setIsFavorited(favorited);
    } catch (err) {
      console.error('Erro ao favoritar:', err);
    }
  };

  const handleFilterRedirect = (filters: any) => {
    // Redireciona para /oportunidades com os filtros aplicados na sidebar
    const params = new URLSearchParams();
    if (filters.search) params.set('q', filters.search);
    if (filters.category) params.set('category', filters.category);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.state) params.set('state', filters.state);
    
    router.push(`/oportunidades?${params.toString()}`);
  };

  const handleOpenLeadModal = (objective: 'Demonstração de Interesse' | 'Solicitação de Análise') => {
    if (!isAuthenticated) {
      // Redireciona para login com callback para voltar para esta página
      router.push(`/login?callback=/oportunidades/${id}`);
      return;
    }
    setLeadObjective(objective);
    setIsLeadModalOpen(true);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020617] text-white">
        <PublicHeader />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-[#00b8b2] animate-spin mb-3" />
          <p className="text-gray-500 text-sm">Consultando ativos estratégicos...</p>
        </div>
        <Footer />
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
          <Link href="/oportunidades" className="bg-[#00b8b2] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#0e8a87] transition-all inline-block">
            Voltar para o Hub
          </Link>
        </div>
      </main>
    );
  }

  // REGRA DE RENDERIZAÇÃO: Categoria "Compra e Venda de Empresas" e subcategorias relacionadas
  const categoryName = listing.category?.name?.toLowerCase() || '';
  const isBuyingSellingCategory = 
    categoryName.includes('compra e venda') || 
    categoryName.includes('venda de empresas') || 
    categoryName.includes('compra de empresas') || 
    categoryName.includes('venda de empresa') || 
    categoryName.includes('compra de empresa') || 
    categoryName.includes('sociedades') || 
    categoryName.includes('arrendamento');

  if (isBuyingSellingCategory) {
    return (
      <>
        <PublicHeader />
        <BuyingSellingAdTemplate 
          listing={listing}
          similarOpportunities={similarOpportunities}
          onInterest={() => handleOpenLeadModal('Demonstração de Interesse')}
          onFavorite={handleToggleFavorite}
          isFavorited={isFavorited}
          onFilterChange={handleFilterRedirect}
        />
        <LeadInterestModal 
          isOpen={isLeadModalOpen}
          onClose={() => setIsLeadModalOpen(false)}
          listing={listing}
        />
        <Footer />
      </>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] text-gray-300 selection:bg-[#00b8b2]/30">
      <PublicHeader />

      {/* Hero Section */}
      <div className="pt-24 pb-10 bg-gradient-to-b from-[#020617] to-transparent relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#00b8b2]/4 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-gray-600 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Início</Link>
            <ChevronRight size={12} />
            <Link href="/oportunidades" className="hover:text-white transition-colors">Oportunidades</Link>
            <ChevronRight size={12} />
            <span className="text-[#00b8b2]">Detalhe do Negócio</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Header Content */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className="bg-[#00b8b2]/10 border border-[#00b8b2]/20 text-[#00b8b2] text-[10px] font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider">
                  {listing.category?.name || 'Oportunidade'}
                </span>
                {listing.company?.isVerified && (
                  <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider">
                    <CheckCircle className="w-3 h-3" />
                    Parceiro Verificado
                  </div>
                )}
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 text-gray-500 text-[10px] font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider">
                  ID: #{listing.id.slice(0, 8)}
                </div>
              </div>

              <h1 className="text-2xl md:text-4xl font-bold text-white leading-[1.15] tracking-tight">
                {listing.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <MapPin className="text-[#00b8b2]" size={13} />
                  {listing.city}, {listing.state || 'Brasil'}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="text-gray-600" size={13} />
                  {new Date(listing.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="text-blue-500/70" size={13} />
                  Validado pela Finanhub
                </div>
              </div>
            </div>

            {/* Price Snapshot (Desktop) */}
            <div className="lg:col-span-4 hidden lg:flex flex-col items-end justify-end pb-2">
               <div className="text-right">
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mb-1.5">Valor Estimado</p>
                  <p className="text-3xl font-bold text-white tracking-tight">
                    {listing.price ? `R$ ${Number(listing.price).toLocaleString('pt-BR')}` : 'Sob consulta'}
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Gallery Mock (Premium Layout) */}
            <div className="group relative aspect-[16/9] rounded-2xl overflow-hidden border border-white/5 bg-white/5">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
              <img 
                src={listing.logoUrl || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"} 
                className="w-full h-full object-cover grayscale-[0.2] transition-transform duration-700 group-hover:scale-105"
                alt="Opportunity Image"
              />
              <div className="absolute bottom-8 right-8 z-20 flex gap-2">
                <button className="bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-full hover:bg-[#00b8b2] transition-all">
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
                value={listing.revenue || "Sob consulta"} 
                icon={TrendingUp} 
              />
              <MetricCard 
                label="EBITDA" 
                value={listing.ebitda || "Sob consulta"} 
                icon={BarChart3} 
              />
              <MetricCard 
                label="Equipe / Operação" 
                value={listing.employeesCount || "Sob consulta"} 
                icon={Users} 
              />
            </section>

            {/* Vision Overview */}
            <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8 space-y-5">
              <SectionHeading 
                icon={Info} 
                title="Visão Geral do Negócio" 
                subtitle="Resumo executivo e tese de investimento condensada."
              />
              <div className="prose prose-invert prose-teal max-w-none">
                <p className="text-sm leading-relaxed text-gray-400">
                  {listing.description}
                </p>
              </div>
            </section>

            {/* Strategic Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <section>
                 <SectionHeading icon={Zap} title="Diferenciais Competitivos" />
                 <ul className="space-y-3">
                    {listing.features && listing.features.length > 0 ? (
                      listing.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-gray-400">
                          <CheckCircle size={14} className="text-[#00b8b2] mt-0.5 flex-shrink-0" />
                          {feature.name}
                        </li>
                      ))
                    ) : (
                      <>
                        <li className="flex items-start gap-2.5 text-sm text-gray-400">
                          <CheckCircle size={14} className="text-[#00b8b2] mt-0.5 flex-shrink-0" />
                          Modelo de negócio consolidado e escalável
                        </li>
                        <li className="flex items-start gap-2.5 text-sm text-gray-400">
                          <CheckCircle size={14} className="text-[#00b8b2] mt-0.5 flex-shrink-0" />
                          Baixa dependência operacional dos sócios
                        </li>
                      </>
                    )}
                 </ul>
               </section>

               <section>
                 <SectionHeading icon={Award} title="Potencial de Crescimento" />
                 <p className="text-sm leading-relaxed text-gray-500">
                    O negócio apresenta alta capilaridade para expansão nacional através de novos canais de distribuição {listing.category?.name ? `no setor de ${listing.category.name}` : ''}. ROI otimizado e base tecnológica pronta para escala.
                 </p>
               </section>
            </div>

            {/* Data Room Section */}
            <DataRoomSection listingId={listing.id} />

            {/* Strategic Footer Warning */}
            <div className="bg-white/[0.015] border border-white/[0.06] rounded-xl p-4 flex items-start gap-3">
              <ShieldCheck className="text-blue-400/60 mt-0.5 flex-shrink-0" size={15} />
              <div>
                <h4 className="text-[10px] font-semibold text-white/60 uppercase tracking-widest mb-1">Intermediação Segura</h4>
                <p className="text-[10px] text-gray-600 leading-relaxed">
                  Toda comunicação é monitorada e protegida. Dados confidenciais são liberados apenas após validação mútua. Nunca transfira valores fora do ecossistema Finanhub.
                </p>
              </div>
            </div>

          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-6">

            {/* Main Action Sidebar */}
            <div className="sticky top-24 space-y-5">

              {/* Financial Control Box */}
              <div className="bg-[#00b8b2]/5 border border-[#00b8b2]/20 rounded-2xl p-5 space-y-5 backdrop-blur-md">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">Atratividade</span>
                    <span className="text-[10px] font-semibold text-[#00b8b2] tabular-nums">Score {listing.matchScore || '8.5'}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#00b8b2]" style={{ width: `${listing.matchScore || 85}%` }} />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={() => handleOpenLeadModal('Demonstração de Interesse')}
                    className="w-full bg-[#00b8b2] hover:bg-[#0e8a87] text-white py-3.5 rounded-xl font-semibold text-xs uppercase tracking-wider shadow-lg shadow-[#00b8b2]/15 transition-all flex items-center justify-center gap-2.5"
                  >
                    <MessageCircle size={18} />
                    Demonstrar Interesse
                  </button>
                  <button
                    onClick={() => handleOpenLeadModal('Solicitação de Análise')}
                    className="w-full bg-white/5 hover:bg-white/10 text-white py-3.5 rounded-xl font-semibold text-xs uppercase tracking-wider border border-white/10 transition-all flex items-center justify-center gap-2.5"
                  >
                    <FileText size={18} />
                    Solicitar Análise
                  </button>
                </div>

                <div className="pt-3 border-t border-white/5 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-500 uppercase tracking-wider font-medium">Localização</span>
                    <span className="text-white font-medium">{listing.city}, {listing.state}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-500 uppercase tracking-wider font-medium">Setor</span>
                    <span className="text-white font-medium">{listing.category?.name}</span>
                  </div>
                </div>
              </div>

              {/* Advertiser Reputation Block */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-base font-bold text-white border border-white/10">
                    {listing.company?.name ? listing.company.name.charAt(0) : "A"}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white leading-tight">{listing.company?.name || "Anunciante Privado"}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle size={11} className="text-[#00b8b2]" />
                      <span className="text-[9px] font-medium text-[#00b8b2] uppercase tracking-widest">Parceiro Verificado</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-medium text-gray-600 uppercase tracking-widest">Confiança</p>
                    <p className="text-xs font-semibold text-white">
                      {listing.company?.trustScore ? `Excelente (${listing.company.trustScore})` : 'Nível Alpha'}
                    </p>
                  </div>
                  <div className="space-y-0.5 text-right">
                    <p className="text-[9px] font-medium text-gray-600 uppercase tracking-widest">Taxa Resp.</p>
                    <p className="text-xs font-semibold text-emerald-500">
                      {listing.company?.responseRate ? `${listing.company.responseRate}%` : '95%+'} {listing.company?.responseTime ? `em ${listing.company.responseTime}` : 'em 2h'}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-medium text-gray-600 uppercase tracking-widest">Atuação</p>
                    <p className="text-xs font-semibold text-white">
                      {listing.company?.yearsActive ? `${listing.company.yearsActive} anos+` : 'Consolidada'}
                    </p>
                  </div>
                  <div className="space-y-0.5 text-right">
                    <p className="text-[9px] font-medium text-gray-600 uppercase tracking-widest">Anúncios</p>
                    <p className="text-xs font-semibold text-white">
                      {listing.company?.dealsCount ? `${listing.company.dealsCount} publicados` : 'Múltiplos ativos'}
                    </p>
                  </div>
                </div>

                <div className="border-l-2 border-[#00b8b2]/20 pl-3">
                  <p className="text-[10px] text-gray-600 italic leading-relaxed">
                    "{listing.company?.bio || 'Membro do ecossistema Finanhub com histórico validado de transações estratégicas.'}"
                  </p>
                </div>

                <button className="w-full text-[10px] font-medium text-gray-500 hover:text-[#00b8b2] uppercase tracking-widest transition-colors">
                  Ver Perfil de Negócios
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Similar Opportunities */}
      <SimilarOpportunitiesSection currentId={listing.id} />

      {/* Lead Modal */}
      <LeadInterestModal 
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        listing={listing}
      />
      <Footer />
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
    <section className="bg-white/[0.01] border-t border-white/5 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">Oportunidades Sugeridas</h2>
            <p className="text-gray-500 text-sm">Teses de investimento similares em sua região ou setor.</p>
          </div>
          <Link href="/oportunidades" className="text-xs font-medium text-[#12b3af] uppercase tracking-widest flex items-center gap-1.5 group hover:text-white transition-colors">
            Ver Todas
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {similar.slice(0, 3).map((item) => (
            <Link key={item.id} href={`/oportunidades/${item.id}`} className="group">
               <div className="bg-white/5 border border-white/10 rounded-2xl p-5 h-full transition-all hover:bg-white/10 hover:border-[#12b3af]/20">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{item.category?.name || 'Mercado'}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-[#12b3af] transition-colors mb-4 line-clamp-2">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-sm font-semibold text-[#12b3af]">
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
