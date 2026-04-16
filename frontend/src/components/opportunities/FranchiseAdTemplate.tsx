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
  ArrowRight
} from 'lucide-react';
import { OpportunitySidebar } from '@/components/opportunities/OpportunitySidebar';
import { OpportunityCard } from '@/components/opportunities/OpportunityCard';
import { FranchiseSummarySidebar } from './FranchiseSummarySidebar';
import { ListingImage } from '../common/ListingImage';
import styles from '@/styles/fh-ad-detail.module.css';

interface FranchiseAdTemplateProps {
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

export const FranchiseAdTemplate: React.FC<FranchiseAdTemplateProps> = ({
  listing,
  similarOpportunities,
  onInterest,
  onFavorite,
  isFavorited,
  onFilterChange
}) => {
  // Breadcrumbs — mesma estrutura da página de Empresas
  const breadcrumbs = [
    { label: 'Início', href: '/' },
    { label: 'Oportunidades', href: '/oportunidades' },
    { label: listing.category?.name || 'Franquias e Licenciamento', href: `/oportunidades?category=${listing.categoryId}` },
    { label: listing.title, active: true }
  ];

  // Helper para buscar atributos dinâmicos do banco
  const getAttr = (name: string) => {
    const attr = listing.attrValues?.find((av: any) => 
      av.attribute?.name?.toLowerCase() === name.toLowerCase() || 
      av.attribute?.label?.toLowerCase() === name.toLowerCase()
    );
    return attr?.valueStr || attr?.valueNum || null;
  };

  const formatCurrency = (val: any) => {
    if (!val || isNaN(Number(val))) return 'Sob consulta';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val));
  };

  // Chips padronizados — mesma estrutura, conteúdo de franquia
  const tags = [
    getAttr('operationModel') || 'Modelo Validado',
    listing.state || 'Brasil',
    listing.verified ? 'Marca Auditada' : 'Em Qualificação',
    getAttr('operationModel') 
      ? (String(getAttr('operationModel')).length > 20 ? 'Expansão Ativa' : String(getAttr('operationModel')))
      : 'Expansão Ativa'
  ];

  return (
    <div className={styles.fhDetailWrapper}>
      <div className={styles.glowTeal} />
      
      <main className={styles.mainLayout}>
        {/* Coluna 1: Filtro Lateral (MESMO COMPONENTE DE /OPORTUNIDADES) */}
        <div className={styles.filterColumn}>
          <div className={styles.filterCard}>
            <OpportunitySidebar onFilterChange={onFilterChange} />
          </div>
          
          <div className="mt-4 p-5 rounded-[22px] bg-gradient-to-b from-[#00b8b2]/10 to-transparent border border-[#00b8b2]/15">
             <p className="text-[13px] text-[#dde9f6] leading-relaxed">
               Precisa de ajuda para encontrar a franquia ideal? Fale com nosso concierge de expansão.
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
            <span className={styles.categoryBadge}>{listing.category?.name || 'Franquias e Licenciamento'}</span>
            <h1>{listing.title}</h1>
            
            <p className="text-[#cfd8e6] text-base mb-6 max-w-[920px]">
              {listing.description ? (listing.description.length > 200 ? `${listing.description.substring(0, 200)}...` : listing.description) : 'Oportunidade de expansão com modelo de negócio replicável e operação validada.'}
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
                 <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest">Expansão Ativa</span>
                 {listing.verified && <span className="px-3 py-1 rounded-full bg-[#00b8b2]/20 backdrop-blur-md border border-[#00b8b2]/30 text-[10px] font-bold text-[#d8fffc] uppercase tracking-widest">Marca Auditada</span>}
               </div>

               <ListingImage 
                 src={listing.media?.find((m: any) => m.isCover)?.url || listing.media?.[0]?.url || listing.logoUrl || listing.imageUrl} 
                 category={listing.category?.slug} 
                 alt={listing.title} 
                 className="w-full h-full object-cover"
               />
            </div>

            {/* Thumbs Reais do Modelo ou Placeholders */}
            <div className="grid grid-cols-4 gap-4 mt-4">
              {listing.media && listing.media.length > 0 ? (
                listing.media.slice(0, 4).map((m: any, idx: number) => (
                  <div key={m.id || idx} className="h-[110px] rounded-2xl overflow-hidden border border-white/5 hover:border-[#00b8b2]/40 transition-all cursor-pointer">
                    <img 
                      src={m.url} 
                      className="w-full h-full object-cover" 
                      alt={`Franchise thumb ${idx + 1}`} 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=600';
                      }}
                    />
                  </div>
                ))
              ) : (
                [1, 2, 3, 4].map(idx => (
                  <div key={idx} className="h-[110px] rounded-2xl overflow-hidden border border-white/5 hover:border-[#00b8b2]/40 transition-all cursor-pointer">
                    <img 
                      src={`https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=600&sig=${idx}`} 
                      className="w-full h-full object-cover" 
                      alt="Franchise placeholder thumb" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1502474136161-7c9d04bbad7b?auto=format&fit=crop&q=80&w=600';
                      }}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Seções de Conteúdo — 9 Seções (PARIDADE 1:1 com Empresas) */}
          <div className="space-y-6">
            <ContentSection icon={Info} title="Sobre a Franquia" tag="Snapshot">
              <p className="leading-relaxed">{listing.description}</p>
            </ContentSection>

            <ContentSection icon={Zap} title="Destaques da Franquia" tag="Diferenciais">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { t: 'Modelo de Operação', d: getAttr('operationModel') || 'Estrutura replicável com alto nível de padronização e suporte contínuo.' },
                  { t: 'Suporte Oferecido', d: getAttr('supportOffered') || 'Apoio completo na escolha do ponto, implantação e marketing institucional.' },
                  { t: 'Treinamento', d: getAttr('trainingIncluded') || 'Programa de capacitação para franqueado e equipe operacional.' },
                  { t: 'Exclusividade Territorial', d: getAttr('territorialExclusivity') || 'Proteção de raio territorial para operação exclusiva na região.' }
                ].map((item, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5 group hover:border-[#00b8b2]/20 transition-all">
                    <strong className="block text-white mb-2 text-sm">{item.t}</strong>
                    <p className="text-sm text-[#98a2b3] line-clamp-2">{item.d}</p>
                  </div>
                ))}
              </div>
            </ContentSection>

            <ContentSection icon={TrendingUp} title="Indicadores Financeiros" tag="Financeiro">
              <div className={styles.metricGrid}>
                <div className={styles.metricItem}>
                  <span className={styles.label}>Investimento Total</span>
                  <strong className={styles.value}>
                    {formatCurrency(getAttr('initialInvestmentTotal') || listing.price)}
                  </strong>
                  <em className="text-[12px] text-[#00b8b2] font-bold not-italic mt-2">Capital Inicial Completo</em>
                </div>
                <div className={styles.metricItem}>
                  <span className={styles.label}>Prazo de Retorno</span>
                  <strong className={styles.value}>
                    {getAttr('estimatedPayback') || '18–24 meses'}
                  </strong>
                  <em className="text-[12px] text-[#00b8b2] font-bold not-italic mt-2">
                    Estimated Payback
                  </em>
                </div>
                <div className={styles.metricItem}>
                   <span className={styles.label}>Fat. Médio Mensal</span>
                   <strong className={styles.value}>
                     {formatCurrency(getAttr('averageEstimatedRevenue'))}
                   </strong>
                   <em className="text-[12px] text-[#00b8b2] font-bold not-italic mt-2">Avg Revenue / Mo</em>
                </div>
              </div>
            </ContentSection>

            <ContentSection icon={Layers} title="Estrutura Operacional" tag="Operacional">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                  <h4 className="text-[#00b8b2] font-bold mb-2 text-xs uppercase tracking-widest">Taxa de Royalties</h4>
                  <p className="text-sm text-[#dde9f6]">
                    {getAttr('royaltiesFee') || 'Percentual fixado sobre o faturamento bruto mensal da unidade.'}
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                  <h4 className="text-[#00b8b2] font-bold mb-2 text-xs uppercase tracking-widest">Taxa de Marketing</h4>
                  <p className="text-sm text-[#dde9f6]">
                    {getAttr('marketingFee') || 'Contribuição para o fundo nacional de propaganda e fortalecimento da marca.'}
                  </p>
                </div>
              </div>
              <p className="leading-relaxed mt-6">
                {getAttr('operationModel') 
                  ? `Modelo de operação: ${getAttr('operationModel')}. ` 
                  : ''}
                A franquia oferece uma operação padronizada com suporte completo do franqueador, incluindo manuais operacionais, sistemas integrados e acompanhamento regional contínuo.
              </p>
            </ContentSection>

            <ContentSection icon={HelpCircle} title="Tese da Oportunidade" tag="Expansion Strategy">
              <p className="leading-relaxed">
                {getAttr('expansionRegion') ? `Foco estratégico de expansão na região ${getAttr('expansionRegion')}. ` : ''}
                A marca possui um modelo de negócio consolidado e busca parceiros para capilarizar a presença no mercado nacional através de unidades padronizadas com previsibilidade de retorno e operação validada.
              </p>
            </ContentSection>

            <ContentSection icon={AlertTriangle} title="Riscos e Oportunidades" tag="Risk Assessment">
              <p className="leading-relaxed">
                O principal risco identificado está na seleção do ponto comercial e na curva de aprendizado operacional do franqueado, ambos mitigados pelo programa de suporte intensivo da franqueadora. A oportunidade reside na escalabilidade do modelo e na força da marca em mercados ainda não explorados regionalmente.
              </p>
            </ContentSection>

            <ContentSection icon={UserCheck} title="Perfil Ideal do Franqueado" tag="Selection">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                   <h4 className="text-white font-bold mb-3 text-sm">Perfil Recomendado</h4>
                   <p className="text-sm text-[#98a2b3] leading-relaxed">
                     {getAttr('idealFranchiseeProfile') || 'Empreendedores com perfil gestor, resiliência e foco na excelência operacional para manter o padrão da rede.'}
                   </p>
                 </div>
                 <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                   <h4 className="text-white font-bold mb-3 text-sm">Requisitos de Entrada</h4>
                   <p className="text-sm text-[#98a2b3] leading-relaxed">
                     {getAttr('entryRequirements') || 'Capital disponível comprovado, disponibilidade para participar do treinamento presencial e dedicação integral ao negócio.'}
                   </p>
                 </div>
              </div>
            </ContentSection>

            <ContentSection icon={ArrowRight} title="Próximos Passos" tag="Onboarding">
              <p className="text-sm text-[#98a2b3] mb-6">
                {listing.nextSteps || 'O processo de seleção de franqueados segue as etapas padronizadas do programa de expansão Finanhub.'}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {[
                  { n: '01', t: 'Cadastro', d: 'Envio de dados e análise do perfil do candidato.' },
                  { n: '02', t: 'COF', d: 'Recebimento e análise da Circular de Oferta.' },
                  { n: '03', t: 'Entrevista', d: 'Alinhamento com o time de expansão da marca.' },
                  { n: '04', t: 'Contrato', d: 'Assinatura, treinamento e início da operação.' }
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
              <h4 className="text-xl font-bold text-white mb-2">Canal de Expansão Direto</h4>
              <p className="text-sm text-[#98a2b3]">Deseja receber a apresentação comercial detalhada ou agendar uma reunião com o time de expansão?</p>
            </div>
            <button 
              onClick={onInterest}
              className={styles.ctaButton + " " + styles.primaryCta} 
              style={{ width: 'auto', paddingLeft: '2rem', paddingRight: '2rem' }}
            >
              Falar com Expansão
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
          <FranchiseSummarySidebar 
            listing={listing}
            onInterest={onInterest}
            onFavorite={onFavorite}
            isFavorited={isFavorited}
          />
          
          <div className="mt-4 p-5 rounded-[22px] border border-white/5 bg-white/5 text-[11px] text-[#98a2b3] leading-relaxed italic">
             Este anúncio faz parte do programa de expansão acelerada Finanhub. As projeções financeiras dependem da gestão do franqueado e localização do ponto.
          </div>
        </div>
      </main>
    </div>
  );
};
