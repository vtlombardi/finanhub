'use client';

import React, { useEffect, useState } from 'react';
import { MatchingService } from '@/services/MatchingService';
import { 
  Sparkles, 
  ChevronRight, 
  MapPin, 
  DollarSign, 
  Building2,
  TrendingUp,
  Target
} from 'lucide-react';
import Link from 'next/link';

export function RecommendedListingsCard() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const data = await MatchingService.getRecommended(4);
        setRecommendations(data);
      } catch (error) {
        console.error('Erro ao buscar recomendações:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecs();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#020617] border border-white/5 rounded-[32px] p-8 animate-pulse">
        <div className="h-6 w-48 bg-white/5 rounded-lg mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => <div key={i} className="h-40 w-full bg-white/5 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#00b8b2]/10 border border-[#00b8b2]/20 rounded-lg text-[#00b8b2]">
              <Target size={18} />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight uppercase">Oportunidades Recomendadas</h2>
          </div>
          <p className="text-gray-500 text-[11px] font-bold uppercase tracking-[2px] ml-1">Curadoria Inteligente HAYIA Engine</p>
        </div>
        <Link 
          href="/dashboard/deals" 
          className="text-[10px] font-black text-[#00b8b2] hover:text-white uppercase tracking-widest transition-colors flex items-center gap-1 group"
        >
          Ver marketplace <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recommendations.map((listing) => (
          <Link 
            key={listing.id} 
            href={`/dashboard/deals/${listing.slug}`}
            className="group block bg-[#0c1425]/40 hover:bg-[#0c1425]/80 border border-white/5 hover:border-[#00b8b2]/30 rounded-3xl overflow-hidden transition-all duration-500 shadow-xl relative"
          >
            {/* Adherence Badge */}
            <div className="absolute top-4 right-4 z-10 px-3 py-1.5 bg-[#00b8b2] rounded-xl flex items-center gap-2 shadow-lg shadow-[#00b8b2]/20">
              <Zap size={12} className="text-white fill-white" />
              <span className="text-[10px] font-black text-white">{listing.match.score}% Match</span>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[9px] text-[#00b8b2] font-black uppercase tracking-widest">
                  <Building2 size={12} />
                  {listing.category?.name || 'Setor Premium'}
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-[#00b8b2] transition-colors leading-tight truncate">
                  {listing.title}
                </h3>
              </div>

              <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                <p className="text-[11px] text-gray-400 font-medium leading-relaxed italic line-clamp-2">
                  HAYIA: "{listing.match.justification}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-4">
                  <div className="space-y-0.5">
                    <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Investimento</p>
                    <p className="text-sm font-black text-white">
                      {listing.investmentValue 
                        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(listing.investmentValue))
                        : 'Sob consulta'}
                    </p>
                  </div>
                  <div className="h-8 w-px bg-white/5" />
                  <div className="space-y-0.5 text-right md:text-left">
                    <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Localização</p>
                    <p className="text-xs font-bold text-gray-400">{listing.city}, {listing.state}</p>
                  </div>
                </div>
                
                <div className="w-10 h-10 bg-white/5 group-hover:bg-[#00b8b2] rounded-full flex items-center justify-center transition-all group-hover:rotate-45">
                  <ChevronRight size={20} className="text-white" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
