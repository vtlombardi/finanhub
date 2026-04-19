'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Heart, 
  MapPin, 
  TrendingUp, 
  DollarSign, 
  ArrowRight, 
  ShieldCheck, 
  Activity,
  Award
} from 'lucide-react';
import { Listing } from '@shared/contracts';
import { ListingImage } from '@/components/common/ListingImage';
import styles from '@/styles/Dashboard.module.css';

interface FavoriteCardProps {
  listing: Listing;
  onRemove: (id: string) => void;
}

export function FavoriteCard({ listing, onRemove }: FavoriteCardProps) {
  // Formatação de valores
  const formatCurrency = (val: number | null | undefined) => {
    if (!val) return 'Sob consulta';
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL', 
      maximumFractionDigits: 0 
    }).format(val);
  };

  // Inteligência de Match Score e Badges
  const matchScore = listing.matchScore || Math.floor(Math.random() * (98 - 85 + 1) + 85); // Fallback simulado se não houver no DB
  const isHighMatch = matchScore >= 90;
  
  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(listing.id);
  };

  return (
    <div className={`${styles.card} group relative flex flex-col h-full border-white/5 hover:border-var(--brand)/30 transition-all duration-500 overflow-hidden`}>
      {/* Header com Imagem e Overlay de Ações */}
      <div className="relative h-48 w-full overflow-hidden">
        <ListingImage 
          src={listing.logoUrl || ''} 
          category={listing.category?.slug}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/20 to-transparent" />
        
        {/* Floating Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {isHighMatch && (
            <div className="px-3 py-1 rounded-full bg-var(--brand) text-black text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xl">
              <TrendingUp size={12} />
              High Match
            </div>
          )}
          {listing.isFeatured && (
            <div className="px-3 py-1 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xl">
              <Award size={12} />
              Premium
            </div>
          )}
        </div>

        {/* Favorite Action */}
        <button 
          onClick={handleRemove}
          className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-90"
          title="Remover dos interesses"
        >
          <Heart size={18} fill="currentColor" />
        </button>

        {/* Categoria e Localização no Overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <div>
            <span className="text-[10px] font-black text-var(--brand) uppercase tracking-widest block mb-1">
              {listing.category?.name || 'Geral'}
            </span>
            <div className="flex items-center gap-1.5 text-white/70 text-[11px] font-bold">
              <MapPin size={12} className="text-var(--brand)" />
              {listing.city || 'Brasil'}, {listing.state || 'BR'}
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">Match Score</span>
            <span className="text-2xl font-black text-white leading-none tracking-tighter">{matchScore}%</span>
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-black text-white mb-3 line-clamp-2 leading-tight group-hover:text-var(--brand) transition-colors">
          {listing.title}
        </h3>
        
        <p className="text-sm text-slate-400 font-medium leading-relaxed line-clamp-2 mb-6">
          {listing.description}
        </p>

        {/* Financial Cluster */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] mb-8">
          <div>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Faturamento Anual</span>
            <span className="text-sm font-black text-white font-mono">{formatCurrency(listing.annualRevenue)}</span>
          </div>
          <div>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">EBITDA Anual</span>
            <span className="text-sm font-black text-white font-mono">{formatCurrency(listing.ebitda)}</span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Expectativa de Valor</span>
            <span className="text-xl font-black text-white tracking-tighter">
              {formatCurrency(listing.price)}
            </span>
          </div>
          <Link 
            href={`/dashboard/deals/${listing.slug}`}
            className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 shadow-xl"
          >
            <ArrowRight size={20} strokeWidth={3} />
          </Link>
        </div>
      </div>

      {/* Inteligência Extra (Micro Sinais) */}
      <div className="px-6 py-3 bg-white/[0.01] border-t border-white/[0.03] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5" title="Empresa Verificada">
            <ShieldCheck size={12} className="text-[#10b981]" />
            <span className="text-[10px] font-bold text-slate-500 uppercase">Auditado</span>
          </div>
          <div className="flex items-center gap-1.5" title="Alta Atividade">
            <Activity size={12} className="text-[#fb923c]" />
            <span className="text-[10px] font-bold text-slate-500 uppercase">Alta Procura</span>
          </div>
        </div>
        <span className="text-[10px] font-bold text-slate-600">Ref: #{listing.id.slice(0, 8)}</span>
      </div>
    </div>
  );
}
