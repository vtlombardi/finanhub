'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  CheckCircle, 
  Info, 
  Zap, 
  TrendingUp, 
  Layers, 
  HelpCircle, 
  AlertTriangle, 
  UserCheck, 
  ArrowRight,
  Target,
  Rocket,
  Shield,
  Users,
  Code
} from 'lucide-react';
import { OpportunitySidebar } from '@/components/opportunities/OpportunitySidebar';
import { OpportunityCard } from '@/components/opportunities/OpportunityCard';
import { StartupSummarySidebar } from './StartupSummarySidebar';
import { ListingImage } from '../common/ListingImage';
import styles from '@/styles/fh-ad-detail.module.css';

interface StartupAdTemplateProps {
  listing: any;
  similarOpportunities: any[];
  onInterest: () => void;
  onFavorite: () => void;
  isFavorited?: boolean;
  onFilterChange: (filters: any) => void;
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

export const StartupAdTemplate: React.FC<StartupAdTemplateProps> = ({
  listing,
  similarOpportunities,
  onInterest,
  onFavorite,
  isFavorited,
  onFilterChange
}) => {
  // Helpers para buscar atributos dinâmicos
  const getAttr = (name: string) => {
    return listing.attrValues?.find((av: any) => av.attribute?.name === name || av.name === name);
  };

  const getAttrValue = (name: string) => {
    const attr = getAttr(name);
    return attr?.valueStr || attr?.valueNum?.toString() || '';
  };

  const breadcrumbs = [
    { label: 'Início', href: '/' },
    { label: 'Oportunidades', href: '/oportunidades' },
    { label: 'Startups e Tecnologia', href: `/oportunidades?category=${listing.categoryId}` },
    { label: listing.title, active: true }
  ];

  const startupStage = getAttrValue('startupStage') || 'Pre-Seed/Seed';
  const targetSector = getAttrValue('targetSector') || 'Tecnologia';
  const businessModel = getAttrValue('businessModelType') || 'SaaS / B2B';

  const tags = [
    startupStage,
    listing.state || 'Brasil',
    targetSector,
    businessModel
  ];

  return (
    <div className={styles.fhDetailWrapper}>
      <div className={styles.glowTeal} />
      
      <main className={styles.mainLayout}>
        {/* Coluna 1: Sidebar de Filtros (Padrão Marketplace) */}
        <div className={styles.filterColumn}>
          <div className={styles.filterCard}>
            <OpportunitySidebar onFilterChange={onFilterChange} />
          </div>
          
          <div className="mt-4 p-5 rounded-[22px] bg-gradient-to-b from-[#00b8b2]/10 to-transparent border border-[#00b8b2]/15">
             <p className="text-[13px] text-[#dde9f6] leading-relaxed">
               Deseja investir em teses específicas de tecnologia? Fale com nosso comitê de análise.
             </p>
          </div>
        </div>

        {/* Coluna 2: Conteúdo Principal */}
        <div className={styles.contentCol}>
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
            <span className={styles.categoryBadge}>Projetos e Startups</span>
            <h1>{listing.title}</h1>
            
            <p className="text-[#cfd8e6] text-base mb-6 max-w-[920px]">
              {getAttrValue('startupProblem') || listing.description}
            </p>

            <div className={styles.chipsContainer}>
              {tags.map((tag, i) => (
                <span key={i} className={styles.chip}>{tag}</span>
              ))}
            </div>
          </div>

          {/* Galeria Premium */}
          <div className={styles.gallery}>
            <div className={styles.mainImage}>
               <div className="absolute top-4 left-4 z-10 flex gap-2">
                 <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest">Captação Aberta</span>
                 <span className="px-3 py-1 rounded-full bg-[#00b8b2]/20 backdrop-blur-md border border-[#00b8b2]/30 text-[10px] font-bold text-[#d8fffc] uppercase tracking-widest">{getAttrValue('fundingRound') || 'Seed Round'}</span>
               </div>
               <ListingImage 
                 src={listing.media?.find((m: any) => m.isCover)?.url || listing.media?.[0]?.url || listing.logoUrl || listing.imageUrl} 
                 category={listing.category?.slug} 
                 alt={listing.title} 
                 className="w-full h-full object-cover"
               />
            </div>

            {/* Thumbs Reais ou Premium Placeholders */}
            <div className="grid grid-cols-4 gap-4 mt-4">
              {listing.media && listing.media.length > 0 ? (
                listing.media.slice(0, 4).map((m: any, idx: number) => (
                  <div key={m.id || idx} className="h-[110px] rounded-2xl overflow-hidden border border-white/5 hover:border-[#00b8b2]/40 transition-all cursor-pointer">
                    <img 
                      src={m.url} 
                      className="w-full h-full object-cover" 
                      alt={`Startup thumb ${idx + 1}`} 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=600';
                      }}
                    />
                  </div>
                ))
              ) : (
                [1, 2, 3, 4].map(idx => (
                  <div key={idx} className="h-[110px] rounded-2xl overflow-hidden border border-white/5 hover:border-[#00b8b2]/40 transition-all cursor-pointer">
                    <img 
                      src={`https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=600&sig=${idx}`} 
                      className="w-full h-full object-cover" 
                      alt="Startup placeholder thumb" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=600';
                      }}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Conteúdo */}
          <div className="space-y-6">
            <ContentSection icon={Rocket} title="Proposta de Valor" tag="Solution">
              <p className="leading-relaxed">
                {getAttrValue('startupSolution') || listing.description}
              </p>
            </ContentSection>

            <ContentSection icon={Zap} title="Destaques do Negócio" tag="Competitive Edge">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { t: 'Diferencial Competitivo', d: getAttrValue('competitiveEdge') || 'Tecnologia proprietária e barreira de entrada defensável.' },
                  { t: 'Validação e POC', d: getAttrValue('validationPOCBrief') || 'Produto em fase de tração com feedback positivo dos usuários.' },
                  { t: 'Modelo de Receita', d: getAttrValue('businessModelType') || 'Monetização via SaaS e expansão em ad-ons.' },
                  { t: 'TAM (Market Size)', d: getAttrValue('tamMarketSize') || 'Mercado em franca expansão com baixa digitalização.' }
                ].map((item, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5 group hover:border-[#00b8b2]/20 transition-all">
                    <strong className="block text-white mb-2 text-sm">{item.t}</strong>
                    <p className="text-sm text-[#98a2b3] line-clamp-2">{item.d}</p>
                  </div>
                ))}
              </div>
            </ContentSection>

            <ContentSection icon={TrendingUp} title="Métricas e Tração" tag="Growth">
              <div className={styles.metricGrid}>
                <div className={styles.metricItem}>
                  <span className={styles.label}>MRR / Faturamento</span>
                  <strong className={styles.value}>
                    {getAttrValue('mrrCurrent') ? `R$ ${Number(getAttrValue('mrrCurrent')).toLocaleString('pt-BR')}` : 'Validação'}
                  </strong>
                  <em className="text-[12px] text-[#00b8b2] font-bold not-italic mt-2">Receita Recorrente</em>
                </div>
                <div className={styles.metricItem}>
                  <span className={styles.label}>Estágio Atual</span>
                  <strong className={styles.value}>
                    {getAttrValue('startupStage') || 'Seed'}
                  </strong>
                  <em className="text-[12px] text-[#00b8b2] font-bold not-italic mt-2">Maturidade</em>
                </div>
                <div className={styles.metricItem}>
                   <span className={styles.label}>TAM Estimado</span>
                   <strong className={styles.value}>
                     {getAttrValue('tamMarketSize') || 'Billion Market'}
                   </strong>
                   <em className="text-[12px] text-[#00b8b2] font-bold not-italic mt-2">Oportunidade</em>
                </div>
              </div>
            </ContentSection>

            <ContentSection icon={Users} title="Time Fundador" tag="Team">
              <p className="leading-relaxed">
                {getAttrValue('foundingTeamBrief') || 'Time composto por especialistas do setor com histórico de execução em tecnologia e negócios.'}
              </p>
            </ContentSection>

            <ContentSection icon={Code} title="Tecnologia e Produto" tag="Stack">
              <p className="leading-relaxed">
                {getAttrValue('techStackBrief') || 'Infraestrutura escalável baseada em nuvem com foco em segurança e experiência do usuário.'}
              </p>
            </ContentSection>

            <ContentSection icon={Target} title="Oportunidade de Investimento" tag="Funding">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                   <h4 className="text-white font-bold mb-3 text-sm">Potencial de Crescimento</h4>
                   <p className="text-sm text-[#98a2b3] leading-relaxed">
                     {getAttrValue('growthPotentialBrief') || 'Projeção de escala agressiva nos próximos 24 meses baseada nos canais de aquisição validados.'}
                   </p>
                 </div>
                 <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                   <h4 className="text-white font-bold mb-3 text-sm">Uso do Capital</h4>
                   <p className="text-sm text-[#98a2b3] leading-relaxed">
                     {getAttrValue('useOfCapital') || 'Os recursos serão destinados a P&D, Marketing e expansão do time de vendas.'}
                   </p>
                 </div>
              </div>
            </ContentSection>

            <ContentSection icon={ArrowRight} title="Processo de Aporte" tag="Investment Path">
              <p className="text-sm text-[#98a2b3] mb-6">
                O processo de investimento em startups via Finanhub segue o rito de diligência e formalização societária padrão.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {[
                  { n: '01', t: 'Interest', d: 'Análise preliminar e demonstração de interesse.' },
                  { n: '02', t: 'Data Room', d: 'Acesso ao Pitch Deck e métricas detalhadas.' },
                  { n: '03', t: 'Pitch', d: 'Reunião de apresentação com fundadores.' },
                  { n: '04', t: 'Closing', d: 'Formalização de Term Sheet e Aporte.' }
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

          <div className={styles.relationshipBar}>
            <div>
              <h4 className="text-xl font-bold text-white mb-2">Interesse em Startups</h4>
              <p className="text-sm text-[#98a2b3]">Deseja falar com os fundadores ou acessar o Data Room completo deste projeto?</p>
            </div>
            <button 
              onClick={onInterest}
              className={styles.ctaButton + " " + styles.primaryCta} 
              style={{ width: 'auto', paddingLeft: '2rem', paddingRight: '2rem' }}
            >
              Falar com Originador
            </button>
          </div>

          {similarOpportunities.length > 0 && (
            <div className={styles.similarSection}>
              <h2>Startups similares que buscam investimento</h2>
              <div className={styles.similarGrid}>
                {similarOpportunities.map(opp => (
                  <OpportunityCard key={opp.id} opportunity={opp} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Coluna 3: Resumo Executivo Startup */}
        <div className={styles.summaryColumn}>
          <StartupSummarySidebar 
            listing={listing}
            onInterest={onInterest}
            onFavorite={onFavorite}
            isFavorited={isFavorited}
          />
          
          <div className="mt-4 p-5 rounded-[22px] border border-white/5 bg-white/5 text-[11px] text-[#98a2b3] leading-relaxed italic">
             Investimentos em Startups envolvem risco de capital. A Finanhub atua como facilitadora e curadora tecnológica das oportunidades.
          </div>
        </div>
      </main>
    </div>
  );
};
