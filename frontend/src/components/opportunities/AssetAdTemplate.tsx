'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Settings, 
  Info, 
  Zap, 
  Tool, 
  Layers, 
  Clock, 
  AlertTriangle, 
  FileCheck, 
  ArrowRight,
  Shield
} from 'lucide-react';
import { OpportunitySidebar } from '@/components/opportunities/OpportunitySidebar';
import { OpportunityCard } from '@/components/opportunities/OpportunityCard';
import { AssetSummarySidebar } from './AssetSummarySidebar';
import { ListingImage } from '../common/ListingImage';
import styles from '@/styles/fh-ad-detail.module.css';

interface AssetAdTemplateProps {
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

export const AssetAdTemplate: React.FC<AssetAdTemplateProps> = ({
  listing,
  similarOpportunities,
  onInterest,
  onFavorite,
  isFavorited,
  onFilterChange
}) => {
  // Breadcrumbs
  const breadcrumbs = [
    { label: 'Início', href: '/' },
    { label: 'Oportunidades', href: '/oportunidades' },
    { label: listing.category?.name || 'Ativos e Estruturas', href: `/oportunidades?category=${listing.categoryId}` },
    { label: listing.title, active: true }
  ];

  // Helpers para atributos
  const getAttrValue = (name: string) => {
    const attr = listing.attrValues?.find((av: any) => av.attribute?.name === name || av.name === name);
    return attr?.valueStr || attr?.valueNum?.toString() || '';
  };

  // Chips
  const tags = [
    listing.subtitle || 'Ativo Estratégico',
    listing.state || 'Brasil',
    listing.verified ? 'Verificado' : 'Em Validação',
    getAttrValue('conservationState') || 'Novo / Operacional'
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
               Buscando um ativo específico? Nossa rede de originadores pode encontrar para você.
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
            <span className={styles.categoryBadge}>{listing.category?.name || 'Ativos e Estruturas'}</span>
            <h1>{listing.title}</h1>
            
            <p className="text-[#cfd8e6] text-base mb-6 max-w-[920px]">
              {listing.description ? (listing.description.length > 200 ? `${listing.description.substring(0, 200)}...` : listing.description) : 'Detalhamento técnico do ativo pendente de publicação.'}
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
                 <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest">Ativo Disponível</span>
                 {listing.verified && <span className="px-3 py-1 rounded-full bg-[#00b8b2]/20 backdrop-blur-md border border-[#00b8b2]/30 text-[10px] font-bold text-[#d8fffc] uppercase tracking-widest">Vistoria Realizada</span>}
               </div>

               <ListingImage 
                 src={listing.media?.find((m: any) => m.isCover)?.url || listing.media?.[0]?.url || listing.logoUrl || listing.imageUrl} 
                 category={listing.category?.slug} 
                 alt={listing.title} 
                 className="w-full h-full object-cover"
               />
            </div>

            <div className="grid grid-cols-4 gap-4 mt-4">
              {listing.media && listing.media.length > 0 ? (
                listing.media.slice(0, 4).map((m: any, idx: number) => (
                  <div key={m.id || idx} className="h-[110px] rounded-2xl overflow-hidden border border-white/5 hover:border-[#00b8b2]/40 transition-all cursor-pointer">
                    <img 
                      src={m.url} 
                      className="w-full h-full object-cover" 
                      alt={`Asset thumb ${idx + 1}`} 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600';
                      }}
                    />
                  </div>
                ))
              ) : (
                [1, 2, 3, 4].map(idx => (
                  <div key={idx} className="h-[110px] rounded-2xl overflow-hidden border border-white/5 hover:border-[#00b8b2]/40 transition-all cursor-pointer">
                    <img 
                      src={`https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600&sig=${idx}`} 
                      className="w-full h-full object-cover" 
                      alt="Asset placeholder thumb" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600';
                      }}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Seções de Conteúdo */}
          <div className="space-y-6">
            <ContentSection icon={Info} title="Sobre o Ativo" tag="Visão Geral">
              <p className="leading-relaxed">{listing.description}</p>
            </ContentSection>

            <ContentSection icon={Zap} title="Ficha Técnica" tag="Especificações">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { t: 'Tipo / Modelo', d: getAttrValue('assetType') || 'Especificação técnica não informada.' },
                  { t: 'Ano de Fabricação', d: getAttrValue('fabricationYear') || 'Informação disponível sob consulta.' },
                  { t: 'Capacidade / Potência', d: getAttrValue('productiveCapacity') || 'Dimensionamento alinhado a padrões industriais.' },
                  { t: 'Horas de Uso / KM', d: getAttrValue('usageHistory') || 'Histórico de utilização verificado.' }
                ].map((item, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5 group hover:border-[#00b8b2]/20 transition-all">
                    <strong className="block text-white mb-2 text-sm">{item.t}</strong>
                    <p className="text-sm text-[#98a2b3] line-clamp-2">{item.d}</p>
                  </div>
                ))}
              </div>
            </ContentSection>

            <ContentSection icon={Settings} title="Condição e Manutenção" tag="Operacional">
              <div className={styles.metricGrid}>
                <div className={styles.metricItem}>
                  <span className={styles.label}>Estado</span>
                  <strong className={styles.value}>
                    {getAttrValue('conservationState') || 'Operacional'}
                  </strong>
                  <em className="text-[12px] text-[#00b8b2] font-bold not-italic mt-2">Conservação</em>
                </div>
                <div className={styles.metricItem}>
                  <span className={styles.label}>Última Revisão</span>
                  <strong className={styles.value}>
                    {getAttrValue('lastMaintenance') || 'Recente'}
                  </strong>
                  <em className="text-[12px] text-[#00b8b2] font-bold not-italic mt-2">Histórico</em>
                </div>
                <div className={styles.metricItem}>
                   <span className={styles.label}>Garantia</span>
                   <strong className={styles.value}>
                     {getAttrValue('warranty') || 'Vendedor'}
                   </strong>
                   <em className="text-[12px] text-[#00b8b2] font-bold not-italic mt-2">Segurança</em>
                </div>
              </div>
            </ContentSection>

            <ContentSection icon={Layers} title="Itens Inclusos" tag="Escopo">
              <p className="leading-relaxed">
                {getAttrValue('includedItems') || 'A venda contempla o ativo principal e todos os acessórios originais necessários para sua operação imediata.'}
              </p>
            </ContentSection>

            <ContentSection icon={FileCheck} title="Documentação e Legal" tag="Compliance">
              <p className="leading-relaxed">
                {getAttrValue('documentationStatus') || 'O ativo possui Nota Fiscal original, manuais técnicos e certificados de conformidade em dia.'}
              </p>
            </ContentSection>

            <ContentSection icon={AlertTriangle} title="Logística e Retirada" tag="Operação">
              <p className="leading-relaxed">
                {getAttrValue('logisticsNote') || 'A desmontagem e o transporte são de responsabilidade do comprador, podendo ser cotados separadamente com parceiros Finanhub.'}
              </p>
            </ContentSection>

            <ContentSection icon={ArrowRight} title="Processo de Aquisição" tag="Deal Flow">
              <p className="text-sm text-[#98a2b3] mb-6">
                O fluxo de compra de ativos segue etapas de verificação técnica e segurança jurídica.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {[
                  { n: '01', t: 'Interesse', d: 'Manifestação e análise preliminar.' },
                  { n: '02', t: 'Vistoria', d: 'Agendamento de inspeção técnica local.' },
                  { n: '03', t: 'Proposta', d: 'Envio de oferta formal de compra.' },
                  { n: '04', t: 'Entrega', d: 'Pagamento e liberação do ativo.' }
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

          {/* Social CTA */}
          <div className={styles.relationshipBar}>
            <div>
              <h4 className="text-xl font-bold text-white mb-2">Suporte à Aquisição de Ativos</h4>
              <p className="text-sm text-[#98a2b3]">Deseja contratar uma inspeção técnica independente ou suporte logístico?</p>
            </div>
            <button 
              onClick={onInterest}
              className={styles.ctaButton + " " + styles.primaryCta} 
              style={{ width: 'auto', paddingLeft: '2rem', paddingRight: '2rem' }}
            >
              Falar com Especialista
            </button>
          </div>

          {/* Similares */}
          {similarOpportunities.length > 0 && (
            <div className={styles.similarSection}>
              <h2>Outros Ativos que podem te interessar</h2>
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
          <AssetSummarySidebar 
            listing={listing}
            onInterest={onInterest}
            onFavorite={onFavorite}
            isFavorited={isFavorited}
          />
          
          <div className="mt-4 p-5 rounded-[22px] border border-white/5 bg-white/5 text-[11px] text-[#98a2b3] leading-relaxed italic text-center">
             <Shield size={14} className="inline-block mr-2 text-[#00b8b2]" />
             Transação protegida pela Governança Finanhub.
          </div>
        </div>
      </main>
    </div>
  );
};
