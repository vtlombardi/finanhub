'use client';

import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';

interface OpportunityHeroProps {
  onSearch: (query: string, isAi: boolean) => void;
  initialQuery?: string;
}

export const OpportunityHero: React.FC<OpportunityHeroProps> = ({ onSearch, initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [isAi, setIsAi] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, isAi);
  };

  const suggestions = [
    'Compra e Venda de Empresas',
    'Investimentos',
    'Franquias',
    'Projetos e Startups',
    'Imóveis para Negócios'
  ];

  return (
    <section className="relative overflow-hidden pt-16 pb-24 bg-[#0a101b]">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#12b3af]/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#12b3af]/5 blur-[100px] rounded-full -translate-x-1/4 translate-y-1/4"></div>
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight uppercase">
              Onde negócios <span className="text-[#12b3af]">sérios</span> se encontram
            </h1>
            <p className="text-gray-400 text-lg md:text-xl font-light max-w-2xl mx-auto">
              Explore oportunidades verificadas, refine sua busca com inteligência e encontre negócios alinhados ao seu perfil de investimento.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="relative group">
            <div className="relative flex items-center bg-white/5 border border-white/10 p-2 rounded-2xl backdrop-blur-md shadow-2xl transition-all duration-300 group-focus-within:border-[#12b3af]/50 group-focus-within:bg-white/10">
              <div className="flex-1 flex items-center px-4">
                <Search className="w-5 h-5 text-gray-500 mr-3" />
                <input
                  type="text"
                  placeholder="Buscar por oportunidades, setores ou palavras-chave..."
                  className="w-full bg-transparent border-none outline-none text-white placeholder:text-gray-500 py-4 text-lg"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2 pr-2">
                <button
                  type="button"
                  onClick={() => setIsAi(!isAi)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${isAi ? 'bg-[#12b3af]/20 text-[#12b3af] border border-[#12b3af]/30' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-semibold">IA</span>
                </button>
                <button 
                  type="submit"
                  className="bg-[#12b3af] hover:bg-[#0f9895] text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95"
                >
                  Buscar
                </button>
              </div>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <span className="text-xs text-gray-500 uppercase tracking-widest block w-full mb-2">Sugestões rápidas</span>
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => { setQuery(s); onSearch(s, isAi); }}
                className="text-xs font-medium px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-[#12b3af]/40 hover:bg-[#12b3af]/5 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
