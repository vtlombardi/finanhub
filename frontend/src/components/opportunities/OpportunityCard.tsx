'use client';

import React from 'react';
import { MapPin, Star, Calendar, CheckCircle, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export interface Opportunity {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  location: string;
  price: string;
  rating: number;
  date: string;
  image: string;
  verified: boolean;
  status: 'Ativo' | 'Pendente' | 'Encerrado';
}

interface OpportunityCardProps {
  opportunity: Opportunity;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity }) => {
  return (
    <div className="group relative flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all duration-500 hover:border-[#12b3af]/40 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(18,179,175,0.1)]">
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden">
        <img 
          src={opportunity.image} 
          alt={opportunity.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Badges Overlay */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className="bg-[#12b3af] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
            {opportunity.status}
          </span>
          {opportunity.verified && (
            <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-medium px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
               <CheckCircle className="w-3 h-3 text-[#12b3af]" />
               Verificado <span className="text-[#12b3af] ml-0.5">FH</span>
            </div>
          )}
        </div>

        {/* Category Overlay */}
        <div className="absolute bottom-4 left-4">
           <span className="bg-black/60 backdrop-blur-md border border-white/10 text-gray-300 text-[10px] font-medium px-3 py-1 rounded-full uppercase tracking-widest">
            {opportunity.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-4">
         <div className="space-y-1">
            <div className="text-[10px] text-gray-500 uppercase tracking-[2px] font-bold">Ref: #{opportunity.id}</div>
            <h3 className="text-xl font-bold text-white leading-tight group-hover:text-[#12b3af] transition-colors line-clamp-2">
                {opportunity.title}
            </h3>
         </div>

         <div className="flex flex-wrap gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#12b3af]" />
                {opportunity.location}
            </div>
            <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                {opportunity.rating.toFixed(1)} / 5.0
            </div>
            <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                {opportunity.date}
            </div>
         </div>

         <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Valor do Negócio</span>
                <span className="text-lg font-extrabold text-[#12b3af]">{opportunity.price}</span>
            </div>
            
            <Link 
                href={`/oportunidades/${opportunity.id}`}
                className="flex items-center gap-2 bg-white/5 hover:bg-[#12b3af] text-white p-3 rounded-xl transition-all duration-300 transform group-hover:-translate-y-1"
            >
                <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Ver Oportunidade</span>
                <ArrowUpRight className="w-4 h-4" />
            </Link>
         </div>
      </div>
    </div>
  );
};
