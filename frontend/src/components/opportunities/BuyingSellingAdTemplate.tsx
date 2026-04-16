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
  ArrowRight
} from 'lucide-react';
import { OpportunitySidebar } from '@/components/opportunities/OpportunitySidebar';
import { OpportunityCard } from '@/components/opportunities/OpportunityCard';
import { AdSummarySidebar } from './AdSummarySidebar';
import { ListingImage } from '../common/ListingImage';
import styles from '@/styles/fh-ad-detail.module.css';

interface BuyingSellingAdTemplateProps {
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

export const BuyingSellingAdTemplate: React.FC<BuyingSellingAdTemplateProps> = ({
  listing,
  similarOpportunities,
  onInterest,
  onFavorite,
  isFavorited,
  onFilterChange
}) => {
  // Breadcrumbs estáveis conforme o modelo aprovado
  const breadcrumbs = [
    { label: 'Início', href: '/' },
    { label: 'Oportunidades', href: '/oportunidades' },
    { label: listing.category?.name || 'Compra e Venda de Empresas', href: `/oportunidades?category=${listing.categoryId}` },
    { label: listing.title, active: true }
  ];

  // Chips padronizados conforme o design oficial
  const tags = [
    listing.subtitle || 'Oportunidade de Negócio',
    listing.state || 'Brasil',
    listing.verified ? 'Ativo Auditado' : 'Aguardando Validação',
    listing.operationStructure ? (listing.operationStructure.length > 20 ? 'M&A Strategy' : listing.operationStructure) : 'M&A Strategy'
  ];

  return (
    <div className={styles.fhDetailWrapper}>
      <div className={styles.glowTeal} />
      
      <main className={styles.mainLayout}>
        {/* Coluna 1: Filtro Lateral (REPETE O FILTRO DE /OPORTUNIDADES) */}
        <div className={styles.filterColumn}>
          <div className={styles.filterCard}>
            <OpportunitySidebar onFilterChange={onFilterChange} />
          </div>
          
          <div className="mt-4 p-5 rounded-[22px] bg-gradient-to-b from-[#00b8b2]/10 to-transparent border border-[#00b8b2]/15">
             <p className="text-[13px] text-[#dde9f6] leading-relaxed">
               Precisa de ajuda para encontrar o ativo ideal? Fale com nosso concierge private.
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
            <span className={styles.categoryBadge}>{listing.category?.name || 'Compra e Venda de Empresas'}</span>
            <h1>{listing.title}</h1>
            
            <p className="text-[#cfd8e6] text-base mb-6 max-w-[920px]">
              {listing.description ? (listing.description.length > 200 ? `${listing.description.substring(0, 200)}...` : listing.description) : 'Detalhamento estratégico pendente de revisão final.'}
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
                 <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest">Publicado Recentemente</span>
                 {listing.verified && <span className="px-3 py-1 rounded-full bg-[#00b8b2]/20 backdrop-blur-md border border-[#00b8b2]/30 text-[10px] font-bold text-[#d8fffc] uppercase tracking-widest">Ativo Auditado</span>}
               </div>

               <ListingImage 
                 src={listing.logoUrl || listing.imageUrl} 
                 category={listing.category?.slug} 
                 alt={listing.title} 
                 className="w-full h-full object-cover"
               />
            </div>

            {/* Thumbs Reais do Modelo */}
            <div className="grid grid-cols-4 gap-4 mt-4">
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className="h-[110px] rounded-2xl overflow-hidden border border-white/5 hover:border-[#00b8b2]/40 transition-all cursor-pointer">
                  <img src={`https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=80&sig=${idx}`} className="w-full h-full object-cover" alt="Gallery thumb" />
                </div>
              ))}
            </div>
          </div>

          {/* Seções de Conteúdo Obrigatórias (Cards 1:1 com HTML) */}
          <div className="space-y-6">
            <ContentSection icon={Info} title="Sobre a Empresa" tag="Snapshot">
              <p className="leading-relaxed">{listing.description}</p>
            </ContentSection>

            <ContentSection icon={Zap} title="Destaques Estratégicos" tag="Diferenciais">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { t: 'Modelo de Receita', d: listing.revenueModel || 'Estrutura comercial com base em contratos ou faturamento recorrente.' },
                  { t: 'Base de Clientes', d: listing.clientBaseCount ? `${listing.clientBaseCount} clientes ativos` : 'Interface B2B/B2C com base fiel e histórico consolidado.' },
                  { t: 'Ticket Médio', d: listing.avgTicket ? `R$ ${Number(listing.avgTicket).toLocaleString('pt-BR')}` : 'Posicionamento competitivo alinhado ao setor.' },
                  { t: 'Tempo de Mercado', d: listing.marketTime ? `${listing.marketTime} anos de operação` : 'Histórico operacional verificado pelos originadores.' }
                ].map((item, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5 group hover:border-[#00b8b2]/20 transition-all">
                    <strong className="block text-white mb-2 text-sm">{item.t}</strong>
                    <p className="text-sm text-[#98a2b3] line-clamp-2">{item.d}</p>
                  </div>
                ))}
              </div>
            </ContentSection>

            <ContentSection icon={TrendingUp} title="Indicadores e Métricas" tag="Financeiro">
              <div className={styles.metricGrid}>
                <div className={styles.metricItem}>
                  <span className={styles.label}>Receita Anual</span>
                  <strong className={styles.value}>
                    {listing.annualRevenue ? `R$ ${(Number(listing.annualRevenue)/1000000).toFixed(1)}M` : 'Sob Consulta'}
                  </strong>
                  <em className="text-[12px] text-[#00b8b2] font-bold not-italic mt-2">LTM (Last Twelve Months)</em>
                </div>
                <div className={styles.metricItem}>
                  <span className={styles.label}>EBITDA (LTM)</span>
                  <strong className={styles.value}>
                    {listing.ebitda ? `R$ ${(Number(listing.ebitda)/1000).toFixed(0)}K` : 'Sigilo Negoc.'}
                  </strong>
                  <em className="text-[12px] text-[#00b8b2] font-bold not-italic mt-2">
                    {listing.ebitdaMargin ? `Margem ${listing.ebitdaMargin}%` : 'Margem Auditada'}
                  </em>
                </div>
                <div className={styles.metricItem}>
                   <span className={styles.label}>Valuation Est.</span>
                   <strong className={styles.value}>
                     {listing.valuationMethod || 'Multiple M&A'}
                   </strong>
                   <em className="text-[12px] text-[#00b8b2] font-bold not-italic mt-2">Método Sugerido</em>
                </div>
              </div>
            </ContentSection>

            <ContentSection icon={Layers} title="Estrutura da Operação" tag="Operacional">
              <p className="leading-relaxed">
                {listing.operationStructure || 'A transação contempla a venda de 100% das cotas da sociedade, incluindo todos os ativos fixos, carteira de clientes, marca e propriedade intelectual.'}
              </p>
            </ContentSection>

            <ContentSection icon={HelpCircle} title="Motivo da Venda" tag="Reason">
              <p className="leading-relaxed">
                {listing.reasonForSale || 'O fundador está buscando transferir o ativo para um investidor estratégico capaz de executar o próximo salto de crescimento da operação.'}
              </p>
            </ContentSection>

            <ContentSection icon={AlertTriangle} title="Riscos e Oportunidades" tag="Risk Assessment">
              <p className="leading-relaxed">
                O principal risco identificado é a dependência do time de vendas atual, o que está sendo mitigado pela implementação de um CRM robusto. A oportunidade reside na expansão para mercados adjacentes ainda não explorados pela marca.
              </p>
            </ContentSection>

            <ContentSection icon={UserCheck} title="Perfil Ideal do Comprador" tag="Buyer Profile">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                   <h4 className="text-white font-bold mb-3 text-sm">Perfil Recomendado</h4>
                   <p className="text-sm text-[#98a2b3] leading-relaxed">
                     {listing.buyerProfile || 'Empresas do mesmo setor buscando M&A ou Grupos de Investimento buscando consolidar mercado.'}
                   </p>
                 </div>
                 <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                   <h4 className="text-white font-bold mb-3 text-sm">Confidencialidade</h4>
                   <p className="text-sm text-[#98a2b3] leading-relaxed">
                     {listing.confidentialityNote || 'Este anúncio requer a assinatura de NDA para acesso a dados sensíveis.'}
                   </p>
                 </div>
              </div>
            </ContentSection>

            <ContentSection icon={ArrowRight} title="Próximos Passos" tag="M&A Process">
              <p className="text-sm text-[#98a2b3] mb-6">
                {listing.nextSteps || 'O processo de aquisição segue as etapas padrão de M&A da Finanhub Corporate.'}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {[
                  { n: '01', t: 'NDA', d: 'Confirmação de interesse e assinatura de NDA.' },
                  { n: '02', t: 'Teaser', d: 'Acesso ao memorando de informações detalhado.' },
                  { n: '03', t: 'Q&A', d: 'Reunião estratégica com os fundadores.' },
                  { n: '04', t: 'LOI', d: 'Envio de Proposta (Letter of Intent).' }
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
              <h4 className="text-xl font-bold text-white mb-2">Canal de Relacionamento Direto</h4>
              <p className="text-sm text-[#98a2b3]">Deseja suporte técnico para analisar este ativo ou agendar uma reunião com os originadores?</p>
            </div>
            <button 
              onClick={onInterest}
              className={styles.ctaButton + " " + styles.primaryCta} 
              style={{ width: 'auto', paddingLeft: '2rem', paddingRight: '2rem' }}
            >
              Falar com Especialista M&A
            </button>
          </div>

          {/* Oportunidades Similares */}
          {similarOpportunities.length > 0 && (
            <div className={styles.similarSection}>
              <h2>Oportunidades que podem te interessar</h2>
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
          <AdSummarySidebar 
            listing={listing}
            onInterest={onInterest}
            onFavorite={onFavorite}
            isFavorited={isFavorited}
          />
          
          <div className="mt-4 p-5 rounded-[22px] border border-white/5 bg-white/5 text-[11px] text-[#98a2b3] leading-relaxed italic">
             Este anúncio é verificado pela Finanhub Corporate. Todos os dados financeiros são baseados em informações fornecidas pelo anunciante e validadas por nossa equipe.
          </div>
        </div>
      </main>
    </div>
  );
};
