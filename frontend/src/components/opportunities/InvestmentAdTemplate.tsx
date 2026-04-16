'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Info, 
  Zap, 
  TrendingUp, 
  Layers, 
  HelpCircle, 
  AlertTriangle, 
  UserCheck, 
  ArrowRight,
  Target,
  FileText
} from 'lucide-react';
import { OpportunitySidebar } from '@/components/opportunities/OpportunitySidebar';
import { OpportunityCard } from '@/components/opportunities/OpportunityCard';
import { InvestmentSummarySidebar } from './InvestmentSummarySidebar';
import { ListingImage } from '../common/ListingImage';
import styles from '@/styles/fh-ad-detail.module.css';

interface InvestmentAdTemplateProps {
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

export const InvestmentAdTemplate: React.FC<InvestmentAdTemplateProps> = ({
  listing,
  similarOpportunities,
  onInterest,
  onFavorite,
  isFavorited,
  onFilterChange
}) => {
  // Breadcrumbs estáveis
  const breadcrumbs = [
    { label: 'Início', href: '/' },
    { label: 'Oportunidades', href: '/oportunidades' },
    { label: 'Investimentos', href: `/oportunidades?category=${listing.categoryId}` },
    { label: listing.title, active: true }
  ];

  // Chips padronizados
  const tags = [
    listing.subtitle || 'Oportunidade de Investimento',
    listing.state || 'Brasil',
    listing.verified ? 'Auditado Finanhub' : 'Em Qualificação',
    listing.operationStructure || 'Equity'
  ];

  // Helper para buscar atributos dinâmicos
  const getAttr = (name: string) => {
    const attr = listing.attrValues?.find((av: any) => 
      av.attribute?.name?.toLowerCase() === name.toLowerCase() || 
      av.attribute?.label?.toLowerCase() === name.toLowerCase()
    );
    return attr?.valueStr || attr?.valueNum || null;
  };

  return (
    <div className={styles.fhDetailWrapper}>
      <div className={styles.glowTeal} />
      
      <main className={styles.mainLayout}>
        {/* Coluna 1: Filtro Lateral (SHARED FILTER) */}
        <div className={styles.filterColumn}>
          <div className={styles.filterCard}>
            <OpportunitySidebar onFilterChange={onFilterChange} />
          </div>
          
          <div className="mt-4 p-5 rounded-[22px] bg-gradient-to-b from-[#00b8b2]/10 to-transparent border border-[#00b8b2]/15">
             <p className="text-[13px] text-[#dde9f6] leading-relaxed">
               Busca um pool específico ou co-investimento estratégico? Fale com nossa mesa de Private Equities.
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
            <span className={styles.categoryBadge}>Investimentos</span>
            <h1>{listing.title}</h1>
            
            <p className="text-[#cfd8e6] text-base mb-6 max-w-[920px]">
              {listing.description ? (listing.description.length > 200 ? `${listing.description.substring(0, 200)}...` : listing.description) : 'Oportunidade de aporte estratégico sob análise da curadoria.'}
            </p>

            <div className={styles.chipsContainer}>
              {tags.map((tag, i) => (
                <span key={i} className={styles.chip}>{tag}</span>
              ))}
            </div>
          </div>

          {/* Galeria Premium (Identidade Visual 100% igual) */}
          <div className={styles.gallery}>
            <div className={styles.mainImage}>
               <div className="absolute top-4 left-4 z-10 flex gap-2">
                 <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest">Captação Aberta</span>
                 {listing.verified && <span className="px-3 py-1 rounded-full bg-[#00b8b2]/20 backdrop-blur-md border border-[#00b8b2]/30 text-[10px] font-bold text-[#d8fffc] uppercase tracking-widest">Verificado</span>}
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
                      alt={`Investment thumb ${idx + 1}`} 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600';
                      }}
                    />
                  </div>
                ))
              ) : (
                [1, 2, 3, 4].map(idx => (
                  <div key={idx} className="h-[110px] rounded-2xl overflow-hidden border border-white/5 hover:border-[#00b8b2]/40 transition-all cursor-pointer">
                    <img 
                      src={`https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600&sig=${idx}`} 
                      className="w-full h-full object-cover" 
                      alt="Investment placeholder thumb" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1454165833767-027ffea9e77b?auto=format&fit=crop&q=80&w=600';
                      }}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Seções de Conteúdo (Adaptadas para Investimentos) */}
          <div className="space-y-6">
            <ContentSection icon={Info} title="Sobre o Investimento" tag="Asset Summary">
              <p className="leading-relaxed">{listing.description}</p>
            </ContentSection>

            <ContentSection icon={Zap} title="Destaques do Investimento" tag="Upside">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { t: 'Modelo de Receita', d: getAttr('modeloMonetizacao') || 'Estrutura comercial baseada em escala e previsibilidade.' },
                  { t: 'Setor de Atuação', d: getAttr('setor') || 'Mercado com alto potencial de crescimento.' },
                  { t: 'Ticket Médio', d: getAttr('ticketMinimo') ? `A partir de R$ ${Number(getAttr('ticketMinimo')).toLocaleString('pt-BR')}` : (listing.price ? `A partir de R$ ${Number(listing.price).toLocaleString('pt-BR')}` : 'Sob consulta') },
                  { t: 'Histórico', d: getAttr('historicoProjeto') || 'Operação com track record verificado.' }
                ].map((item, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5 group hover:border-[#00b8b2]/20 transition-all">
                    <strong className="block text-white mb-2 text-sm">{item.t}</strong>
                    <p className="text-sm text-[#98a2b3] line-clamp-2">{item.d}</p>
                  </div>
                ))}
              </div>
            </ContentSection>

            <ContentSection icon={TrendingUp} title="Indicadores do Investimento" tag="Performance">
              <div className={styles.metricGrid}>
                <div className={styles.metricItem}>
                  <span className={styles.label}>Projeção de Retorno</span>
                  <strong className={styles.value}>
                    {getAttr('projecaoRetorno') || '18% - 24%'}
                  </strong>
                  <em className="text-[12px] text-[#00b8b2] font-bold not-italic mt-2">Target IRR / Yr</em>
                </div>
                <div className={styles.metricItem}>
                  <span className={styles.label}>Prazo Estimado</span>
                  <strong className={styles.value}>
                    {getAttr('prazoRetorno') || '36 a 48 meses'}
                  </strong>
                  <em className="text-[12px] text-[#00b8b2] font-bold not-italic mt-2">Cycle Horizon</em>
                </div>
                <div className={styles.metricItem}>
                   <span className={styles.label}>Valuation Post-Money</span>
                   <strong className={styles.value}>
                     {listing.ebitda ? `R$ ${(Number(listing.ebitda)/1000000).toFixed(1)}M` : 'Sob Consulta'}
                   </strong>
                   <em className="text-[12px] text-[#00b8b2] font-bold not-italic mt-2">Valuation Estimado</em>
                </div>
              </div>
            </ContentSection>

            <ContentSection icon={Layers} title="Estrutura do Investimento" tag="Equity/Debt">
              <p className="leading-relaxed">
                {getAttr('estruturaJuridica') || 'A operação prevê a emissão de debêntures conversíveis em equity ou participação direta via SPE, com regras claras de governança e tag-along.'}
              </p>
            </ContentSection>

            <ContentSection icon={Target} title="Tese de Investimento" tag="Strategy">
              <p className="leading-relaxed">
                 Esta rodada visa acelerar a expansão comercial e consolidar a liderança no nicho de mercado através de tecnologia proprietária e ganho de escala operacional.
              </p>
            </ContentSection>

            <ContentSection icon={AlertTriangle} title="Riscos do Investimento" tag="Risk Management">
              <div className="p-5 rounded-2xl bg-[#ff4d4d]/5 border border-[#ff4d4d]/10">
                <p className="text-sm text-[#98a2b3] leading-relaxed">
                  Os riscos de execução e de mercado são mitigados por garantias em ativos reais e um time de gestão com track record comprovado em ciclos econômicos variados.
                </p>
              </div>
            </ContentSection>

            <ContentSection icon={UserCheck} title="Perfil Ideal do Investidor" tag="Investor Profile">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                   <h4 className="text-white font-bold mb-3 text-sm">Qualificação</h4>
                   <p className="text-sm text-[#98a2b3] leading-relaxed">
                     {getAttr('perfilInvestidor') || 'Investidores qualificados buscando diversificação de portfólio.'}
                   </p>
                 </div>
                 <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                   <h4 className="text-white font-bold mb-3 text-sm">Garantias</h4>
                   <p className="text-sm text-[#98a2b3] leading-relaxed">
                     {getAttr('garantias') || 'Contrato de mútuo conversível com garantias reais e seguro garantia sobre a operação principal.'}
                   </p>
                 </div>
              </div>
            </ContentSection>

            <ContentSection icon={ArrowRight} title="Próximos Passos" tag="Analysis Pipeline">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {[
                  { n: '01', t: 'Assinatura', d: 'Liberação de NDA e Deck completo.' },
                  { n: '02', t: 'Due Diligence', d: 'Acesso ao Data Room e reuniões.' },
                  { n: '03', t: 'Aporte', d: 'Assinatura do Term Sheet e transferência.' },
                  { n: '04', t: 'Follow-up', d: 'Reporting mensal de performance.' }
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

          {/* Barra de Relacionamento (Horizontal CTA) adaptada para Investimento */}
          <div className={styles.relationshipBar}>
            <div>
              <h4 className="text-xl font-bold text-white mb-2">Canal de Investimento Direto</h4>
              <p className="text-sm text-[#98a2b3]">Agende uma apresentação técnica com o time de M&A ou solicite o One Page do ativo.</p>
            </div>
            <button 
              onClick={onInterest}
              className={styles.ctaButton + " " + styles.primaryCta} 
              style={{ width: 'auto', paddingLeft: '2rem', paddingRight: '2rem' }}
            >
              Iniciar Conversa
            </button>
          </div>

          {/* Oportunidades Similares */}
          {similarOpportunities.length > 0 && (
            <div className={styles.similarSection}>
              <h2>Outros Investimentos Stratégicos</h2>
              <div className={styles.similarGrid}>
                {similarOpportunities.map(opp => (
                  <OpportunityCard key={opp.id} opportunity={opp} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Coluna 3: Sidebar Summary Specialized for Investments */}
        <div className={styles.summaryColumn}>
          <InvestmentSummarySidebar 
            listing={listing}
            onInterest={onInterest}
            onFavorite={onFavorite}
            isFavorited={isFavorited}
          />
          
          <div className="mt-4 p-5 rounded-[22px] border border-white/5 bg-white/5 text-[11px] text-[#98a2b3] leading-relaxed italic">
             Este ativo possui curadoria exclusiva Finanhub Private. Desempenho passado não garante resultados futuros. Consulte os termos de risco.
          </div>
        </div>
      </main>
    </div>
  );
};
