import React from 'react';
import Link from 'next/link';

export const Hero: React.FC = () => {
  return (
    <section className="custom-content">
      <section className="finanhub-hero-widget">
        <div className="finanhub-container">
          <div className="finanhub-content">
            <h1>ONDE OS <span className="highlight">NEGÓCIOS</span> E AS <span className="highlight">OPORTUNIDADES</span> SE ENCONTRAM</h1>
            <p>Conecte-se com investidores e empreendedores em um ambiente seguro e profissional.</p>
            <Link className="finanhub-btn" href="/oportunidades">Explorar Oportunidades</Link>
          </div>
        </div>
      </section>
    </section>
  );
};
