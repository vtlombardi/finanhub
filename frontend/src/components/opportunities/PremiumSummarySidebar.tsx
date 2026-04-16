'use client';

import React from 'react';
import { 
  BarChart3, 
  MapPin, 
  Layers, 
  MessageCircle, 
  Heart, 
  Share2,
  ShieldCheck,
  Lock,
  Unlock,
  FileText
} from 'lucide-react';
import styles from '@/styles/fh-ad-detail.module.css';

interface PremiumSummarySidebarProps {
  listing: any;
  onInterest: () => void;
  onFavorite: () => void;
  isFavorited?: boolean;
}

export const PremiumSummarySidebar: React.FC<PremiumSummarySidebarProps> = ({ 
  listing, 
  onInterest, 
  onFavorite,
  isFavorited 
}) => {
  // Helper para extrair atributos do array attrValues
  const getAttrValue = (name: string) => {
    const attr = listing?.attrValues?.find((av: any) => av.attribute?.name === name || av.name === name);
    return attr?.valueNum ?? attr?.valueStr ?? null;
  };

  const valuation = getAttrValue('valuationEstimated');
  const revenue = getAttrValue('revenueLtm');
  const ebitda = getAttrValue('ebitdaPremium');
  const dataRoom = getAttrValue('dataRoomStatus') || 'Sob Consulta';
  const confidentiality = getAttrValue('confidentialityLevel') || 'Padrão';

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
    <aside className={styles.summaryCard}>
      {/* Eyebrow / Label */}
      <div className="mb-6 flex justify-between items-center">
        <span className="text-[10px] uppercase text-[#98a2b3] tracking-[0.2em] font-black">
          Deal Summary
        </span>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#00b8b2]/10 border border-[#00b8b2]/20">
             <div className="w-1.5 h-1.5 rounded-full bg-[#00b8b2] animate-pulse" />
             <span className="text-[9px] font-bold text-[#00b8b2] uppercase tracking-wider">Premium Deal</span>
        </div>
      </div>

      {/* Valuation Estimado (Highlight) */}
      <div className={styles.summaryPrice}>
        <p className="text-[#cfd8e6] text-sm mb-1 font-medium">Valuation Estimado / Tag</p>
        <p className={styles.amount}>{formatFinancial(valuation)}</p>
        <p className="text-[#98a2b3] text-[11px] mt-1 italic">Originação Qualificada Finanhub</p>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-6" />

      {/* Lista de Dados Estratégicos */}
      <div className="space-y-5 mb-8">
        <div className="grid grid-cols-[16px_1fr] gap-3 items-start">
          <div className="w-4 h-4 rounded-[5px] bg-gradient-to-br from-[#00b8b2] to-[#1f6fff] mt-1 flex items-center justify-center">
            <BarChart3 size={10} className="text-white" />
          </div>
          <div>
            <span className="block text-[10px] text-[#98a2b3] uppercase tracking-widest mb-0.5 font-bold">Faturamento (LTM)</span>
            <span className="text-sm text-[#dce5f0] font-semibold">{formatFinancial(revenue)}</span>
          </div>
        </div>

        <div className="grid grid-cols-[16px_1fr] gap-3 items-start">
          <div className="w-4 h-4 rounded-[5px] bg-gradient-to-br from-[#00b8b2] to-[#1f6fff] mt-1 flex items-center justify-center">
            <Layers size={10} className="text-white" />
          </div>
          <div>
            <span className="block text-[10px] text-[#98a2b3] uppercase tracking-widest mb-0.5 font-bold">EBITDA Estimado</span>
            <span className="text-sm text-[#dce5f0] font-semibold">{formatFinancial(ebitda)}</span>
          </div>
        </div>

        <div className="grid grid-cols-[16px_1fr] gap-3 items-start">
          <div className="w-4 h-4 rounded-[5px] bg-gradient-to-br from-[#00b8b2] to-[#1f6fff] mt-1 flex items-center justify-center">
            <FileText size={10} className="text-white" />
          </div>
          <div>
            <span className="block text-[10px] text-[#98a2b3] uppercase tracking-widest mb-0.5 font-bold">Data Room (VDR)</span>
            <span className="text-sm text-[#dce5f0] font-semibold">{dataRoom}</span>
          </div>
        </div>

        <div className="grid grid-cols-[16px_1fr] gap-3 items-start">
          <div className="w-4 h-4 rounded-[5px] bg-gradient-to-br from-[#00b8b2] to-[#1f6fff] mt-1 flex items-center justify-center">
            <Lock size={10} className="text-white" />
          </div>
          <div>
            <span className="block text-[10px] text-[#98a2b3] uppercase tracking-widest mb-0.5 font-bold">Confidencialidade</span>
            <span className="text-sm text-[#dce5f0] font-semibold">{confidentiality}</span>
          </div>
        </div>

        <div className="grid grid-cols-[16px_1fr] gap-3 items-start">
          <div className="w-4 h-4 rounded-[5px] bg-gradient-to-br from-[#00b8b2] to-[#1f6fff] mt-1 flex items-center justify-center">
            <MapPin size={10} className="text-white" />
          </div>
          <div>
            <span className="block text-[10px] text-[#98a2b3] uppercase tracking-widest mb-0.5 font-bold">Localização</span>
            <span className="text-sm text-[#dce5f0] font-semibold">{listing.city ? `${listing.city}, ${listing.state}` : 'Sigilo Geográfico'}</span>
          </div>
        </div>
      </div>

      {/* Ações CTAs */}
      <div className="space-y-3">
        <button 
          onClick={onInterest}
          className={`${styles.ctaButton} ${styles.primaryCta} group`}
          style={{ background: 'linear-gradient(135deg, #00b8b2 0%, #008f8a 100%)' }}
        >
          <Unlock size={18} className="group-hover:rotate-12 transition-transform" />
          Solicitar Acesso VDR
        </button>
        
        <button 
          onClick={onInterest}
          className={`${styles.ctaButton} ${styles.secondaryCta}`}
        >
          <MessageCircle size={18} />
          Falar com Assessor M&A
        </button>
        
        <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={onFavorite}
              className={`${styles.ctaButton} ${styles.secondaryCta}`}
            >
              <Heart size={18} className={isFavorited ? "fill-[#00b8b2] text-[#00b8b2]" : ""} />
              {isFavorited ? 'Salvo' : 'Salvar'}
            </button>

            <button 
              className={`${styles.ctaButton} ${styles.secondaryCta}`}
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Oportunidade Premium Finanhub',
                    url: window.location.href
                  });
                }
              }}
            >
              <Share2 size={18} />
              Enviar
            </button>
        </div>
      </div>

      {/* Advertence / Confidentiality */}
      <div className="mt-8 p-5 rounded-2xl bg-gradient-to-b from-[#00b8b2]/10 via-[#00b8b2]/5 to-transparent border border-[#00b8b2]/15 shadow-lg shadow-[#00b8b2]/5">
        <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={14} className="text-[#00b8b2]" />
            <strong className="text-[11px] text-white uppercase tracking-widest">Protocolo de Sigilo</strong>
        </div>
        <p className="text-[11px] text-[#dde9f6] leading-relaxed">
          Este deal exige assinatura de NDA digital e qualificação financeira prévia para acesso ao Memorandum de Informações (CIM) e Data Room.
        </p>
      </div>

      {/* Footer Finanhub Elite */}
      <div className="mt-6 flex items-center justify-center gap-3 py-2 border-t border-white/5 opacity-50">
        <span className="text-[8px] text-[#98a2b3] uppercase font-black tracking-[0.3em]">
          Finanhub Elite Deal Room
        </span>
      </div>
    </aside>
  );
};
