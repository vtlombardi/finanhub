'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  CheckCircle, 
  Target, 
  Zap, 
  TrendingUp, 
  Layers, 
  HelpCircle, 
  ShieldCheck, 
  Users, 
  ArrowRight,
  Globe,
  Share2
} from 'lucide-react';
import { OpportunitySidebar } from '@/components/opportunities/OpportunitySidebar';
import { OpportunityCard } from '@/components/opportunities/OpportunityCard';
import { PartnershipSummarySidebar } from './PartnershipSummarySidebar';
import { ListingImage } from '../common/ListingImage';
import styles from '@/styles/fh-ad-detail.module.css';

interface PartnershipAdTemplateProps {
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

export const PartnershipAdTemplate: React.FC<PartnershipAdTemplateProps> = ({
  listing,
  similarOpportunities,
  onInterest,
  onFavorite,
  isFavorited,
  onFilterChange
}) => {
  const breadcrumbs = [
    { label: 'Início', href: '/' },
    { label: 'Oportunidades', href: '/oportunidades' },
    { label: listing.category?.name || 'Divulgação e Parcerias', href: `/oportunidades?category=${listing.categoryId}` },
    { label: listing.title, active: true }
  ];

  const tags = [
    listing.partnershipType || 'Parceria Estratégica',
    listing.state || 'Nacional',
    listing.verified ? 'Aliança Auditada' : 'Aguardando Validação',
    listing.partnershipFormat || 'Co-Branding / Canais'
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
             <p className="text-[13px] text-[#dde9f6] leading-relaxed">
               Buscando parcerias de alto impacto? Fale com nosso Hub de Alianças Corporativas.
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
            <span className={styles.categoryBadge}>{listing.category?.name || 'Divulgação e Parcerias'}</span>
            <h1>{listing.title}</h1>
            
            <p className="text-[#cfd8e6] text-base mb-6 max-w-[920px]">
              {listing.description ? (listing.description.length > 200 ? `${listing.description.substring(0, 200)}...` : listing.description) : 'Proposta detalhada de colaboração estratégica em análise.'}
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
                 <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest">Aliança Aberta</span>
                 {listing.verified && <span className="px-3 py-1 rounded-full bg-[#00b8b2]/20 backdrop-blur-md border border-[#00b8b2]/30 text-[10px] font-bold text-[#d8fffc] uppercase tracking-widest">Brand Verificada</span>}
               </div>

               <ListingImage 
                 src={listing.media?.find((m: any) => m.isCover)?.url || listing.media?.[0]?.url || listing.logoUrl || listing.imageUrl} 
                 category={listing.category?.slug} 
                 alt={listing.title} 
                 className="w-full h-full object-cover"
               />
            </div>

            <div className="grid grid-cols-4 gap-4 mt-4">
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className="h-[110px] rounded-2xl overflow-hidden border border-white/5 hover:border-[#00b8b2]/40 transition-all cursor-pointer">
                  <img src={`https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80&sig=${idx}`} className="w-full h-full object-cover" alt="Partnership thumb" />
                </div>
              ))}
            </div>
          </div>

          {/* Indicadores de Parceria (KPIs) */}
          <div className="mt-8 mb-6">
            <h3 className="text-sm font-semibold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-[#00b8b2]" />
              Indicadores da Oportunidade
            </h3>
            <div className={styles.metricGrid}>
              <div className={styles.metricItem}>
                <span className={styles.label}>Objetivo</span>
                <strong className={styles.value} style={{ fontSize: '1rem' }}>{listing.partnershipObjective || 'Crescimento'}</strong>
                <em className="text-[12px] text-[#00b8b2] font-bold not-italic mt-2">Foco Principal</em>
              </div>
              <div className={styles.metricItem}>
                <span className={styles.label}>O que Oferece</span>
                <strong className={styles.value} style={{ fontSize: '1rem' }}>{listing.offeringDescription || 'Canais / Mídia'}</strong>
                <em className="text-[12px] text-[#00b8b2] font-bold not-italic mt-2">Recurso Disponível</em>
              </div>
              <div className={styles.metricItem}>
                <span className={styles.label}>O que Busca</span>
                <strong className={styles.value} style={{ fontSize: '1rem' }}>{listing.seekingDescription || 'Brand Equity'}</strong>
                <em className="text-[12px] text-[#00b8b2] font-bold not-italic mt-2">Necessidade Sinergia</em>
              </div>
            </div>
          </div>

          {/* Seções de Conteúdo */}
          <div className="space-y-6">
            <ContentSection icon={Target} title="Objetivo e Colaboração" tag="Briefing">
              <p className="leading-relaxed">{listing.description}</p>
            </ContentSection>

            <ContentSection icon={Globe} title="Alcance e Canais" tag="Exposure">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                  <strong className="block text-white mb-2 text-sm">Público Alcançado</strong>
                  <p className="text-sm text-[#98a2b3]">{listing.audienceReach || 'Público sênior, decisores de mercado e entusiastas de tech.'}</p>
                </div>
                <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                  <strong className="block text-white mb-2 text-sm">Canais Disponíveis</strong>
                  <p className="text-sm text-[#98a2b3]">{listing.channelsAvailable || 'Newsletter (50k+), Eventos Exclusivos e Redes Sociais.'}</p>
                </div>
              </div>
            </ContentSection>

            <ContentSection icon={Zap} title="Resultados e Diferenciais" tag="Values">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                  <strong className="block text-white mb-2 text-sm">Resultados Esperados</strong>
                  <p className="text-sm text-[#98a2b3]">{listing.expectedResults || 'Aumento de taxa de conversão em 15% e autoridade de marca.'}</p>
                </div>
                <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                  <strong className="block text-white mb-2 text-sm">Diferencial da Marca</strong>
                  <p className="text-sm text-[#98a2b3]">{listing.companyDifferentials || 'Liderança em inovação e alta taxa de engajamento orgânico.'}</p>
                </div>
              </div>
            </ContentSection>

            <ContentSection icon={Layers} title="Modelo de Negócio e Sinergia" tag="Structure">
              <p className="leading-relaxed">
                {listing.partnershipFormat || 'Propomos um modelo flexível de co-marketing, onde combinamos esforços de branding para maximizar o ROI de ambas as marcas através de canais cruzados.'}
              </p>
            </ContentSection>

            <ContentSection icon={ArrowRight} title="Processo de Aliança" tag="Onboarding">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {[
                  { n: '01', t: 'Briefing', d: 'Alinhamento inicial de objetivos e sinergias.' },
                  { n: '02', t: 'Proposta', d: 'Estruturação do modelo de colaboração.' },
                  { n: '03', t: 'Validação', d: 'Aprovação de compliance e marcas.' },
                  { n: '04', t: 'Launch', d: 'Execução e monitoramento de resultados.' }
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

          {/* Social CTA Bar */}
          <div className={styles.relationshipBar}>
            <div>
              <h4 className="text-xl font-bold text-white mb-2">Hub de Parcerias Estratégicas</h4>
              <p className="text-sm text-[#98a2b3]">Sua marca precisa de mais visibilidade? Conecte-se com players que geram valor real.</p>
            </div>
            <button 
              onClick={onInterest}
              className={styles.ctaButton + " " + styles.primaryCta} 
              style={{ width: 'auto', paddingLeft: '2rem', paddingRight: '2rem' }}
            >
              Iniciar Conversa Aliança
            </button>
          </div>

          {/* Oportunidades Similares */}
          {similarOpportunities.length > 0 && (
            <div className={styles.similarSection}>
              <h2>Outras parcerias em potencial</h2>
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
          <PartnershipSummarySidebar 
            listing={listing}
            onInterest={onInterest}
            onFavorite={onFavorite}
            isFavorited={isFavorited}
          />
          
          <div className="mt-4 p-5 rounded-[22px] border border-white/5 bg-white/5 text-[11px] text-[#98a2b3] leading-relaxed italic">
             Esta oportunidade é gerenciada pelo Finanhub Partners. Todas as propostas estão sujeitas a análise de alinhamento estratégico.
          </div>
        </div>
      </main>
    </div>
  );
};
