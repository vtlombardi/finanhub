'use client';

import React from 'react';
import Link from 'next/link';

export interface Opportunity {
  id: string;
  title: string;
  description: string;
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
    <Link href={`/oportunidades/${opportunity.id}`} className="card">
      {/* 1. Imagem com hover zoom */}
      <div className="image-container">
        <img src={opportunity.image} alt={opportunity.title} />
        <div className="image-overlay" />
        
        {/* Badges do Topo */}
        <div className="badges-container">
          {/* 2. Badge categoria */}
          <span className="badge-left">
            {typeof opportunity.category === 'object' ? (opportunity.category as any).name : opportunity.category}
          </span>
          
          <div className="badge-right">
            {/* 3. Badge NOVO (Amarelo) - Simulado com base na data se necessário, mas fixo aqui por design */}
            <span className="badge-new">NOVO</span>
            {/* 4. Badge ATIVO (Cinza) */}
            <span className="badge-status">{opportunity.status}</span>
          </div>
        </div>
      </div>
      
      <div className="content">
        {/* 5. Título com hover */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="group-hover:text-[#00b8b2] transition-colors">{opportunity.title}</h3>
          {opportunity.verified && (
            <svg className="text-[#00b8b2]" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-4-4 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z"></path></svg>
          )}
        </div>
        
        {/* 6. Descrição curta */}
        <p className="description opacity-60 text-xs leading-relaxed line-clamp-2 mb-4">
          {opportunity.description}
        </p>
        
        {/* 7 & 8. Valor do Ativo destacado */}
        <div className="value-container group-hover:bg-[#00b8b2]/5 transition-all">
          <span className="value-label text-[#00b8b2]">Valor do Ativo</span>
          <span className="value-amount">{opportunity.price}</span>
        </div>

        {/* 9. Metadados Adicionais */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
          <div className="location-container !mb-0">
            <svg className="location-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span className="text-[10px]">
              {typeof opportunity.location === 'object' ? (opportunity.location as any).name : opportunity.location}
            </span>
          </div>
          <div className="flex items-center gap-1.5 grayscale opacity-40">
             <span className="text-[10px] lowercase font-medium">{(opportunity.rating || 0).toFixed(2)}</span>
             <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-500"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
          </div>
        </div>
        
        {/* 10. Botão CTA */}
        <button className="mt-5 w-full bg-[#00b8b2] text-black py-3 rounded-xl font-bold text-xs hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-[#00b8b2]/10">
          Detalhes do Negócio
        </button>
      </div>
    </Link>
  );
};
