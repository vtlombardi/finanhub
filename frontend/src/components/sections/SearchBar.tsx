'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export const SearchBar: React.FC = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [aiMode, setAiMode] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (location) params.set('location', location);
    router.push(`/oportunidades?${params.toString()}`);
  };

  return (
    <div className="thin-strip-base" id="thin-strip-search" data-type="4" data-bg="brand" has-gap>
      <div className="container">
        <div className="search-wrapper">
          <div className="ai-mode-toggle">
            <span className="ai-mode-toggle-icon">
              <img 
                src="https://finanhub.com.br/assets/images/icon-ai.svg" 
                alt="IA" 
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
              />
            </span>
            <span className="ai-mode-toggle-text">Modo IA</span>
            <div 
              className={`switch-button ${!aiMode ? 'is-disable' : ''}`} 
              id="aiModeToggle"
              onClick={() => setAiMode(!aiMode)}
            >
              <span className="toggle-item"></span>
            </div>
          </div>
          <form className={`content-form ${aiMode ? 'ai-mode' : 'normal-mode'}`} onSubmit={handleSearch}>
            <div className="input-group">
              <div className="input-group-icon">
                <div className="icon icon-lg">
                  <i className="fa fa-search"></i>
                </div>
              </div>
              <input 
                type="text" 
                className="input" 
                placeholder="Buscar por oportunidades, setores ou palavras-chave..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="input-group" id="searchLocationDiv">
              <div className="input-group-icon">
                <div className="icon icon-lg">
                  <i className="fa fa-map-marker"></i>
                </div>
              </div>
              <input 
                type="text" 
                className="input" 
                placeholder="Localização..." 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="input-group-action">
              <button type="submit" className="button button-bg is-primary">Buscar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
