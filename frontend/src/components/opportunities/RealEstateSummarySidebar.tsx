'use client';

import React from 'react';
import { 
  Building, 
  MapPin, 
  Maximize, 
  Target, 
  MessageCircle, 
  Heart, 
  Share2,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import styles from '@/styles/fh-ad-detail.module.css';

interface RealEstateSummarySidebarProps {
  listing: {
    id: string;
    price: string | number;
    totalArea?: string | number;
    propertyType?: string;
    city: string;
    state: string;
    idealPurpose?: string;
    isRental?: boolean;
  };
  onInterest: () => void;
  onFavorite: () => void;
  isFavorited?: boolean;
}

export const RealEstateSummarySidebar: React.FC<RealEstateSummarySidebarProps> = ({ 
  listing, 
  onInterest, 
  onFavorite,
  isFavorited 
}) => {
  const getAttr = (name: string) => {
    const attr = (listing as any).attrValues?.find((av: any) => av.attribute?.name === name || (av as any).attributeName === name || (av as any).name === name);
    return attr?.valueStr || attr?.valueNum?.toString() || '';
  };

  const propertyType = getAttr('propertyType');
  const totalArea = getAttr('totalArea');
  const idealPurpose = getAttr('idealPurpose');

  const priceValue = typeof listing.price === 'string' ? parseFloat(listing.price) : listing.price;
  const formattedPrice = !isNaN(priceValue as any) && priceValue !== null
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(priceValue))
    : 'Sob consulta';

  const areaValue = totalArea ? parseFloat(totalArea) : null;
  const pricePerM2 = (priceValue && areaValue) ? (Number(priceValue) / Number(areaValue)) : null;

  return (
    <aside className={styles.summaryCard}>
      {/* Eyebrow / Label */}
      <div className="mb-6">
        <span className="text-[10px] uppercase text-[#98a2b3] tracking-[0.2em] font-black">
          Resumo do Ativo Imobiliário
        </span>
      </div>

      {/* Preço */}
      <div className={styles.summaryPrice}>
        <p className="text-[#cfd8e6] text-sm mb-1 font-medium">
          {listing.isRental ? 'Valor do Aluguel' : 'Valor de Venda'}
        </p>
        <p className={styles.amount}>{formattedPrice}</p>
        {pricePerM2 && (
          <p className="text-[#00b8b2] text-[12px] mt-1 font-bold">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pricePerM2)} / m²
          </p>
        )}
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-6" />

      {/* Lista de Dados */}
      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-[16px_1fr] gap-3 items-start">
          <div className="w-4 h-4 rounded-[5px] bg-gradient-to-br from-[#00b8b2] to-[#1f6fff] mt-1" />
          <div>
            <span className="block text-[10px] text-[#98a2b3] uppercase tracking-widest mb-0.5 font-bold">Tipo de Imóvel</span>
            <span className="text-sm text-[#dce5f0] font-semibold">{propertyType || 'Comercial'}</span>
          </div>
        </div>

        <div className="grid grid-cols-[16px_1fr] gap-3 items-start">
          <div className="w-4 h-4 rounded-[5px] bg-gradient-to-br from-[#00b8b2] to-[#1f6fff] mt-1" />
          <div>
            <span className="block text-[10px] text-[#98a2b3] uppercase tracking-widest mb-0.5 font-bold">Área Total</span>
            <span className="text-sm text-[#dce5f0] font-semibold">{totalArea ? `${Number(totalArea).toLocaleString('pt-BR')} m²` : 'Consultar Planta'}</span>
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
            <span className="block text-[10px] text-[#98a2b3] uppercase tracking-widest mb-0.5 font-bold">Finalidade Ideal</span>
            <span className="text-sm text-[#dce5f0] font-semibold">{idealPurpose || 'Uso Comercial / Corporativo'}</span>
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
          Consultar Disponibilidade
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
                title: 'Imóvel para Negócios - Finanhub',
                url: window.location.href
              });
            }
          }}
        >
          <Share2 size={18} />
          Compartilhar
        </button>
      </div>

      {/* Confidencialidade / Advertência */}
      <div className="mt-8 p-4 rounded-xl bg-gradient-to-b from-[#00b8b2]/10 to-transparent border border-[#00b8b2]/10">
        <strong className="block text-xs text-white mb-2">Análise de Viabilidade</strong>
        <p className="text-[11px] text-[#dde9f6] leading-relaxed">
          Este convite ao negócio está sujeito a análise de zoneamento e infraestrutura. Entre em contato com nosso concierge para o memorial descritivo completo.
        </p>
      </div>

      {/* Footer Segurança */}
      <div className="mt-6 flex items-start gap-3 opacity-60">
        <ShieldCheck size={16} className="text-[#00b8b2] mt-0.5 shrink-0" />
        <p className="text-[9px] text-[#98a2b3] leading-relaxed uppercase font-black tracking-widest">
          Ativo imobiliário verificado pela Finanhub Corporate. Transação direta com proprietários ou brokers certificados.
        </p>
      </div>
    </aside>
  );
};
