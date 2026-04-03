"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";

export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Espaço reservado para o script Vanilla JS do Canvas que gerava as estrelas/partículas
    // Pode ser reinjetado aqui ou substituído por uma biblioteca React modernizada.
    console.log("Canvas mount: ", canvasRef.current);
  }, []);

  return (
    <section className="hero" id="hero">
      <div className="hero-bg"></div>
      <canvas className="hero-canvas" id="heroCanvas" ref={canvasRef}></canvas>
      <div className="container">
        <div className="hero-content reveal visible d1">
          <div className="hero-badge">
            <span className="dot"></span> Plataforma de Negócios #1 do Brasil
          </div>
          <h1>
            ONDE OS <span className="accent">NEGÓCIOS</span> E AS{" "}
            <span className="accent">OPORTUNIDADES</span> SE ENCONTRAM
          </h1>
          <p>Conecte-se com investidores e empreendedores em um ambiente seguro e profissional.</p>
          <div className="hero-actions">
            <Link href="/oportunidades" className="btn btn-primary btn-lg">
              <i className="fa fa-compass"></i> Explorar Oportunidades
            </Link>
            <button className="btn btn-outline btn-lg" onClick={() => console.log("Open Modal Auth")}>
              <i className="fa fa-user"></i> Criar Conta
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
