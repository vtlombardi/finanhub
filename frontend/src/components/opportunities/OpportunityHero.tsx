'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export function OpportunityHero() {
  const [aiMode, setAiMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    // Combinar termos de busca e localização para o parâmetro 'q' conforme solicitado
    const combinedQuery = [searchQuery, locationQuery].filter(Boolean).join(' ');
    
    if (combinedQuery) {
      params.set('q', combinedQuery);
    }

    router.push(`/oportunidades?${params.toString()}`);
  };

  return (
    <section className="finanhub-hero-widget !p-0 overflow-hidden relative min-h-[650px]">
      {/* Background Layer (Video or Static fallback) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="w-full h-full object-cover opacity-40 brightness-[0.7]"
          poster="https://finanhub.com.br/assets/images/hero-bg-poster.jpg"
        >
          <source src="https://finanhub.com.br/assets/video/hero-bg.mp4" type="video/mp4" />
        </video>
        {/* Overlay do Design System */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-[#020617]"></div>
      </div>
      
      {/* Content Container - Centralização Absoluta */}
      <div className="finanhub-container relative z-10 flex flex-col items-center justify-center text-center">
        <div className="finanhub-content w-full flex flex-col items-center">
          {/* Título Institucional */}
          <h1 className="!mb-6 !text-5xl lg:!text-6xl !font-black tracking-tight drop-shadow-2xl">
            NEGÓCIOS <span className="highlight">SÉRIOS</span> SE ENCONTRAM
          </h1>
          
          {/* Subtítulo Premium */}
          <p className="!mb-12 !max-w-[750px] !text-lg lg:!text-xl !font-light opacity-80 leading-relaxed drop-shadow-lg">
            A maior e mais qualificada rede de M&A do Brasil. Conectamos ativos premium a investidores que buscam resultados excepcionais.
          </p>

          {/* Barra de Busca (Padrão Institucional) */}
          <div className="search-wrapper !mt-0 !bg-white/10 !backdrop-blur-xl !border-white/20 !w-full !max-w-[950px] !p-6 !rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            {/* IA Toggle Switch */}
            <div className="ai-mode-toggle !mb-6 !justify-center flex items-center gap-3">
              <span className="ai-mode-toggle-icon">
                <img 
                  src="https://finanhub.com.br/assets/images/icon-ai.svg" 
                  alt="IA" 
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
                  className="w-[20px] h-[20px]"
                />
              </span>
              <span className="ai-mode-toggle-text !text-[12px] !font-bold uppercase tracking-widest text-[#00b8b2]">Busca auxiliada por IA</span>
              <div 
                className={`switch-button w-10 h-5 bg-white/10 rounded-full relative cursor-pointer border border-white/10 ${!aiMode ? 'is-disable' : 'bg-[#00b8b2]/20'}`} 
                onClick={() => setAiMode(!aiMode)}
              >
                <span className={`absolute top-0.5 left-0.5 w-[14px] h-[14px] bg-white rounded-full transition-all duration-300 ${aiMode ? 'translate-x-[20px] bg-[#00b8b2]' : 'translate-x-0'}`}></span>
              </div>
            </div>

            {/* Form Pill */}
            <form onSubmit={handleSearch} className={`content-form !bg-white !rounded-full !flex !items-center !p-1 !w-full shadow-inner ${aiMode ? 'ai-mode border-2 border-[#00b8b2]/20' : 'normal-mode'}`}>
              <div className="input-group !flex-1 !flex !items-center !px-6 border-r border-gray-100">
                <i className="fa fa-search text-gray-400 mr-3"></i>
                <input 
                  type="text" 
                  className="!w-full !bg-transparent !py-4 !text-sm !text-black outline-none placeholder:text-gray-400" 
                  placeholder="Buscar por setores, palavras-chave ou faturamento..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="input-group !flex-[0.6] !flex !items-center !px-6">
                <i className="fa fa-map-marker text-gray-400 mr-3"></i>
                <input 
                  type="text" 
                  className="!w-full !bg-transparent !py-4 !text-sm !text-black outline-none placeholder:text-gray-400" 
                  placeholder="Localização..." 
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                />
              </div>

              <div className="input-group-action ml-auto !p-1">
                <button type="submit" className="bg-[#00b8b2] text-black font-bold py-4 px-12 rounded-full hover:brightness-110 active:scale-[0.98] transition-all text-sm uppercase tracking-widest shadow-lg">
                  Buscar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
