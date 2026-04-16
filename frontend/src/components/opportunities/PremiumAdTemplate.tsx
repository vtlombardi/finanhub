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
  ShieldCheck,
  BarChart3,
  Globe,
  Lock
} from 'lucide-react';
import { OpportunitySidebar } from '@/components/opportunities/OpportunitySidebar';
import { OpportunityCard } from '@/components/opportunities/OpportunityCard';
import { PremiumSummarySidebar } from './PremiumSummarySidebar';
import { ListingImage } from '../common/ListingImage';
import styles from '@/styles/fh-ad-detail.module.css';

interface PremiumAdTemplateProps {
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

export const PremiumAdTemplate: React.FC<PremiumAdTemplateProps> = ({
  listing,
  similarOpportunities,
  onInterest,
  onFavorite,
  isFavorited,
  onFilterChange
}) => {
  // Helper para extrair atributos
  const getAttrValue = (name: string) => {
    const attr = listing?.attrValues?.find((av: any) => av.attribute?.name === name || av.name === name);
    return attr?.valueNum ?? attr?.valueStr ?? null;
  };

  const premiumType = getAttrValue('premiumType') || 'Investment Opportunity';
  const executiveSummary = getAttrValue('executiveSummary') || listing.description;
  const revenue = getAttrValue('revenueLtm');
  const ebitda = getAttrValue('ebitdaPremium');
  const valuation = getAttrValue('valuationEstimated');
  const roi = getAttrValue('roi');
  const payback = getAttrValue('paybackEstimated');
  const margin = getAttrValue('marginLiquida');
  const growth = getAttrValue('growthHistory');
  const ticket = getAttrValue('ticketMinimo');
  const operation = getAttrValue('operationStructure');
  const financialHistory = getAttrValue('financialHistory');
  const growthStrategy = getAttrValue('growthStrategy');
  const investorProfile = getAttrValue('idealInvestorProfile');

  const breadcrumbs = [
    { label: 'Início', href: '/' },
    { label: 'Oportunidades', href: '/oportunidades' },
    { label: 'Premium', href: '/oportunidades?category=premium' },
    { label: listing.title, active: true }
  ];

  const tags = [
    premiumType,
    listing.state || 'Confidencial',
    listing.verified ? 'Due Diligence Pronta' : 'Em Originação',
    `Ticket Min: R$ ${Number(ticket || 0).toLocaleString('pt-BR')}`
  ];

  const formatFinancial = (val?: string | number) => {
    if (!val) return 'Sigilo Negoc.';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return val;
    if (num >= 1000000000) return `R$ ${(num/1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `R$ ${(num/1000000).toFixed(1)}M`;
    if (num >= 1000) return `R$ ${(num/1000).toFixed(0)}K`;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
  };

  return (
    <div className={styles.fhDetailWrapper}>
      <div className={styles.glowTeal} style={{ background: 'radial-gradient(circle at 50% -20%, rgba(0, 184, 178, 0.15) 0%, transparent 70%)' }} />
      
      <main className={styles.mainLayout}>
        {/* Coluna 1: Sidebar de Filtros (Padrão Marketplace) */}
        <div className={styles.filterColumn}>
          <div className={styles.filterCard}>
            <OpportunitySidebar onFilterChange={onFilterChange} />
          </div>
          
          <div className="mt-4 p-5 rounded-[22px] border border-[#00b8b2]/20 bg-gradient-to-br from-[#00b8b2]/10 via-transparent to-transparent">
             <div className="flex items-center gap-2 mb-3">
               <ShieldCheck size={16} className="text-[#00b8b2]" />
               <span className="text-[11px] font-bold text-white uppercase tracking-wider">Investidor Qualificado</span>
             </div>
             <p className="text-[12px] text-[#dde9f6] leading-relaxed">
               Acesso exclusivo a deals de Private Equity e M&A origindados por nossa rede de parceiros institucionais.
             </p>
          </div>
        </div>

        {/* Coluna 2: Conteúdo Central */}
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
                  <span className={styles.separator}><ChevronRight size={12} /></span>
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* Hero Section Premium */}
          <div className={styles.hero}>
            <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full bg-[#00b8b2]/20 border border-[#00b8b2]/30 text-[10px] font-black text-[#d8fffc] uppercase tracking-[0.2em]">Oportunidade Premium</span>
                <span className={styles.categoryBadge}>{listing.category?.name || 'M&A Strategy'}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight tracking-tight">
                {listing.title}
            </h1>
            
            <p className="text-[#cfd8e6] text-lg mb-8 max-w-[850px] leading-relaxed italic border-l-4 border-[#00b8b2] pl-6 py-2 bg-white/5 rounded-r-xl">
               "{listing.description?.substring(0, 250)}..."
            </p>

            <div className={styles.chipsContainer}>
              {tags.map((tag, i) => (
                <span key={i} className={styles.chip} style={{ borderColor: 'rgba(0, 184, 178, 0.2)', color: '#d8fcfa', fontWeight: 'bold' }}>
                    {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Galeria Institucional */}
          <div className={styles.gallery}>
            <div className={styles.mainImage} style={{ borderRadius: '24px', overflow: 'hidden' }}>
               <div className="absolute top-6 left-6 z-10 flex gap-3">
                 <span className="px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 text-[11px] font-bold text-white uppercase tracking-widest shadow-2xl">Institutional Asset</span>
                 {listing.verified && <span className="px-4 py-1.5 rounded-full bg-[#00b8b2]/90 backdrop-blur-xl text-[11px] font-bold text-white uppercase tracking-widest shadow-2xl">Verified Deal</span>}
               </div>

               <ListingImage 
                 src={listing.media?.find((m: any) => m.isCover)?.url || listing.media?.[0]?.url || listing.logoUrl || listing.imageUrl} 
                 category={listing.category?.slug} 
                 alt={listing.title} 
                 className="w-full h-[450px] object-cover"
               />
               
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="grid grid-cols-4 gap-4 mt-4">
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className="h-[120px] rounded-2xl overflow-hidden border border-white/10 hover:border-[#00b8b2]/60 transition-all cursor-pointer group relative">
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors z-10" />
                  <img src={`https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80&sig=${idx + 10}`} className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700" alt="Premium gallery" />
                </div>
              ))}
            </div>
          </div>

          {/* Seções de Conteúdo Técnico */}
          <div className="space-y-8 mt-12">
            <ContentSection icon={Info} title="Tese de Investimento" tag="Investment Thesis">
              <div className="p-8 rounded-[28px] bg-gradient-to-br from-white/10 to-transparent border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00b8b2]/10 blur-[60px] rounded-full -mr-10 -mt-10" />
                <p className="text-lg leading-relaxed text-[#f0f5ff] font-medium mb-6">
                  {executiveSummary}
                </p>
                <div className="flex gap-4 items-center">
                    <div className="h-0.5 flex-1 bg-gradient-to-r from-[#00b8b2]/40 to-transparent" />
                    <span className="text-[10px] text-[#00b8b2] font-black uppercase tracking-[0.3em]">Institutional Grade</span>
                </div>
              </div>
            </ContentSection>

            <ContentSection icon={TrendingUp} title="Indicadores de Performance" tag="KPIs & Financials">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between h-[150px]">
                    <span className="text-[10px] text-[#98a2b3] uppercase font-bold tracking-widest">Revenue (LTM)</span>
                    <strong className="text-2xl text-white font-black">{formatFinancial(revenue)}</strong>
                    <div className="h-1 w-12 bg-[#00b8b2] rounded-full" />
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between h-[150px]">
                    <span className="text-[10px] text-[#98a2b3] uppercase font-bold tracking-widest">EBITDA (LTM)</span>
                    <strong className="text-2xl text-[#00b8b2] font-black">{formatFinancial(ebitda)}</strong>
                    <span className="text-[11px] text-[#00b8b2] font-medium">{margin ? `Margem ${margin}%` : 'Margem Verificada'}</span>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between h-[150px]">
                    <span className="text-[10px] text-[#98a2b3] uppercase font-bold tracking-widest">ROI Estimado</span>
                    <strong className="text-2xl text-white font-black">{roi ? `${roi}%` : 'Sob NDA'}</strong>
                    <span className="text-[11px] text-[#98a2b3]">Expectativa Anual</span>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between h-[150px]">
                    <span className="text-[10px] text-[#98a2b3] uppercase font-bold tracking-widest">Payback</span>
                    <strong className="text-2xl text-white font-black">{payback ? `${payback} meses` : 'Sob NDA'}</strong>
                    <span className="text-[11px] text-[#98a2b3]">Retorno Estimado</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                 <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <BarChart3 size={18} className="text-[#00b8b2]" />
                        <h4 className="text-white font-bold">Crescimento e Histórico</h4>
                    </div>
                    <p className="text-sm text-[#98a2b3] leading-relaxed mb-4">
                        {financialHistory || 'Apresenta histórico consistente de crescimento nos últimos 3 anos, com auditoria interna disponível para revisão na fase de Due Diligence.'}
                    </p>
                    <div className="flex items-center gap-4 text-[12px]">
                        <span className="text-[#00b8b2] font-bold">CAGR: {growth ? `${growth}%` : 'Verificado'}</span>
                        <span className="text-[#98a2b3]">|</span>
                        <span className="text-[#98a2b3]">DRE Auditada</span>
                    </div>
                 </div>

                 <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <Globe size={18} className="text-[#00b8b2]" />
                        <h4 className="text-white font-bold">Estratégia de Expansão</h4>
                    </div>
                    <p className="text-sm text-[#98a2b3] leading-relaxed">
                        {growthStrategy || 'Plano de expansão focado em novos mercados e otimização de margens operacionais via tecnologia.'}
                    </p>
                 </div>
              </div>
            </ContentSection>

            <ContentSection icon={Layers} title="Estrutura e Governança" tag="Corporate Governance">
               <div className="p-8 rounded-[28px] border border-white/5 bg-white/5">
                  <div className="flex flex-wrap gap-8">
                     <div className="flex-1 min-w-[240px]">
                        <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Configuração do Deal</h4>
                        <p className="text-[#98a2b3] leading-relaxed">{operation || 'Venda de controle (Majority Stake) ou Investimento de Growth (Minority).'}</p>
                     </div>
                     <div className="w-px bg-white/10 hidden md:block" />
                     <div className="flex-1 min-w-[240px]">
                        <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Governança</h4>
                        <ul className="space-y-2">
                           {['Conselho Consultivo Ativo', 'Compliance Verificado', 'Controles Financeiros Big Four', 'Reporting Mensal'].map((item, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm text-[#98a2b3]">
                                 <CheckCircle size={14} className="text-[#00b8b2]" />
                                 {item}
                              </li>
                           ))}
                        </ul>
                     </div>
                  </div>
               </div>
            </ContentSection>

            <ContentSection icon={UserCheck} title="Mapeamento de Investidor" tag="Deal Fit">
              <div className="p-8 rounded-[28px] border border-white/5 bg-white/5 flex flex-col md:flex-row gap-8 items-center">
                 <div className="flex-1">
                    <h4 className="text-lg text-white font-bold mb-4">Perfil Alvo</h4>
                    <p className="text-[#cfd8e6] leading-relaxed">
                        {investorProfile || 'Investidores estratégicos ou financeiros com tese focada em ativos de alto rendimento e governança sólida.'}
                    </p>
                 </div>
                 <div className="p-6 rounded-2xl bg-black/40 border border-[#00b8b2]/30 flex flex-col items-center justify-center text-center min-w-[220px]">
                    <Lock size={24} className="text-[#00b8b2] mb-3" />
                    <span className="text-[10px] text-[#98a2b3] uppercase font-black mb-1">Confidencialidade</span>
                    <strong className="text-white text-sm">Deal Room Restrito</strong>
                 </div>
              </div>
            </ContentSection>

            <ContentSection icon={ArrowRight} title="Processo de Transação" tag="Transaction Roadmap">
              <div className="relative pb-4">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2 hidden md:block" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                  {[
                    { n: 'I', t: 'NDA & CIM', d: 'Liberação de Memorando detalhado.' },
                    { n: 'II', t: 'Management', d: 'Call com C-level e visão estratégica.' },
                    { n: 'III', t: 'LOI & NBO', d: 'Estruturação de oferta não vinculante.' },
                    { n: 'IV', t: 'VDR & Audit', d: 'Due Diligence técnica e financeira.' }
                  ].map((step, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-[#00b8b2]/5 border border-[#00b8b2]/10 backdrop-blur-sm text-center group hover:bg-[#00b8b2]/10 transition-all">
                      <div className="w-10 h-10 rounded-full bg-[#00b8b2] text-white flex items-center justify-center font-black mx-auto mb-4 shadow-lg shadow-[#00b8b2]/20">
                        {step.n}
                      </div>
                      <h4 className="text-white font-bold mb-2">{step.t}</h4>
                      <p className="text-[11px] text-[#98a2b3] leading-relaxed">{step.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ContentSection>
          </div>

          {/* Oportunidades Similares */}
          {similarOpportunities.length > 0 && (
            <div className={styles.similarSection}>
              <h2 className="text-2xl font-black text-white mb-8">Outros Deals Premium</h2>
              <div className={styles.similarGrid}>
                {similarOpportunities.map(opp => (
                  <OpportunityCard key={opp.id} opportunity={opp} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Coluna 3: Sidebar Summary Specialized */}
        <div className={styles.summaryColumn}>
          <PremiumSummarySidebar 
            listing={listing}
            onInterest={onInterest}
            onFavorite={onFavorite}
            isFavorited={isFavorited}
          />
          
          <div className="mt-4 p-6 rounded-[24px] border border-[#00b8b2]/15 bg-[#00b8b2]/5 text-[11px] text-[#98a2b3] leading-relaxed italic">
             Este deal faz parte do portfólio **Finanhub Private**. A intermediação é realizada exclusivamente por assessores certificados.
          </div>
        </div>
      </main>
    </div>
  );
};
