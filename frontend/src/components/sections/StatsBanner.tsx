"use client";

import React, { useEffect, useRef } from "react";

// Os números fixos abaixo (100, 200, 12, etc) vieram estáticos do mockup legado.
// Na arquitetura Enterprise, serão cacheados pelo Next.js baseados no payload do banco de dados real.

export function StatsBanner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Espaço reservado para o script estático dos números subindo (CountUp) 
    // e o canvas network background (stars/nodes).
  }, []);

  return (
    <section className="stats-section" id="statsSection">
      <canvas id="statsCanvas" ref={canvasRef}></canvas>
      <div className="container stats-inner">
        <div className="section-eyebrow">FINANHUB em números</div>
        <div className="stats-grid">
          
          <div className="stat-item d1 visible" data-target="100" data-suffix="+">
            <span className="stat-num">100+</span>
            <span className="stat-label">Consultores em todo o Brasil</span>
          </div>
          
          <div className="stat-item d2 visible" data-target="200" data-suffix="M">
            <span className="stat-num">200M</span>
            <span className="stat-label">Em linhas de crédito</span>
          </div>
          
          <div className="stat-item d3 visible" data-target="12" data-suffix="M+">
            <span className="stat-num">12M+</span>
            <span className="stat-label">Acessos estimados</span>
          </div>
          
          <div className="stat-item d4 visible" data-target="1000" data-format="k" data-suffix="">
            <span className="stat-num">1000k</span>
            <span className="stat-label">Empresas auxiliadas</span>
          </div>
          
          <div className="stat-item d5 visible" data-target="98" data-suffix="%">
            <span className="stat-num">98%</span>
            <span className="stat-label">Clientes satisfeitos</span>
          </div>
          
          <div className="stat-item d6 visible" data-target="500" data-suffix="+">
            <span className="stat-num">500+</span>
            <span className="stat-label">Empresas cadastradas</span>
          </div>

        </div>
      </div>
    </section>
  );
}
