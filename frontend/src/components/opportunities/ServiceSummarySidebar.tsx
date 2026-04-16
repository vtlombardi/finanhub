'use client';

import React from 'react';
import { 
  Award, 
  MapPin, 
  Briefcase, 
  Clock, 
  MessageCircle, 
  Heart, 
  Share2,
  ShieldCheck,
  Target
} from 'lucide-react';
import styles from '@/styles/fh-ad-detail.module.css';

interface ServiceSummarySidebarProps {
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

export const ServiceSummarySidebar: React.FC<ServiceSummarySidebarProps> = ({ 
  listing, 
  onInterest, 
  onFavorite,
  isFavorited 
}) => {
  const getAttrValue = (name: string) => {
    return listing.attrValues?.find((av: any) => av.attribute?.name === name)?.value || '';
  };

  const priceValue = typeof listing.price === 'string' ? parseFloat(listing.price) : listing.price;
  const formattedPrice = !isNaN(priceValue as any) && priceValue !== null
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(priceValue))
    : 'Sob consulta';

  return (
    <aside className={styles.summaryCard}>
      <div className="mb-6">
        <span className="text-[10px] uppercase text-[#98a2b3] tracking-[0.2em] font-black">
          Resumo da Proposta
        </span>
      </div>

      <div className={styles.summaryPrice}>
        <p className="text-[#cfd8e6] text-sm mb-1 font-medium">Valor Estimado (Fee)</p>
        <p className={styles.amount}>{formattedPrice}</p>
        <p className="text-[#98a2b3] text-[11px] mt-1 italic">Intermediação Direta Finanhub</p>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-6" />

      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-[16px_1fr] gap-3 items-start">
          <div className="w-4 h-4 rounded-[5px] bg-gradient-to-br from-[#00b8b2] to-[#1f6fff] mt-1" />
          <div>
            <span className="block text-[10px] text-[#98a2b3] uppercase tracking-widest mb-0.5 font-bold">Especialidade</span>
            <span className="text-sm text-[#dce5f0] font-semibold">{getAttrValue('expertiseArea') || 'Consultoria'}</span>
          </div>
        </div>

        <div className="grid grid-cols-[16px_1fr] gap-3 items-start">
          <div className="w-4 h-4 rounded-[5px] bg-gradient-to-br from-[#00b8b2] to-[#1f6fff] mt-1" />
          <div>
            <span className="block text-[10px] text-[#98a2b3] uppercase tracking-widest mb-0.5 font-bold">Experiência</span>
            <span className="text-sm text-[#dce5f0] font-semibold">{getAttrValue('experienceTime') || 'Sênior'}</span>
          </div>
        </div>

        <div className="grid grid-cols-[16px_1fr] gap-3 items-start">
          <div className="w-4 h-4 rounded-[5px] bg-gradient-to-br from-[#00b8b2] to-[#1f6fff] mt-1" />
          <div>
            <span className="block text-[10px] text-[#98a2b3] uppercase tracking-widest mb-0.5 font-bold">Modo de Entrega</span>
            <span className="text-sm text-[#dce5f0] font-semibold">{getAttrValue('deliveryFormat') || 'Híbrida'}</span>
          </div>
        </div>

        <div className="grid grid-cols-[16px_1fr] gap-3 items-start">
          <div className="w-4 h-4 rounded-[5px] bg-gradient-to-br from-[#00b8b2] to-[#1f6fff] mt-1" />
          <div>
            <span className="block text-[10px] text-[#98a2b3] uppercase tracking-widest mb-0.5 font-bold">Modelo Contratação</span>
            <span className="text-sm text-[#dce5f0] font-semibold">{getAttrValue('hiringModel') || 'Sob demanda'}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button 
          onClick={onInterest}
          className={`${styles.ctaButton} ${styles.primaryCta}`}
        >
          <MessageCircle size={18} />
          Solicitar Diagnóstico
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
                title: 'Consultoria Especializada - Finanhub',
                url: window.location.href
              });
            }
          }}
        >
          <Share2 size={18} />
          Compartilhar
        </button>
      </div>

      <div className="mt-8 p-4 rounded-xl bg-gradient-to-b from-[#00b8b2]/10 to-transparent border border-[#00b8b2]/10">
        <strong className="block text-xs text-white mb-2">Qualificação Técnica</strong>
        <p className="text-[11px] text-[#dde9f6] leading-relaxed">
          Este consultor/empresa passou por validação de histórico e autoridade. A contratação direta via Finanhub garante suporte na gestão do escopo.
        </p>
      </div>

      <div className="mt-6 flex items-start gap-3 opacity-60">
        <ShieldCheck size={16} className="text-[#00b8b2] mt-0.5 shrink-0" />
        <p className="text-[9px] text-[#98a2b3] leading-relaxed uppercase font-black tracking-widest">
          Transação assegurada pelo ecossistema Finanhub. Qualidade técnica e suporte institucional.
        </p>
      </div>
    </aside>
  );
};
