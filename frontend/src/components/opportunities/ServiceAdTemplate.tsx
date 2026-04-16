'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  CheckCircle, 
  Info, 
  Zap, 
  Award, 
  Layers, 
  HelpCircle, 
  Target, 
  UserPlus, 
  ArrowRight
} from 'lucide-react';
import { OpportunitySidebar } from '@/components/opportunities/OpportunitySidebar';
import { OpportunityCard } from '@/components/opportunities/OpportunityCard';
import { ServiceSummarySidebar } from './ServiceSummarySidebar';
import { ListingImage } from '../common/ListingImage';
import styles from '@/styles/fh-ad-detail.module.css';

interface ServiceAdTemplateProps {
  listing: any;
  similarOpportunities: any[];
  onInterest: () => void;
  onFavorite: () => void;
  isFavorited?: boolean;
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

export const ServiceAdTemplate: React.FC<ServiceAdTemplateProps> = ({
  listing,
  similarOpportunities,
  onInterest,
  onFavorite,
  isFavorited,
  onFilterChange
}) => {
  const getAttrValue = (name: string) => {
    return listing.attrValues?.find((av: any) => av.attribute?.name === name)?.value || '';
  };

  const subcategoryName = listing.category?.name || 'Serviços e Consultoria';
  
  const breadcrumbs = [
    { label: 'Início', href: '/' },
    { label: 'Oportunidades', href: '/oportunidades' },
    { label: subcategoryName, href: `/oportunidades?category=${listing.categoryId}` },
    { label: listing.title, active: true }
  ];

  const tags = [
    getAttrValue('expertiseArea') || 'Serviços Especializados',
    listing.state || 'Nacional',
    listing.verified ? 'Certificado Finanhub' : 'Aguardando Validação',
    getAttrValue('hiringModel') || 'Modelo sob demanda'
  ];

  // Helper para verificar se uma seção tem conteúdo
  const hasValue = (name: string) => {
    const val = getAttrValue(name);
    return val && val.length > 0;
  };

  return (
    <div className={styles.fhDetailWrapper}>
      <div className={styles.glowTeal} />
      
      <main className={styles.mainLayout}>
        <div className={styles.filterColumn}>
          <div className={styles.filterCard}>
            {/* @ts-ignore */}
            <OpportunitySidebar onFilterChange={onFilterChange} />
          </div>
          <div className="mt-4 p-5 rounded-[22px] bg-gradient-to-b from-[#00b8b2]/10 to-transparent border border-[#00b8b2]/15">
             <p className="text-[13px] text-[#dde9f6] leading-relaxed">
               Precisa de suporte especializado para contratar este serviço? Fale com nossa mesa técnica.
             </p>
          </div>
        </div>

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

          <div className={styles.hero}>
            <span className={styles.categoryBadge}>{subcategoryName}</span>
            <h1>{listing.title}</h1>
            
            <p className="text-[#cfd8e6] text-base mb-6 max-w-[920px]">
              {listing.description || 'Proposta de valor estratégica em fase de revisão técnica.'}
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
               {/* Badges de Imagem */}
               <div className="absolute top-4 left-4 z-10 flex gap-2">
                 <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest">Serviço Verificado</span>
                 {listing.verified && <span className="px-3 py-1 rounded-full bg-[#00b8b2]/20 backdrop-blur-md border border-[#00b8b2]/30 text-[10px] font-bold text-[#d8fffc] uppercase tracking-widest">Expertise Premium</span>}
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
                 // Mostrar mídias reais se existirem
                 listing.media.slice(0, 4).map((m: any, idx: number) => (
                   <div key={m.id || idx} className="h-[110px] rounded-2xl overflow-hidden border border-white/5 hover:border-[#00b8b2]/40 transition-all cursor-pointer">
                     <img 
                       src={m.url} 
                       className="w-full h-full object-cover" 
                       alt={`Service thumb ${idx + 1}`} 
                       onError={(e) => {
                         const target = e.target as HTMLImageElement;
                         target.src = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=600';
                       }}
                     />
                   </div>
                 ))
               ) : (
                 // Fallback para placeholders premium (mesma sig do BuyingSelling)
                 [1, 2, 3, 4].map(idx => (
                   <div key={idx} className="h-[110px] rounded-2xl overflow-hidden border border-white/5 hover:border-[#00b8b2]/40 transition-all cursor-pointer">
                     <img 
                       src={`https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=600&sig=${idx}`} 
                       className="w-full h-full object-cover" 
                       alt="Service placeholder thumb" 
                       onError={(e) => {
                         const target = e.target as HTMLImageElement;
                         target.src = 'https://images.unsplash.com/photo-1551288560-199a5089e5cc?auto=format&fit=crop&q=80&w=600';
                       }}
                     />
                   </div>
                 ))
               )}
            </div>
          </div>

          <div className="space-y-6">
            <ContentSection icon={Info} title="Apresentação do Serviço" tag="Proposta de Valor">
              <p className="leading-relaxed">{listing.description}</p>
            </ContentSection>

            <ContentSection icon={Zap} title="Especialidades e Expertise" tag="Competências Core">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { t: 'Tipo de Serviço', d: getAttrValue('serviceType') || 'Escopo especializado.' },
                  { t: 'Área de Atuação', d: getAttrValue('expertiseArea') || 'Foco técnico estratégico.' },
                  { t: 'Formato de Entrega', d: getAttrValue('deliveryFormat') || 'Metodologia presencial/remota.' },
                  { t: 'Diferenciais', d: getAttrValue('differential'), show: hasValue('differential') }
                ].filter(item => item.show !== false).map((item, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5 group hover:border-[#00b8b2]/20 transition-all">
                    <strong className="block text-white mb-2 text-sm">{item.t}</strong>
                    <p className="text-sm text-[#98a2b3] line-clamp-2">{item.d}</p>
                  </div>
                ))}
              </div>
            </ContentSection>

            <ContentSection icon={Award} title="Experiência e Autoridade" tag="Track Record">
              <div className={styles.metricGrid}>
                <div className={styles.metricItem}>
                  <span className={styles.label}>Tempo de Mercado</span>
                  <strong className={styles.value}>
                    {getAttrValue('experienceTime') || 'Sênior'}
                  </strong>
                  <em className="text-[12px] text-[#00b8b2] font-bold not-italic mt-2">Expertise Comprovada</em>
                </div>
                <div className={styles.metricItem}>
                  <span className={styles.label}>Nível de Certificação</span>
                  <strong className={styles.value}>
                    {getAttrValue('certifications') || 'Especialista'}
                  </strong>
                  <em className="text-[12px] text-[#00b8b2] font-bold not-italic mt-2">Selos de Qualidade</em>
                </div>
                <div className={styles.metricItem}>
                   <span className={styles.label}>Modelo de Precificação</span>
                   <strong className={styles.value}>
                     {getAttrValue('pricingModel') || 'Sob Consulta'}
                   </strong>
                   <em className="text-[12px] text-[#00b8b2] font-bold not-italic mt-2">Transparência Comercial</em>
                </div>
              </div>
            </ContentSection>

            {hasValue('serviceScope') && (
              <ContentSection icon={Layers} title="Detalhamento do Escopo" tag="Entrega">
                <p className="leading-relaxed whitespace-pre-wrap">
                  {getAttrValue('serviceScope')}
                </p>
              </ContentSection>
            )}

            {(hasValue('methodology') || hasValue('expectedResults')) && (
              <ContentSection icon={Target} title="Metodologia e Resultados" tag="Approach">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {hasValue('methodology') && (
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                      <h4 className="text-white font-bold mb-3 text-sm">Abordagem de Trabalho</h4>
                      <p className="text-sm text-[#98a2b3] leading-relaxed">
                        {getAttrValue('methodology')}
                      </p>
                    </div>
                   )}
                   {hasValue('expectedResults') && (
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                      <h4 className="text-white font-bold mb-3 text-sm">Resultados Esperados</h4>
                      <p className="text-sm text-[#98a2b3] leading-relaxed">
                        {getAttrValue('expectedResults')}
                      </p>
                    </div>
                   )}
                </div>
              </ContentSection>
            )}

            {(hasValue('targetAudience') || hasValue('casesSuccess')) && (
              <ContentSection icon={UserPlus} title="Perfil do Cliente Ideal" tag="Client Profile">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hasValue('targetAudience') && (
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                      <h4 className="text-white font-bold mb-3 text-sm">Público-Alvo</h4>
                      <p className="text-sm text-[#98a2b3] leading-relaxed">
                        {getAttrValue('targetAudience')}
                      </p>
                    </div>
                  )}
                  {hasValue('casesSuccess') && (
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                      <h4 className="text-white font-bold mb-3 text-sm">Cases de Sucesso</h4>
                      <p className="text-sm text-[#98a2b3] leading-relaxed">
                        {getAttrValue('casesSuccess')}
                      </p>
                    </div>
                  )}
                </div>
              </ContentSection>
            )}

            <ContentSection icon={ArrowRight} title="Processo de Onboarding" tag="Working Together">
              <p className="text-sm text-[#98a2b3] mb-6">
                Fluxo padronizado de contratação para garantir o alinhamento de expectativas e início imediato.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {[
                  { n: '01', t: 'Briefing', d: 'Alinhamento inicial de necessidades.' },
                  { n: '02', t: 'Proposta', d: 'Apresentação do escopo e fee.' },
                  { n: '03', t: 'Kick-off', d: 'Início oficial da jornada e diagnóstico.' },
                  { n: '04', t: 'Execução', d: 'Entrega contínua e reporte de progresso.' }
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
              <h4 className="text-xl font-bold text-white mb-2">Solicitar Orçamento Personalizado</h4>
              <p className="text-sm text-[#98a2b3]">Deseja agendar uma reunião de diagnóstico com este consultor ou empresa de serviços?</p>
            </div>
            <button 
              onClick={onInterest}
              className={styles.ctaButton + " " + styles.primaryCta} 
              style={{ width: 'auto', paddingLeft: '2rem', paddingRight: '2rem' }}
            >
              Falar com Consultor
            </button>
          </div>

          {similarOpportunities.length > 0 && (
            <div className={styles.similarSection}>
              <h2>Consultorias Similares</h2>
              <div className={styles.similarGrid}>
                {similarOpportunities.map(opp => (
                  <OpportunityCard key={opp.id} opportunity={opp} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.summaryColumn}>
          <ServiceSummarySidebar 
            listing={listing}
            onInterest={onInterest}
            onFavorite={onFavorite}
            isFavorited={isFavorited}
          />
          
          <div className="mt-4 p-5 rounded-[22px] border border-white/5 bg-white/5 text-[11px] text-[#98a2b3] leading-relaxed italic">
             Este prestador é verificado pela rede Finanhub. A qualidade técnica e histórico foram analisados conforme critérios institucionais.
          </div>
        </div>
      </main>
    </div>
  );
};
