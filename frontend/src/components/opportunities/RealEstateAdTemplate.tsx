'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  MapPin, 
  Building, 
  Maximize, 
  Zap, 
  Truck, 
  ParkingCircle, 
  Hammer, 
  Coins,
  ShieldCheck,
  Info,
  ArrowRight,
  TrendingUp,
  Layers,
  HelpCircle
} from 'lucide-react';
import { OpportunitySidebar } from '@/components/opportunities/OpportunitySidebar';
import { OpportunityCard } from '@/components/opportunities/OpportunityCard';
import { RealEstateSummarySidebar } from './RealEstateSummarySidebar';
import { ListingImage } from '../common/ListingImage';
import styles from '@/styles/fh-ad-detail.module.css';

interface RealEstateAdTemplateProps {
  listing: any;
  similarOpportunities: any[];
  onInterest: () => void;
  onFavorite: () => void;
  isFavorited?: boolean;
  onFilterChange?: (filters: any) => void;
}

const ContentSection = ({ icon: Icon, title, tag, children }: { icon: any, title: string, tag?: string, children: React.ReactNode }) => (
  <section className={styles.sectionBlock}>
    <div className={styles.sectionHeader}>
      <div className="flex items-center gap-4">
        <Icon className={styles.icon} size={20} />
        <h3 className={styles.sectionTitle}>{title}</h3>
      </div>
      {tag && <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-[#d6e1ef] font-bold uppercase tracking-widest">{tag}</span>}
    </div>
    <div className={styles.sectionContent}>
      {children}
    </div>
  </section>
);

export const RealEstateAdTemplate: React.FC<RealEstateAdTemplateProps> = ({
  listing,
  similarOpportunities,
  onInterest,
  onFavorite,
  isFavorited,
  onFilterChange
}) => {
  const getAttr = (name: string) => {
    const attr = listing.attrValues?.find((av: any) => av.attribute?.name === name || av.attributeName === name || av.name === name);
    return attr?.valueStr || attr?.valueNum?.toString() || '';
  };

  // Extract real attributes
  const propertyType = getAttr('propertyType');
  const zoning = getAttr('zoning');
  const totalArea = getAttr('totalArea');
  const builtArea = getAttr('builtArea');
  const parkingSpaces = getAttr('parkingSpaces');
  const infrastructureLevel = getAttr('infrastructureLevel');
  const strategicValue = getAttr('strategicValue');
  const physicalStructure = getAttr('physicalStructure');
  const logisticsNote = getAttr('logisticsNote');
  const adaptationPossible = getAttr('adaptationPossible');
  const negotiationTerms = getAttr('negotiationTerms');
  const availability = getAttr('availability');
  const idealPurpose = getAttr('idealPurpose');

  // Breadcrumbs
  const breadcrumbs = [
    { label: 'Início', href: '/' },
    { label: 'Oportunidades', href: '/oportunidades' },
    { label: 'Imóveis para Negócios', href: `/oportunidades?category=${listing.categoryId}` },
    { label: listing.title, active: true }
  ];

  // Chips
  const tags = [
    listing.propertyType || 'Comercial / Industrial',
    listing.totalArea ? `${listing.totalArea} m²` : 'Área Consultar',
    listing.city + ', ' + listing.state,
    listing.isRental ? 'Locação Corporativa' : 'Venda de Ativo'
  ];

  return (
    <div className={styles.fhDetailWrapper}>
      <div className={styles.glowTeal} />
      
      <main className={styles.mainLayout}>
        {/* Coluna 1: Filtro Lateral */}
        <div className={styles.filterColumn}>
          <div className={styles.filterCard}>
            <OpportunitySidebar onFilterChange={onFilterChange} />
          </div>
          
          <div className="mt-4 p-5 rounded-[22px] bg-gradient-to-b from-[#00b8b2]/10 to-transparent border border-[#00b8b2]/15">
             <p className="text-[13px] text-[#dde9f6] leading-relaxed font-medium">
               Análise de zoneamento personalizada? Consultoria via Concierge Finanhub.
             </p>
          </div>
        </div>

        {/* Coluna 2: Conteúdo Principal */}
        <div className={styles.contentCol}>
          {/* Breadcrumbs */}
          <nav className={styles.breadcrumbs}>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {crumb.active ? (
                  <span className={styles.active}>{crumb.label}</span>
                ) : (
                  <Link href={crumb.href!}>{crumb.label}</Link>
                )}
                {index < breadcrumbs.length - 1 && (
                  <span className={styles.separator}>
                    <ChevronRight size={12} />
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* Hero Section */}
          <div className={styles.hero}>
            <span className={styles.categoryBadge}>Imóveis para Negócios</span>
            <h1>{listing.title}</h1>
            
            <p className="text-[#cfd8e6] text-base mb-6 max-w-[920px]">
              {listing.description ? (listing.description.length > 200 ? `${listing.description.substring(0, 200)}...` : listing.description) : 'Memorial descritivo estratégico em fase de auditoria final.'}
            </p>

            <div className={styles.chipsContainer}>
              <span className={styles.chip}>{propertyType || 'Comercial / Industrial'}</span>
              <span className={styles.chip}>{totalArea ? `${totalArea} m²` : 'Área Consultar'}</span>
              <span className={styles.chip}>{listing.city ? `${listing.city}, ${listing.state}` : 'Localização sob consulta'}</span>
              <span className={styles.chip}>{negotiationTerms || 'Venda de Ativo'}</span>
            </div>
          </div>

          {/* Galeria Premium Hardened */}
          <div className={styles.gallery}>
            <div className={styles.mainImage}>
               {/* Badges de Imagem */}
               <div className="absolute top-4 left-4 z-10 flex gap-2">
                 <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest">Ativo Premium</span>
                 {listing.verified && <span className="px-3 py-1 rounded-full bg-[#00b8b2]/20 backdrop-blur-md border border-[#00b8b2]/30 text-[10px] font-bold text-[#d8fffc] uppercase tracking-widest">Documentação Auditada</span>}
               </div>

               <ListingImage 
                 src={listing.media?.find((m: any) => m.isCover)?.url || listing.media?.[0]?.url || listing.logoUrl || listing.imageUrl} 
                 category={listing.category?.slug} 
                 alt={listing.title} 
                 className="w-full h-full object-cover"
               />
            </div>

            {/* Thumbs Grid com Hardening */}
            <div className="grid grid-cols-4 gap-4 mt-4">
              {listing.media && listing.media.length > 0 ? (
                listing.media.slice(0, 4).map((m: any, idx: number) => (
                  <div key={m.id || idx} className="h-[110px] rounded-2xl overflow-hidden border border-white/5 hover:border-[#00b8b2]/40 transition-all cursor-pointer">
                    <img 
                      src={m.url} 
                      className="w-full h-full object-cover" 
                      alt={`Property thumb ${idx + 1}`} 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600';
                      }}
                    />
                  </div>
                ))
              ) : (
                [1, 2, 3, 4].map(idx => (
                  <div key={idx} className="h-[110px] rounded-2xl overflow-hidden border border-white/5 hover:border-[#00b8b2]/40 transition-all cursor-pointer">
                    <img 
                      src={`https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=600&sig=${idx}`} 
                      className="w-full h-full object-cover" 
                      alt="Property placeholder thumb" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600';
                      }}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Seções de Conteúdo Adaptadas para Imóveis */}
          <div className="space-y-6">
            <ContentSection icon={Info} title="Visão Geral do Imóvel" tag="Snapshot">
              <p className="leading-relaxed">{listing.description}</p>
            </ContentSection>

            <ContentSection icon={Zap} title="Dados Principais" tag="Atributos">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { t: 'Tipo de Ativo', d: propertyType || 'Edifício Corporativo / Industrial' },
                  { t: 'Área Privativa / Útil', d: totalArea ? `${totalArea} m²` : (builtArea ? `${builtArea} m²` : 'Consultar Planta') },
                  { t: 'Zoneamento', d: zoning || 'Zoneamento comercial e industrial leve (ZCL)' },
                  { t: 'Vagas / Estacionamento', d: parkingSpaces || 'Estacionamento privativo com docas para carga/descarga' }
                ].map((item, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5 group hover:border-[#00b8b2]/20 transition-all">
                    <strong className="block text-white mb-2 text-sm">{item.t}</strong>
                    <p className="text-sm text-[#98a2b3] line-clamp-2">{item.d}</p>
                  </div>
                ))}
              </div>
            </ContentSection>

            <ContentSection icon={TrendingUp} title="Aplicabilidade Comercial" tag="Potencial">
              <div className={styles.metricGrid}>
                <div className={styles.metricItem}>
                  <span className={styles.label}>Uso Recomendado</span>
                  <strong className={styles.value}>
                    {idealPurpose || 'Corporativo'}
                  </strong>
                  <em className="text-[12px] text-[#00b8b2] font-bold not-italic mt-2">Finalidade Ideal</em>
                </div>
                <div className={styles.metricItem}>
                  <span className={styles.label}>Infraestrutura</span>
                  <strong className={styles.value}>
                    {infrastructureLevel || 'Completa'}
                  </strong>
                  <em className="text-[12px] text-[#00b8b2] font-bold not-italic mt-2">Ready to move</em>
                </div>
                <div className={styles.metricItem}>
                   <span className={styles.label}>Valor Estratégico</span>
                   <strong className={styles.value}>
                     {strategicValue || 'Localização A+'}
                   </strong>
                   <em className="text-[12px] text-[#00b8b2] font-bold not-italic mt-2">Diferencial</em>
                </div>
              </div>
            </ContentSection>

            <ContentSection icon={Layers} title="Estrutura Física" tag="Especificações">
              <p className="leading-relaxed">
                {physicalStructure || 'Pé-direito duplo, recepção de alto padrão, sistema de combate a incêndio atualizado e áreas de staff já mobiliadas. Estrutura pronta para adequação imediata.'}
              </p>
            </ContentSection>

            <ContentSection icon={Truck} title="Acessibilidade e Logística" tag="Mobilidade">
              <p className="leading-relaxed">
                {logisticsNote || 'Localização privilegiada com acesso direto às principais vias arteriais e proximidade com modais de transporte público. Facilidade para transporte de mercadorias e funcionários.'}
              </p>
            </ContentSection>

            <ContentSection icon={Hammer} title="Possibilidade de Adaptação" tag="Flexibilidade">
              <p className="leading-relaxed">
                {adaptationPossible || 'Lajes sem colunas internas permitindo reconfiguração total do layout (Shell & Core). Possibilidade de expansão horizontal ou vertical conforme normas locais.'}
              </p>
            </ContentSection>

            <ContentSection icon={Coins} title="Condições de Negociação" tag="Comercial">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                   <h4 className="text-white font-bold mb-3 text-sm">Modelo de Proposta</h4>
                   <p className="text-sm text-[#98a2b3] leading-relaxed">
                     {negotiationTerms || 'Aceita-se propostas de aquisição direta ou Sale & Leaseback com contrato de longo prazo.'}
                   </p>
                 </div>
                 <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                   <h4 className="text-white font-bold mb-3 text-sm">Disponibilidade</h4>
                   <p className="text-sm text-[#98a2b3] leading-relaxed">
                     {availability || 'Imóvel desocupado, com posse imediata após formalização da transação.'}
                   </p>
                 </div>
              </div>
            </ContentSection>

            <ContentSection icon={ArrowRight} title="Processo Consultivo" tag="Steps">
              <p className="text-sm text-[#98a2b3] mb-6">
                A Finanhub Real Estate oferece suporte completo na diligência imobiliária e jurídica.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {[
                  { n: '01', t: 'Vistoria', d: 'Agendamento de visita técnica ao local.' },
                  { n: '02', t: 'Ficha Técnica', d: 'Acesso às plantas e certidões negativas.' },
                  { n: '03', t: 'Viabilidade', d: 'Análise de zoneamento para o seu negócio.' },
                  { n: '04', t: 'Closing', d: 'Formalização da escritura e transferência.' }
                ].map((step, i) => (
                  <div key={i} className={styles.stepBubble}>
                    <div className={styles.stepNumber}>{step.n}</div>
                    <h4 className="text-white font-bold mb-2 text-sm">{step.t}</h4>
                    <p className="text-[11px] text-[#98a2b3] leading-relaxed">{step.d}</p>
                  </div>
                ))}
              </div>
            </ContentSection>
          </div>

          {/* Canal de Relacionamento (Horizontal CTA) */}
          <div className={styles.relationshipBar}>
            <div>
              <h4 className="text-xl font-bold text-white mb-2">Concierge Imobiliário</h4>
              <p className="text-sm text-[#98a2b3]">Deseja suporte técnico para analisar este imóvel ou agendar uma visita técnica com nossos corretores parceiros?</p>
            </div>
            <button 
              onClick={onInterest}
              className={styles.ctaButton + " " + styles.primaryCta} 
              style={{ width: 'auto', paddingLeft: '2rem', paddingRight: '2rem' }}
            >
              Consultar Especialista
            </button>
          </div>

          {/* Oportunidades Similares */}
          {similarOpportunities.length > 0 && (
            <div className={styles.similarSection}>
              <h2>Ativos Imobiliários Semelhantes</h2>
              <div className={styles.similarGrid}>
                {similarOpportunities.map(opp => (
                  <OpportunityCard key={opp.id} opportunity={opp} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Coluna 3: Sidebar Summary */}
        <div className={styles.summaryColumn}>
          <RealEstateSummarySidebar 
            listing={listing}
            onInterest={onInterest}
            onFavorite={onFavorite}
            isFavorited={isFavorited}
          />
          
          <div className="mt-4 p-5 rounded-[22px] border border-white/5 bg-white/5 text-[11px] text-[#98a2b3] leading-relaxed italic">
             Este anúncio é auditado pela vertical imobiliária da Finanhub. As informações de metragem e zoneamento são decorrentes de registros públicos.
          </div>
        </div>
      </main>
    </div>
  );
};
