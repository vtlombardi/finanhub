'use client';

import React from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  Clock, 
  Briefcase, 
  MapPin, 
  Layers, 
  MessageCircle, 
  Heart, 
  Share2,
  ShieldCheck
} from 'lucide-react';
import styles from '@/styles/fh-ad-detail.module.css';

interface AdSummarySidebarProps {
  listing: {
    id: string;
    price: string | number;
    annualRevenue?: string | number;
    ebitda?: string | number;
    ebitdaMargin?: string | number;
    yearsActive?: string | number;
    category?: { name: string };
    city: string;
    state: string;
    operationStructure?: string;
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

export const AdSummarySidebar: React.FC<AdSummarySidebarProps> = ({ 
  listing, 
  onInterest, 
  onFavorite,
  isFavorited 
}) => {
  const priceValue = typeof listing.price === 'string' ? parseFloat(listing.price) : listing.price;
  const formattedPrice = !isNaN(priceValue as any) && priceValue !== null
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(priceValue))
    : 'Sob consulta';

  const formatFinancial = (val?: string | number) => {
    if (!val) return 'Sob consulta';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return val;
    if (num >= 1000000) return `R$ ${(num/1000000).toFixed(1)}M`;
    if (num >= 1000) return `R$ ${(num/1000).toFixed(0)}K`;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
  };

  return (
    <aside className={styles.summaryCard}>
      {/* Eyebrow / Label */}
      <div className="mb-6">
        <span className="text-[10px] uppercase text-[#98a2b3] tracking-[0.2em] font-black">
          Resumo Executivo
        </span>
      </div>

      {/* Preço de Venda */}
      <div className={styles.summaryPrice}>
        <p className="text-[#cfd8e6] text-sm mb-1 font-medium">Valor do Ativo</p>
        <p className={styles.amount}>{formattedPrice}</p>
        <p className="text-[#98a2b3] text-[11px] mt-1 italic">Intermediação Exclusiva Finanhub</p>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-6" />

      {/* Lista de Dados (Estilo Data-List do HTML) */}
      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-[16px_1fr] gap-3 items-start">
          <div className="w-4 h-4 rounded-[5px] bg-gradient-to-br from-[#00b8b2] to-[#1f6fff] mt-1" />
          <div>
            <span className="block text-[10px] text-[#98a2b3] uppercase tracking-widest mb-0.5 font-bold">Faturamento Anual</span>
            <span className="text-sm text-[#dce5f0] font-semibold">{formatFinancial(listing.annualRevenue)}</span>
          </div>
        </div>

        <div className="grid grid-cols-[16px_1fr] gap-3 items-start">
          <div className="w-4 h-4 rounded-[5px] bg-gradient-to-br from-[#00b8b2] to-[#1f6fff] mt-1" />
          <div>
            <span className="block text-[10px] text-[#98a2b3] uppercase tracking-widest mb-0.5 font-bold">EBITDA</span>
            <span className="text-sm text-[#dce5f0] font-semibold">{formatFinancial(listing.ebitda)}</span>
          </div>
        </div>

        <div className="grid grid-cols-[16px_1fr] gap-3 items-start">
          <div className="w-4 h-4 rounded-[5px] bg-gradient-to-br from-[#00b8b2] to-[#1f6fff] mt-1" />
          <div>
            <span className="block text-[10px] text-[#98a2b3] uppercase tracking-widest mb-0.5 font-bold">Localização</span>
            <span className="text-sm text-[#dce5f0] font-semibold">{listing.city}, {listing.state}</span>
          </div>
        </div>

        <div className="grid grid-cols-[16px_1fr] gap-3 items-start">
          <div className="w-4 h-4 rounded-[5px] bg-gradient-to-br from-[#00b8b2] to-[#1f6fff] mt-1" />
          <div>
            <span className="block text-[10px] text-[#98a2b3] uppercase tracking-widest mb-0.5 font-bold">Estrutura de Venda</span>
            <span className="text-sm text-[#dce5f0] font-semibold">{listing.operationStructure || '100% das Cotas'}</span>
          </div>
        </div>
      </div>

      {/* Ações CTAs */}
      <div className="space-y-3">
        <button 
          onClick={onInterest}
          className={`${styles.ctaButton} ${styles.primaryCta}`}
        >
          <MessageCircle size={18} />
          Demonstrar Interesse
        </button>
        
        <button 
          onClick={onFavorite}
          className={`${styles.ctaButton} ${styles.secondaryCta}`}
        >
          <Heart size={18} className={isFavorited ? "fill-[#00b8b2] text-[#00b8b2]" : ""} />
          {isFavorited ? 'Salvo nos Favoritos' : 'Salvar Favorito'}
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

      {/* Advertence / Confidentiality */}
      <div className="mt-8 p-4 rounded-xl bg-gradient-to-b from-[#00b8b2]/10 to-transparent border border-[#00b8b2]/10">
        <strong className="block text-xs text-white mb-2">Informação Confidencial</strong>
        <p className="text-[11px] text-[#dde9f6] leading-relaxed">
          Os dados detalhados deste ativo são protegidos por Acordo de Confidencialidade (NDA). A demonstração de interesse inicia o processo de qualificação.
        </p>
      </div>

      {/* Footer Segurança */}
      <div className="mt-6 flex items-start gap-3 opacity-60">
        <ShieldCheck size={16} className="text-[#00b8b2] mt-0.5 shrink-0" />
        <p className="text-[9px] text-[#98a2b3] leading-relaxed uppercase font-black tracking-widest">
          Transação validada pelo motor de crédito Finanhub. Intermediação segura ponta a ponta.
        </p>
      </div>
    </aside>
  );
};
