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
  ShieldCheck,
  Rocket,
  CircleDollarSign
} from 'lucide-react';
import styles from '@/styles/fh-ad-detail.module.css';

interface StartupSummarySidebarProps {
  listing: {
    id: string;
    price: string | number;
    categoryId: string;
    city: string;
    state: string;
    attrValues?: any[];
  };
  onInterest: () => void;
  onFavorite: () => void;
  isFavorited?: boolean;
}

export const StartupSummarySidebar: React.FC<StartupSummarySidebarProps> = ({ 
  listing, 
  onInterest, 
  onFavorite,
  isFavorited 
}) => {
  // Helpers para buscar atributos dinâmicos
  const getAttr = (name: string) => {
    return listing.attrValues?.find((av: any) => av.attribute?.name === name || av.name === name);
  };

  const getAttrValue = (name: string) => {
    const attr = getAttr(name);
    return attr?.valueStr || attr?.valueNum?.toString() || '';
  };

  const formatFinancial = (val?: string | number) => {
    if (!val) return 'Sob consulta';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return val;
    if (num >= 1000000) return `R$ ${(num/1000000).toFixed(1)}M`;
    if (num >= 1000) return `R$ ${(num/1000).toFixed(0)}K`;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
  };

  const fundingAmount = getAttrValue('fundingAmountRequested');
  const fundingRound = getAttrValue('fundingRound') || 'Rodada Aberta';
  const startupStage = getAttrValue('startupStage') || 'Early Stage';
  const equityOffered = getAttrValue('equityOffered') || 'A negociar';

  return (
    <aside className={styles.summaryCard}>
      <div className="mb-6">
        <span className="text-[10px] uppercase text-[#98a2b3] tracking-[0.2em] font-black">
          Resumo para Investidor
        </span>
      </div>

      {/* Investimento Buscado */}
      <div className={styles.summaryPrice}>
        <p className="text-[#cfd8e6] text-sm mb-1 font-medium">Investimento Buscado</p>
        <p className={styles.amount}>{fundingAmount ? formatFinancial(fundingAmount) : 'Sob Consulta'}</p>
        <p className="text-[#00b8b2] text-[11px] mt-1 font-bold uppercase tracking-wider">{fundingRound}</p>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-6" />

      {/* Lista de Dados */}
      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-[16px_1fr] gap-3 items-start">
          <div className="w-4 h-4 rounded-[5px] bg-gradient-to-br from-[#00b8b2] to-[#1f6fff] mt-1" />
          <div>
            <span className="block text-[10px] text-[#98a2b3] uppercase tracking-widest mb-0.5 font-bold">Equity Ofertado</span>
            <span className="text-sm text-[#dce5f0] font-semibold">{equityOffered}</span>
          </div>
        </div>

        <div className="grid grid-cols-[16px_1fr] gap-3 items-start">
          <div className="w-4 h-4 rounded-[5px] bg-gradient-to-br from-[#00b8b2] to-[#1f6fff] mt-1" />
          <div>
            <span className="block text-[10px] text-[#98a2b3] uppercase tracking-widest mb-0.5 font-bold">Estágio Atual</span>
            <span className="text-sm text-[#dce5f0] font-semibold">{startupStage}</span>
          </div>
        </div>

        <div className="grid grid-cols-[16px_1fr] gap-3 items-start">
          <div className="w-4 h-4 rounded-[5px] bg-gradient-to-br from-[#00b8b2] to-[#1f6fff] mt-1" />
          <div>
            <span className="block text-[10px] text-[#98a2b3] uppercase tracking-widest mb-0.5 font-bold">Modelo de Negócio</span>
            <span className="text-sm text-[#dce5f0] font-semibold">{getAttrValue('businessModelType') || 'SaaS / B2B'}</span>
          </div>
        </div>

        <div className="grid grid-cols-[16px_1fr] gap-3 items-start">
          <div className="w-4 h-4 rounded-[5px] bg-gradient-to-br from-[#00b8b2] to-[#1f6fff] mt-1" />
          <div>
            <span className="block text-[10px] text-[#98a2b3] uppercase tracking-widest mb-0.5 font-bold">Localização</span>
            <span className="text-sm text-[#dce5f0] font-semibold">{listing.city}, {listing.state}</span>
          </div>
        </div>
      </div>

      {/* Ações CTAs */}
      <div className="space-y-3">
        <button 
          onClick={onInterest}
          className={`${styles.ctaButton} ${styles.primaryCta}`}
        >
          <rocket size={18} />
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
                title: 'Oportunidade de Investimento em Startup',
                url: window.location.href
              });
            }
          }}
        >
          <Share2 size={18} />
          Compartilhar
        </button>
      </div>

      {/* Advertence */}
      <div className="mt-8 p-4 rounded-xl bg-gradient-to-b from-[#00b8b2]/10 to-transparent border border-[#00b8b2]/10">
        <strong className="block text-xs text-white mb-2">Private Deal</strong>
        <p className="text-[11px] text-[#dde9f6] leading-relaxed">
          O acesso ao Pitch Deck e métricas detalhadas (Data Room) está condicionado à aprovação do perfil de investidor.
        </p>
      </div>

      {/* Footer Segurança */}
      <div className="mt-6 flex items-start gap-3 opacity-60">
        <ShieldCheck size={16} className="text-[#00b8b2] mt-0.5 shrink-0" />
        <p className="text-[9px] text-[#98a2b3] leading-relaxed uppercase font-black tracking-widest">
          Negócio analisado sob ótica de escala e governança Finanhub.
        </p>
      </div>
    </aside>
  );
};
