"use client";

import React, { useState } from "react";

export function SearchSection() {
  const [isAiMode, setIsAiMode] = useState(false);

  const toggleAiMode = () => {
    setIsAiMode((prev) => !prev);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Searching... AI Mode: ${isAiMode}`);
    // Futura integração com o Backend ou Agentes de IA
  };

  return (
    <section className="search-section">
      <div className="container">
        {/* Adicionado fallback de "visible" para contornar temporariamente o scroll reveal legado */}
        <div className="search-box reveal visible">
          <div className="search-ai-toggle">
            <div
              className={`toggle-track ${isAiMode ? "on" : ""}`}
              id="aiToggle"
              onClick={toggleAiMode}
              role="switch"
              aria-checked={isAiMode}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") toggleAiMode();
              }}
            >
              <div className="toggle-thumb"></div>
            </div>
            <span>
              Modo <span className="ai-label">IA</span> — busca semântica inteligente
            </span>
          </div>
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-field">
              <div className="search-field-icon">
                <i className="fa fa-search"></i>
              </div>
              <input
                type="text"
                placeholder="Buscar por oportunidades, setores ou palavras-chave..."
                aria-label="Busca"
              />
            </div>
            <div className="search-field">
              <div className="search-field-icon">
                <i className="fa fa-map-marker"></i>
              </div>
              <input type="text" placeholder="Localização..." aria-label="Localização" />
            </div>
            <div className="search-action">
              <button className="btn btn-primary" type="submit">
                Buscar
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
