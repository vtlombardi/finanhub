'use client';

import React, { useState } from 'react';
import { Bricolage_Grotesque } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AuthModal } from '@/components/auth/AuthModal';
import { 
  Shield, 
  Target, 
  Zap, 
  Users, 
  ChevronRight, 
  Building2, 
  Globe, 
  Lock, 
  TrendingUp, 
  Cpu,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import './about.css';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
});

export default function AboutPage() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className={`about-container ${bricolage.className}`}>
      <Header onOpenAuth={() => setAuthOpen(true)} />

      <main>
        {/* 1. HERO INSTITUCIONAL */}
        <section className="hero-about">
          <div className="hero-about-bg"></div>
          <div className="hero-about-content">
            <span className="hero-tag">Ecossistema de Alta Performance</span>
            <h1 style={{ fontFamily: bricolage.style.fontFamily }}>
              Onde o Capital Encontra a <span className="text-cyan-400">Estratégia</span>
            </h1>
            <p>
              A Finanhub é a plataforma definitiva de conexão estratégica para o mercado de M&A e investimentos, 
              unindo inteligência de dados e segurança jurídica para gerar valor real ao ecossistema corporativo.
            </p>
          </div>
        </section>

        {/* 2. QUEM SOMOS */}
        <section className="section-padding flow-transition-down">
          <div className="container">
            <div className="who-we-are-grid">
              <div className="who-text">
                <span className="section-label">Posicionamento</span>
                <h2 className="section-title">Mais que um marketplace, um motor de liquidez.</h2>
                <p>
                  Nascemos da necessidade de profissionalizar e acelerar o fluxo de capitais no Brasil. 
                  A Finanhub atua como o ponto de convergência entre empresas em busca de expansão e 
                  investidores ávidos por ativos qualificados.
                </p>
                <p>
                  Combinamos a agilidade do ambiente digital com o rigor do mercado financeiro tradicional, 
                  proporcionando um ambiente de visibilidade qualificada onde grandes decisões são tomadas com 
                  embasamento e discrição.
                </p>
              </div>
              <div className="who-stats">
                <div className="stat-box">
                  <h4>R$ 450M</h4>
                  <span>Oportunidades</span>
                </div>
                <div className="stat-box">
                  <h4>500+</h4>
                  <span>Investidores</span>
                </div>
                <div className="stat-box">
                  <h4>100%</h4>
                  <span>Proteção LGPD</span>
                </div>
                <div className="stat-box">
                  <h4>AI</h4>
                  <span>Matching</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. MISSÃO / VISÃO / VALORES */}
        <section className="section-padding mvv-section">
          <div className="container">
            <div className="text-center mb-12">
              <span className="section-label">Fundamentos</span>
              <h2 className="section-title">Nossa Base de Governança</h2>
            </div>
            
            <div className="mvv-grid">
              <div className="mvv-card">
                <Target className="mvv-icon w-8 h-8" />
                <h3>Missão</h3>
                <p>Facilitar conexões estratégicas e gerar liquidez para o mercado corporativo através de tecnologia, transparência e curadoria qualificada de ativos.</p>
              </div>
              <div className="mvv-card">
                <Globe className="mvv-icon w-8 h-8" />
                <h3>Visão</h3>
                <p>Ser a plataforma líder e o padrão de referência em transações de M&A e investimentos B2B na América Latina até 2027.</p>
              </div>
              <div className="mvv-card">
                <Shield className="mvv-icon w-8 h-8" />
                <h3>Valores</h3>
                <p>Ética inegociável, inovação focada em resultados, discrição absoluta e compromisso total com o sucesso do cliente.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. DIFERENCIAIS */}
        <section className="section-padding diff-section">
          <div className="container">
            <div className="mb-12">
              <span className="section-label">Por que Finanhub?</span>
              <h2 className="section-title">Autoridade em Conexões</h2>
            </div>

            <div className="diff-grid">
              <div className="diff-item">
                <Zap className="mvv-icon w-6 h-6" />
                <div className="diff-i-content">
                  <h4>Inteligência Ativa</h4>
                  <p>Não somos um mural estático. Nossa tecnologia caça ativamente o match perfeito para cada ativo listado.</p>
                </div>
              </div>
              <div className="diff-item">
                <Users className="mvv-icon w-6 h-6" />
                <div className="diff-i-content">
                  <h4>Rede High-End</h4>
                  <p>Acesso direto a fundos de Private Equity, Venture Capital e Compradores Estratégicos selecionados.</p>
                </div>
              </div>
              <div className="diff-item">
                <Lock className="mvv-icon w-6 h-6" />
                <div className="diff-i-content">
                  <h4>Segurança Blindada</h4>
                  <p>Fluxos de NDA automatizados e Data Rooms criptografados que garantem a integridade total da sua empresa.</p>
                </div>
              </div>
              <div className="diff-item">
                <TrendingUp className="mvv-icon w-6 h-6" />
                <div className="diff-i-content">
                  <h4>Visibilidade Qualificada</h4>
                  <p>Sua oportunidade no radar certo, sem exposição desnecessária e com foco em transações de alto nível.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. O QUE ENTREGAMOS */}
        <section className="section-padding delivery-section">
          <div className="container">
            <div className="text-center mb-12">
              <span className="section-label">Valor Prático</span>
              <h2 className="section-title">Nossas entregas ao ecossistema</h2>
            </div>

            <div className="delivery-grid">
              <div className="delivery-card">
                <div className="del-icon"><Cpu /></div>
                <h5>Auditoria por IA</h5>
                <p>Validação preliminar de ativos para garantir a qualidade de quem anuncia.</p>
              </div>
              <div className="delivery-card">
                <div className="del-icon"><Building2 /></div>
                <h5>Matching Setorial</h5>
                <p>Algoritmos que cruzam teses de investimento com oportunidades reais.</p>
              </div>
              <div className="delivery-card">
                <div className="del-icon"><Shield /></div>
                <h5>Governança M&A</h5>
                <p>Padronização de documentos e fluxos de negociação para maior agilidade.</p>
              </div>
              <div className="delivery-card">
                <div className="del-icon"><ArrowRight /></div>
                <h5>Liquidez Real</h5>
                <p>Transformamos ativos em negócios concluídos com velocidade e segurança.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. BLOCO DE POSICIONAMENTO / TECNOLOGIA */}
        <section className="section-padding tech-section flow-transition-down">
          <div className="container">
            <div className="tech-inner">
              <div className="who-text">
                <span className="section-label">Inovação e Inteligência</span>
                <h2 className="section-title">Tecnologia a Serviço da Geração de Valor</h2>
                <p className="text-gray-400 leading-relaxed mb-6">
                  A Finanhub investe continuamente em Inteligência Artificial e Segurança da Informação para 
                  antecipar tendências de mercado e oferecer aos nossos usuários as ferramentas mais avançadas de 
                  negociação digital do mundo.
                </p>
                <div className="flex items-center gap-4 text-cyan-400 font-bold uppercase tracking-widest text-[10px] opacity-80">
                  <div className="w-8 h-[1px] bg-cyan-400"></div>
                  Inovação em Estado Bruto
                </div>
              </div>
              <div className="tech-visual">
                <div className="tech-glow"></div>
                <div className="glass-card p-8 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-xl relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-cyan-400/20 rounded-lg flex items-center justify-center text-cyan-400">
                      <Cpu className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Finanhub Brain</h4>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Processing real-time business opportunities</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400 w-3/4 animate-pulse"></div>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400 w-1/2 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-cyan-400/60 font-mono mt-4">
                      <span>MATCHING_ENGINE: ACTIVE</span>
                      <span>v3.4.2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. CTA FINAL (REFINADO) */}
        <section className="final-cta">
          <div className="container">
            <div className="cta-wrap">
              <h2 style={{ fontFamily: bricolage.style.fontFamily }}>
                Sua oportunidade merece mais do que visibilidade. <span className="text-cyan-400">Merece posicionamento.</span>
              </h2>
              <p>
                A Finanhub foi criada para empresas, projetos e ativos que precisam se apresentar ao mercado com mais força, 
                credibilidade e inteligência estratégica. Se você busca ampliar alcance, atrair investidores ou gerar novas 
                conexões comerciais, oferecemos o ambiente ideal para transformar oportunidades em negócios reais.
              </p>
              
              <div className="cta-actions">
                <button 
                  className="btn-premium btn-primary flex items-center gap-2 group"
                  onClick={() => window.location.href = '/anuncie'}
                >
                  Anuncie na Finanhub
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  className="btn-premium btn-outline"
                  onClick={() => setAuthOpen(true)}
                >
                  Falar com especialista
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
