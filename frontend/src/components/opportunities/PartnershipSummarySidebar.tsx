'use client';

import React from 'react';
import { 
  Users, 
  MapPin, 
  Target, 
  MessageCircle, 
  Heart, 
  Share2,
  ShieldCheck,
  Zap,
  Globe,
  Layout
} from 'lucide-react';
import styles from '@/styles/fh-ad-detail.module.css';

interface PartnershipSummarySidebarProps {
  listing: any;
  onInterest: () => void;
  onFavorite: () => void;
  isFavorited?: boolean;
}

export const PartnershipSummarySidebar: React.FC<PartnershipSummarySidebarProps> = ({ 
  listing, 
  onInterest, 
  onFavorite,
  isFavorited 
}) => {
  const partnershipType = listing.partnershipType || 'Estratégica';
  const segment = listing.partnershipSegment || 'Geral';
  const reach = listing.audienceReach || 'Sob Consulta';
  const format = listing.partnershipFormat || 'Híbrido';


  return (
    <aside className={styles.summaryCard}>
      {/* Eyebrow / Label */}
      <div className="mb-6 flex justify-between items-center">
        <span className="text-[10px] uppercase text-[#98a2b3] tracking-[0.2em] font-black">
          Resumo da Parceria
        </span>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#00b8b2]/10 border border-[#00b8b2]/20">
             <div className="w-1.5 h-1.5 rounded-full bg-[#00b8b2] animate-pulse" />
             <span className="text-[9px] font-bold text-[#00b8b2] uppercase tracking-wider">Oportunidade Ativa</span>
        </div>
      </div>

      {/* Tipo de Parceria (Highlight) */}
      <div className={styles.summaryPrice}>
        <p className="text-[#cfd8e6] text-sm mb-1 font-medium">Modelo de Colaboração</p>
        <p className={styles.amount} style={{ fontSize: '1.5rem', lineHeight: '1.2' }}>{partnershipType}</p>
        <p className="text-[#98a2b3] text-[11px] mt-1 italic">Vetting Finanhub Partners</p>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-6" />

      {/* Lista de Dados Estratégicos */}
      <div className="space-y-5 mb-8">
        <div className="grid grid-cols-[16px_1fr] gap-3 items-start">
          <div className="w-4 h-4 rounded-[5px] bg-gradient-to-br from-[#00b8b2] to-[#1f6fff] mt-1 flex items-center justify-center">
            <Layout size={10} className="text-white" />
          </div>
          <div>
            <span className="block text-[10px] text-[#98a2b3] uppercase tracking-widest mb-0.5 font-bold">Segmento de Atuação</span>
            <span className="text-sm text-[#dce5f0] font-semibold">{segment}</span>
          </div>
        </div>

        <div className="grid grid-cols-[16px_1fr] gap-3 items-start">
          <div className="w-4 h-4 rounded-[5px] bg-gradient-to-br from-[#00b8b2] to-[#1f6fff] mt-1 flex items-center justify-center">
            <Globe size={10} className="text-white" />
          </div>
          <div>
            <span className="block text-[10px] text-[#98a2b3] uppercase tracking-widest mb-0.5 font-bold">Alcance / Audience</span>
            <span className="text-sm text-[#dce5f0] font-semibold">{reach}</span>
          </div>
        </div>

        <div className="grid grid-cols-[16px_1fr] gap-3 items-start">
          <div className="w-4 h-4 rounded-[5px] bg-gradient-to-br from-[#00b8b2] to-[#1f6fff] mt-1 flex items-center justify-center">
            <Zap size={10} className="text-white" />
          </div>
          <div>
            <span className="block text-[10px] text-[#98a2b3] uppercase tracking-widest mb-0.5 font-bold">Formato Base</span>
            <span className="text-sm text-[#dce5f0] font-semibold">{format}</span>
          </div>
        </div>

        <div className="grid grid-cols-[16px_1fr] gap-3 items-start">
          <div className="w-4 h-4 rounded-[5px] bg-gradient-to-br from-[#00b8b2] to-[#1f6fff] mt-1 flex items-center justify-center">
            <MapPin size={10} className="text-white" />
          </div>
          <div>
            <span className="block text-[10px] text-[#98a2b3] uppercase tracking-widest mb-0.5 font-bold">Base de Operação</span>
            <span className="text-sm text-[#dce5f0] font-semibold">{listing.city ? `${listing.city}, ${listing.state}` : 'Nacional / Global'}</span>
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
          <Target size={18} className="group-hover:scale-110 transition-transform" />
          Iniciar parceria estratégica
        </button>
        
        <button 
          onClick={onInterest}
          className={`${styles.ctaButton} ${styles.secondaryCta}`}
        >
          <MessageCircle size={18} />
          Falar com Assessor de Canal
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
                    title: 'Oportunidade de Parceria Finanhub',
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

      {/* Advertence / Compliance */}
      <div className="mt-8 p-5 rounded-2xl bg-gradient-to-b from-[#00b8b2]/10 via-[#00b8b2]/5 to-transparent border border-[#00b8b2]/15 shadow-lg shadow-[#00b8b2]/5">
        <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={14} className="text-[#00b8b2]" />
            <strong className="text-[11px] text-white uppercase tracking-widest">Protocolo de Aliança</strong>
        </div>
        <p className="text-[11px] text-[#dde9f6] leading-relaxed">
          Esta proposta visa sinergia mútua. As partes devem validar alinhamento de valores e compliance antes da formalização do acordo.
        </p>
      </div>

      {/* Footer Finanhub Partners */}
      <div className="mt-6 flex items-center justify-center gap-3 py-2 border-t border-white/5 opacity-50">
        <span className="text-[8px] text-[#98a2b3] uppercase font-black tracking-[0.3em]">
          Finanhub Partnership Network
        </span>
      </div>
    </aside>
  );
};
