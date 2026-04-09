"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export function SearchSection() {
  const router = useRouter();
  const [isAiMode, setIsAiMode] = useState(false);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");

  const toggleAiMode = () => {
    setIsAiMode((prev) => !prev);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (location) params.set("location", location);
    if (isAiMode) params.set("ai", "true");
    
    router.push(`/oportunidades?${params.toString()}`);
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
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="search-field">
              <div className="search-field-icon">
                <i className="fa fa-map-marker"></i>
              </div>
              <input 
                type="text" 
                placeholder="Localização..." 
                aria-label="Localização" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
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
