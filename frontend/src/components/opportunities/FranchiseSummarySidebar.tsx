'use client';

import React from 'react';
import { 
  MessageCircle, 
  Heart, 
  Share2,
  ShieldCheck,
  Target
} from 'lucide-react';
import styles from '@/styles/fh-ad-detail.module.css';

interface FranchiseSummarySidebarProps {
  listing: {
    id: string;
    price: string | number;
    category?: { name: string };
    city: string;
    state: string;
    attrValues?: any[];
    company?: {
        name: string;
        isVerified: boolean;
        createdAt?: string;
    };
  };
  onInterest: () => void;
  onFavorite: () => void;
  isFavorited?: boolean;
}

export const FranchiseSummarySidebar: React.FC<FranchiseSummarySidebarProps> = ({ 
  listing, 
  onInterest, 
  onFavorite,
  isFavorited 
}) => {
  // Helper para buscar atributos dinâmicos
  const getAttr = (name: string) => {
    const attr = listing.attrValues?.find((av: any) => 
      av.attribute?.name?.toLowerCase() === name.toLowerCase() || 
      av.attribute?.label?.toLowerCase() === name.toLowerCase()
    );
    return attr?.valueStr || attr?.valueNum || null;
  };

  const formatCurrency = (val: any) => {
    if (!val || isNaN(Number(val))) return 'Sob consulta';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return val;
    if (num >= 1000000) return `R$ ${(num/1000000).toFixed(1)}M`;
    if (num >= 1000) return `R$ ${(num/1000).toFixed(0)}K`;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
  };

  // Valor principal — mesma posição do "Valor do Ativo" na sidebar de Empresas
  const mainValue = getAttr('initialInvestmentTotal') || listing.price;
  const priceValue = typeof mainValue === 'string' ? parseFloat(mainValue) : mainValue;
  const formattedPrice = !isNaN(priceValue as any) && priceValue !== null
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(priceValue))
    : 'Sob consulta';

  // Itens da lista de dados — mesma estrutura visual da AdSummarySidebar
  const summaryItems = [
    { label: 'Taxa de Franquia', value: formatCurrency(getAttr('franchiseFee')) },
    { label: 'Fat. Médio Estimado', value: formatCurrency(getAttr('averageEstimatedRevenue')) },
    { label: 'Prazo de Retorno', value: getAttr('estimatedPayback') || 'Sob consulta' },
    { label: 'Modelo de Operação', value: getAttr('operationModel') || 'Sob consulta' },
    { label: 'Taxa de Royalties', value: getAttr('royaltiesFee') || 'Sob consulta' },
    { label: 'Taxa de Marketing', value: getAttr('marketingFee') || 'Sob consulta' },
    { label: 'Suporte Oferecido', value: getAttr('supportOffered') || 'Sob consulta' },
    { label: 'Treinamento Incluso', value: getAttr('trainingIncluded') || 'Sob consulta' },
    { label: 'Unidades Abertas', value: getAttr('openedUnitsCount') || 'Sob consulta' },
    { label: 'Exclusividade', value: getAttr('territorialExclusivity') || 'Sob consulta' },
    { label: 'Localização', value: `${listing.city}, ${listing.state}` },
  ];

  return (
    <aside className={styles.summaryCard}>
      {/* Eyebrow / Label — mesmo padrão */}
      <div className="mb-6">
        <span className="text-[10px] uppercase text-[#98a2b3] tracking-[0.2em] font-black">
          Oportunidade de Expansão
        </span>
      </div>

      {/* Preço Principal — mesma hierarquia visual */}
      <div className={styles.summaryPrice}>
        <p className="text-[#cfd8e6] text-sm mb-1 font-medium">Investimento Inicial Total</p>
        <p className={styles.amount}>{formattedPrice}</p>
        <p className="text-[#98a2b3] text-[11px] mt-1 italic">Modelo de Negócio Validado</p>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-6" />

      {/* Lista de Dados — mesma estrutura de grid da AdSummarySidebar */}
      <div className="space-y-4 mb-8">
        {summaryItems.map((item, idx) => (
          <div key={idx} className="grid grid-cols-[16px_1fr] gap-3 items-start">
            <div className="w-4 h-4 rounded-[5px] bg-gradient-to-br from-[#00b8b2] to-[#1f6fff] mt-1" />
            <div>
              <span className="block text-[10px] text-[#98a2b3] uppercase tracking-widest mb-0.5 font-bold">{item.label}</span>
              <span className="text-sm text-[#dce5f0] font-semibold">{item.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Ações CTAs — mesma quantidade e ordem que AdSummarySidebar */}
      <div className="space-y-3">
        <button 
          onClick={onInterest}
          className={`${styles.ctaButton} ${styles.primaryCta}`}
        >
          <Target size={18} />
          Solicitar Análise
        </button>
        
        <button 
          onClick={onFavorite}
          className={`${styles.ctaButton} ${styles.secondaryCta}`}
        >
          <Heart size={18} className={isFavorited ? "fill-[#00b8b2] text-[#00b8b2]" : ""} />
          {isFavorited ? 'Salvo no Monitoramento' : 'Monitorar Ativo'}
        </button>

        <button 
          className={`${styles.ctaButton} ${styles.secondaryCta}`}
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'Oportunidade Finanhub',
                url: window.location.href
              });
            }
          }}
        >
          <Share2 size={18} />
          Compartilhar
        </button>
      </div>

      {/* Advertence / Confidentiality — mesma estrutura */}
      <div className="mt-8 p-4 rounded-xl bg-gradient-to-b from-[#00b8b2]/10 to-transparent border border-[#00b8b2]/10">
        <strong className="block text-xs text-white mb-2">Franchise Data Room</strong>
        <p className="text-[11px] text-[#dde9f6] leading-relaxed">
          O acesso ao COF (Circular de Oferta de Franquia) e DPV (Demonstrativo de Resultados) requer a formalização do interesse.
        </p>
      </div>

      {/* Footer Segurança — mesmo padrão */}
      <div className="mt-6 flex items-start gap-3 opacity-60">
        <ShieldCheck size={16} className="text-[#00b8b2] mt-0.5 shrink-0" />
        <p className="text-[9px] text-[#98a2b3] leading-relaxed uppercase font-black tracking-widest">
          Expansão estruturada via Finanhub. Marca e operação auditadas.
        </p>
      </div>
    </aside>
  );
};
