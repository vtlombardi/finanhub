import React from 'react';

export const Metrics: React.FC = () => {
  return (
    <section className="custom-content">
      <section className="finanhub-metrics" data-bg="brand">
        <div className="container">
          <header className="finanhub-header">
            <div className="finanhub-logo">
              <img src="https://finanhub.com.br/media/cache/logo/custom/domain_1/content_files/img_logo.png?1770814367" alt="FINANHUB" />
            </div>
          </header>
          <div className="finanhub-content">
            <article className="finanhub-text">
              <p>A FINANHUB nasce no ambiente digital após anos de atuação sólida no mercado offline, acumulando experiência prática, conexões estratégicas e resultados reais.</p>
              <p>Antes de se tornar uma plataforma, a FINANHUB foi construída com base em negócios concretos, projetos estruturados e negociações acompanhadas de perto.</p>
              <p>Agora, essa trajetória evolui para o online, levando credibilidade, método e visão estratégica para um ecossistema digital que conecta investidores, empresas e oportunidades de forma organizada e profissional.</p>
              <p>Com tecnologia e alcance, a FINANHUB amplia o que sempre fez bem: transformar conexões em negócios reais.</p>
              <p className="finanhub-claim">FINANHUB. Onde negócios sérios se encontram.</p>
            </article>
            <section className="finanhub-stats" aria-label="Nossos números">
              <div className="finanhub-stats-grid">
                <article className="finanhub-stat">
                  <p className="finanhub-stat-value">100+</p>
                  <p className="finanhub-stat-label">Consultores em todo o Brasil</p>
                </article>
                <article className="finanhub-stat">
                  <p className="finanhub-stat-value">200M</p>
                  <p className="finanhub-stat-label">Em linhas de crédito para nossos clientes</p>
                </article>
                <article className="finanhub-stat">
                  <p className="finanhub-stat-value">12M+</p>
                  <p className="finanhub-stat-label">Acessos estimados em nossa página</p>
                </article>
                <article className="finanhub-stat">
                  <p className="finanhub-stat-value">1.000</p>
                  <p className="finanhub-stat-label">Empresas auxiliadas em nossa jornada</p>
                </article>
                <article className="finanhub-stat">
                  <p className="finanhub-stat-value">98%</p>
                  <p className="finanhub-stat-label">Clientes satisfeitos</p>
                </article>
                <article className="finanhub-stat">
                  <p className="finanhub-stat-value">500+</p>
                  <p className="finanhub-stat-label">Empresas cadastradas</p>
                </article>
              </div>
            </section>
          </div>
        </div>
      </section>
    </section>
  );
};
