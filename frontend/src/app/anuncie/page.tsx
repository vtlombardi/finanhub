'use client';

import React, { useState } from 'react';
import { Bricolage_Grotesque } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AuthModal } from '@/components/auth/AuthModal';
import { Check, Shield, Zap, Target, Lock, BarChart3, Users, MessageSquareMore, Info, Sparkles, Loader2 } from 'lucide-react';
import { usePlans } from '@/hooks/usePlans';
import './pricing.css';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
});

const WORKFLOW = [
  { title: 'Publicação Anônima', desc: 'Sua empresa é listada sem revelar dados sensíveis ou nome real.' },
  { title: 'IA Qualifica Interessados', desc: 'Nossos agentes filtram apenas quem possui prova de fundos e fit real.' },
  { title: 'NDA Automático', desc: 'Assinatura digital obrigatória antes de qualquer acesso a documentos.' },
  { title: 'Data Room Seguro', desc: 'Investidores aprovados acessam sua documentação em ambiente blindado.' },
  { title: 'Negociação Direta', desc: 'Feche o deal com suporte de nossa inteligência de dados.' }
];

export default function PricingPage() {
  const [authOpen, setAuthOpen] = useState(false);
  const { plans, loading } = usePlans();

  // Se estiver carregando, podemos mostrar um placeholder ou os planos antigos como fallback
  // Para garantir consistência visual agressiva, se o hook falhar ou demorar, 
  // mantemos a estrutura mas com estado de loading.

  return (
    <div className={`pricing-container ${bricolage.className}`}>
      <Header onOpenAuth={() => setAuthOpen(true)} />

      <main>
        {/* HERO SECTION */}
        <section className="hero-section">
          <div className="container mx-auto px-4">
            <div className="hero-badge">Apenas 3 slots de destaque por setor este mês</div>
            <h1 className="hero-title">
              Venda sua operação para o <span className="text-cyan-400">investidor certo</span>, com discrição absoluta.
            </h1>
            <p className="hero-subtitle">
              O FINANHUB une inteligência artificial e segurança jurídica para gerar liquidez real ao seu negócio. Ative sua captação em minutos.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>NDA Flow Automático</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Target className="w-4 h-4 text-cyan-400" />
                <span>Matching Ativo</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Lock className="w-4 h-4 text-cyan-400" />
                <span>Data Room Criptografado</span>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST BAR / PROOF OF VALUE */}
        <section className="py-8 border-y border-white/5 bg-white/2">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold mb-1">R$ 450M</div>
                <div className="text-xs uppercase tracking-widest text-gray-500">Volume Transacionado</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1">+500</div>
                <div className="text-xs uppercase tracking-widest text-gray-500">Investidores Ativos</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1">100%</div>
                <div className="text-xs uppercase tracking-widest text-gray-500">Criptografia B2B</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1">98%</div>
                <div className="text-xs uppercase tracking-widest text-gray-500">Taxa de Match</div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section className="pricing-section container mx-auto px-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
              <p className="text-gray-400">Sincronizando as melhores ofertas de M&A...</p>
            </div>
          ) : (
            <div className="pricing-grid">
              {plans.map((plan) => (
                <div key={plan.id} className={`glass-card plan-card ${plan.highlight ? 'highlight' : ''}`}>
                  {plan.highlight && <div className="plan-badge">Ouro / Recomendado</div>}
                  
                  <div className="mb-10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="plan-name">{plan.name}</div>
                      {plan.tier === 'ELITE' && <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />}
                    </div>
                    <div className="text-cyan-400 text-sm font-bold tracking-tighter mb-2">{plan.power}</div>
                    <div className="plan-price">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plan.price)}
                      <span>{plan.recurrence}</span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4">{plan.description}</p>
                    <div className="plan-impact-box">
                      <Info className="w-3 h-3 text-cyan-400" />
                      <span>{plan.impact}</span>
                    </div>
                  </div>

                  <ul className="feature-list">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="feature-item">
                        <Check className="w-5 h-5 feature-icon" />
                        <span>{feature.text}</span>
                      </li>
                    ))}
                  </ul>

                  <button 
                    className={`btn-premium ${plan.highlight ? 'btn-accent' : 'btn-base'}`}
                    onClick={() => setAuthOpen(true)}
                  >
                    {plan.cta}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* WORKFLOW SECTION */}
        <section className="workflow-section">
          <div className="container mx-auto px-4">
            <span className="section-tag">Infraestrutura Profissional</span>
            <h2 className="section-title">Como o Deal acontece no FINANHUB</h2>
            
            <div className="workflow-grid">
              {WORKFLOW.map((step, idx) => (
                <div key={idx} className="workflow-step">
                  <div className="step-number">{idx + 1}</div>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-desc">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ STRATÉGICO */}
        <section className="faq-section bg-white/[0.01] border-y border-white/5">
          <div className="container mx-auto px-4 max-w-4xl">
            <span className="section-tag">Dúvidas Frequentes</span>
            <h2 className="section-title">Confidencialidade e Processo</h2>
            <div className="grid gap-6">
              <div className="glass-card faq-card">
                <h4 className="flex items-center gap-3 text-lg font-bold mb-4">
                  <Lock className="w-5 h-5 text-cyan-400" />
                  Como é garantido o anonimato da minha empresa?
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed opacity-90">
                  Utilizamos um sistema de "Blind Listing". O investidor inicialmente acessa apenas o setor, a região e os indicadores financeiros macro. Detalhes como CNPJ, nome da empresa e documentos só são revelados após você aprovar a prova de fundos e o investidor assinar o NDA automático com validade jurídica.
                </p>
              </div>
              <div className="glass-card faq-card">
                <h4 className="flex items-center gap-3 text-lg font-bold mb-4">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  Meus funcionários podem ver o anúncio?
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed opacity-90">
                  Graças ao anonimato total da publicação e ao rastro digital, o anúncio não aparece indexado por termos que revelem sua identidade. Além disso, você pode bloquear acessos por região geográfica específica se desejar.
                </p>
              </div>
              <div className="glass-card faq-card">
                <h4 className="flex items-center gap-3 text-lg font-bold mb-4">
                  <Users className="w-5 h-5 text-cyan-400" />
                  Qual a qualidade dos investidores na base?
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed opacity-90">
                  Nossa base é formada por 500+ membros verificados, incluindo fundos de Venture Capital, Private Equity e compradores estratégicos. No plano Elite, nossa IA faz o matching ativo apenas com quem já demonstrou interesse em mandatos de compra similares.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PROMOTIONAL BANNERS SECTION */}
        <section className="banners-section">
          <div className="container mx-auto px-4">
            <span className="section-tag">Ecossistema</span>
            <h2 className="section-title">Expanda seu Poder Comercial</h2>
            <div className="promo-banners-grid">
              
              {/* Banner 1: Anunciar */}
              <div className="glass-card promo-banner banner-anuncie group transition-all">
                <Users className="banner-icon group-hover:scale-110 transition-transform duration-500" />
                <h3>Expandir presença no marketplace de M&A</h3>
                <p>Ocupe seu espaço no radar dos players mais estratégicos e garanta liquidez institucional para sua operação.</p>
                <ul className="bullet-list">
                  <li className="bullet-item"><Check className="w-4 h-4 text-cyan-400" /> Rede de Private Equity Verificada</li>
                  <li className="bullet-item"><Check className="w-4 h-4 text-cyan-400" /> Dashboards de negociação real-time</li>
                  <li className="bullet-item"><Check className="w-4 h-4 text-cyan-400" /> Curadoria humana especializada</li>
                </ul>
                <button className="btn-banner">Expandir Alcance Comercial</button>
              </div>

              {/* Banner 2: HAYIA */}
              <div className="glass-card promo-banner banner-hayia group transition-all">
                <Zap className="banner-icon group-hover:scale-110 transition-transform duration-500" />
                <h3>HAYIA: O Cérebro que encontra investidores</h3>
                <p>Nossa inteligência ativa não apenas lista, ela caça o match perfeito analisando mandatos de compra em tempo real.</p>
                <ul className="bullet-list">
                  <li className="bullet-item"><Check className="w-4 h-4 text-cyan-400" /> Matching Ativo 24/7 (Deep Learning)</li>
                  <li className="bullet-item"><Check className="w-4 h-4 text-cyan-400" /> Análise preditiva de Valuation</li>
                  <li className="bullet-item"><Check className="w-4 h-4 text-cyan-400" /> Blind Matching: Sigilo Total</li>
                </ul>
                <button className="btn-banner">Ativar Matching por IA</button>
              </div>

              {/* Banner 3: Crédito */}
              <div className="glass-card promo-banner banner-credit group transition-all">
                <BarChart3 className="banner-icon group-hover:scale-110 transition-transform duration-500" />
                <h3>Captação de Crédito para Expansão</h3>
                <p>Fôlego financeiro para consolidar sua liderança. Encontramos a linha de crédito exata para o seu momento.</p>
                <ul className="bullet-list">
                  <li className="bullet-item"><Check className="w-4 h-4 text-cyan-400" /> Taxas exclusivas do ecossistema</li>
                  <li className="bullet-item"><Check className="w-4 h-4 text-cyan-400" /> Processo 100% digital e ágil</li>
                  <li className="bullet-item"><Check className="w-4 h-4 text-cyan-400" /> Suporte na estruturação de dívida</li>
                </ul>
                <button className="btn-banner">Simular Linha de Crédito</button>
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
