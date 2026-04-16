'use client';

import React from 'react';
import { 
  Briefcase, 
  MapPin, 
  Settings, 
  Calendar, 
  CheckCircle, 
  MessageCircle, 
  Heart, 
  Share2,
  ShieldCheck,
  Zap
} from 'lucide-react';
import styles from '@/styles/fh-ad-detail.module.css';

interface AssetSummarySidebarProps {
  listing: {
    id: string;
    price: string | number;
    category?: { name: string };
    city: string;
    state: string;
    status?: string;
    company?: {
        name: string;
        isVerified: boolean;
        createdAt?: string;
    };
    attrValues?: any[];
  };
  onInterest: () => void;
  onFavorite: () => void;
  isFavorited?: boolean;
}

export const AssetSummarySidebar: React.FC<AssetSummarySidebarProps> = ({ 
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

  const priceValue = typeof listing.price === 'string' ? parseFloat(listing.price) : listing.price;
  const formattedPrice = !isNaN(priceValue as any) && priceValue !== null
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(priceValue))
    : 'Sob consulta';

  return (
    <aside className={styles.summaryCard}>
      {/* Eyebrow / Label */}
      <div className="mb-6">
        <span className="text-[10px] uppercase text-[#98a2b3] tracking-[0.2em] font-black">
          Resumo do Ativo
        </span>
      </div>

      {/* Preço do Ativo */}
      <div className={styles.summaryPrice}>
        <p className="text-[#cfd8e6] text-sm mb-1 font-medium">Valor Estimado</p>
        <p className={styles.amount}>{formattedPrice}</p>
        <p className="text-[#98a2b3] text-[11px] mt-1 italic">Condições de aquisição direta</p>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-6" />

      {/* Lista de Dados (Estilo Data-List) */}
      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-[16px_1fr] gap-3 items-start">
          <div className="w-4 h-4 rounded-[5px] bg-gradient-to-br from-[#00b8b2] to-[#1f6fff] mt-1" />
          <div>
            <span className="block text-[10px] text-[#98a2b3] uppercase tracking-widest mb-0.5 font-bold">Tipo de Ativo</span>
            <span className="text-sm text-[#dce5f0] font-semibold">{getAttrValue('assetType') || listing.category?.name || 'Maquinário / Estrutura'}</span>
          </div>
        </div>

        <div className="grid grid-cols-[16px_1fr] gap-3 items-start">
          <div className="w-4 h-4 rounded-[5px] bg-gradient-to-br from-[#00b8b2] to-[#1f6fff] mt-1" />
          <div>
            <span className="block text-[10px] text-[#98a2b3] uppercase tracking-widest mb-0.5 font-bold">Estado de Conservação</span>
            <span className="text-sm text-[#dce5f0] font-semibold">{getAttrValue('conservationState') || 'Excelente / Operacional'}</span>
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
            <span className="block text-[10px] text-[#98a2b3] uppercase tracking-widest mb-0.5 font-bold">Disponibilidade</span>
            <span className="text-sm text-[#dce5f0] font-semibold">{getAttrValue('availability') || 'Imediata para Retirada'}</span>
          </div>
        </div>

        <div className="grid grid-cols-[16px_1fr] gap-3 items-start">
          <div className="w-4 h-4 rounded-[5px] bg-gradient-to-br from-[#00b8b2] to-[#1f6fff] mt-1" />
          <div>
            <span className="block text-[10px] text-[#98a2b3] uppercase tracking-widest mb-0.5 font-bold">Documentação</span>
            <span className="text-sm text-[#dce5f0] font-semibold">{getAttrValue('documentationStatus') || 'Regularizada / Com NF'}</span>
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
                title: 'Ativo Estratégico Finanhub',
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
        <strong className="block text-xs text-white mb-2">Aquisição de Ativos</strong>
        <p className="text-[11px] text-[#dde9f6] leading-relaxed">
          A negociação de ativos físicos requer inspeção técnica prévia. A Finanhub facilita a aproximação e o agendamento de vistorias.
        </p>
      </div>

      {/* Footer Segurança */}
      <div className="mt-6 flex items-start gap-3 opacity-60">
        <ShieldCheck size={16} className="text-[#00b8b2] mt-0.5 shrink-0" />
        <p className="text-[9px] text-[#98a2b3] leading-relaxed uppercase font-black tracking-widest">
          Autenticidade do anúncio monitorada. Suporte jurídico opcional para transferência.
        </p>
      </div>
    </aside>
  );
};
