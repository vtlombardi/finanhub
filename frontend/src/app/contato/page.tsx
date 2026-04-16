'use client';

import React, { useState } from 'react';
import { Bricolage_Grotesque } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AuthModal } from '@/components/auth/AuthModal';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send,
  CheckCircle2,
  Building2,
  Users
} from 'lucide-react';
import './contact.css';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
});

export default function ContactPage() {
  const [authOpen, setAuthOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    empresa: '',
    email: '',
    telefone: '',
    assunto: 'Geral',
    mensagem: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mocking API call
    console.log('Sending contact lead:', formData);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitted(true);
    setFormData({
      nome: '',
      empresa: '',
      email: '',
      telefone: '',
      assunto: 'Geral',
      mensagem: ''
    });
  };

  return (
    <div className={`contact-container ${bricolage.className}`}>
      <Header onOpenAuth={() => setAuthOpen(true)} />

      <main>
        {/* HERO SECTION */}
        <section className="contact-hero">
          <div className="container">
            <span className="contact-hero-tag">Canais de Atendimento</span>
            <h1 style={{ fontFamily: bricolage.style.fontFamily }}>Contato</h1>
            <p>
              Estamos prontos para impulsionar seus negócios e conectar você às principais oportunidades do mercado.
            </p>
          </div>
        </section>

        {/* MAIN CONTENT GRID */}
        <section className="contact-content">
          <div className="container">
            <div className="contact-grid">
              
              {/* FORM AREA */}
              <div className="contact-form-side">
                {submitted ? (
                  <div className="feedback-success">
                    <CheckCircle2 size={48} color="var(--highlight-base)" style={{ margin: '0 auto 16px' }} />
                    <h2 style={{ fontFamily: bricolage.style.fontFamily, marginBottom: '8px' }}>Mensagem Enviada!</h2>
                    <p>Agradecemos o seu contato. Nossa equipe retornará seu chamado em breve.</p>
                    <button 
                      onClick={() => setSubmitted(false)} 
                      className="button button-bg is-primary" 
                      style={{ marginTop: '24px', width: 'auto' }}
                    >
                      Enviar Nova Mensagem
                    </button>
                  </div>
                ) : (
                  <div className="contact-form-wrapper">
                    <h2 className="contact-form-title" style={{ fontFamily: bricolage.style.fontFamily }}>
                      Fale Conosco
                    </h2>
                    <form onSubmit={handleSubmit} className="contact-form">
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="nome">Nome Completo</label>
                          <input 
                            type="text" 
                            id="nome" 
                            name="nome" 
                            placeholder="Seu nome"
                            value={formData.nome}
                            onChange={handleChange}
                            required 
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="empresa">Empresa</label>
                          <input 
                            type="text" 
                            id="empresa" 
                            name="empresa" 
                            placeholder="Sua empresa"
                            value={formData.empresa}
                            onChange={handleChange}
                            required 
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="email">E-mail Corporativo</label>
                          <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            placeholder="seu@email.com.br"
                            value={formData.email}
                            onChange={handleChange}
                            required 
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="telefone">Telefone / WhatsApp</label>
                          <input 
                            type="tel" 
                            id="telefone" 
                            name="telefone" 
                            placeholder="(11) 99999-9999"
                            value={formData.telefone}
                            onChange={handleChange}
                            required 
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="assunto">Assunto</label>
                        <select 
                          id="assunto" 
                          name="assunto" 
                          value={formData.assunto}
                          onChange={handleChange}
                          required
                        >
                          <option value="Geral">Assunto Geral</option>
                          <option value="Investimento">Quero Investir</option>
                          <option value="Venda">Quero Vender/Captar</option>
                          <option value="Parceria">Parcerias e Alianças</option>
                          <option value="Planos">Dúvidas sobre Planos</option>
                          <option value="Suporte">Suporte Técnico</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="mensagem">Mensagem</label>
                        <textarea 
                          id="mensagem" 
                          name="mensagem" 
                          placeholder="Como podemos ajudar seu negócio?"
                          value={formData.mensagem}
                          onChange={handleChange}
                          required
                        ></textarea>
                      </div>

                      <button type="submit" className="btn-submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>Processando...</>
                        ) : (
                          <>
                            Enviar Mensagem <Send size={18} />
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* INFORMATION SIDEBAR */}
              <div className="contact-info-wrap">
                
                {/* ADDRESS BLOCK */}
                <div className="info-block">
                  <h3>Sede Institucional</h3>
                  <div className="info-details" style={{ display: 'flex', gap: '12px' }}>
                    <MapPin size={24} color="var(--highlight-base)" style={{ flexShrink: 0, marginTop: '4px' }} />
                    <p>
                      Rua Engenheiro Luiz Carlos Berrini, 105<br />
                      Brooklin — São Paulo / SP<br />
                      CEP 04570-010
                    </p>
                  </div>
                </div>

                {/* DIRECT CHANNELS */}
                <div className="info-block">
                  <h3>Canais Diretos</h3>
                  <div className="info-details" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Mail size={20} color="var(--highlight-base)" />
                      <span>contato@finanhub.com.br</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Phone size={20} color="var(--highlight-base)" />
                      <span>+55 (11) 4004-XXXX</span>
                    </div>
                  </div>
                </div>

                {/* SOCIAL MEDIA */}
                <div className="info-block">
                  <h3>Siga a FINANHUB</h3>
                  <div className="social-links">
                    <a href="https://linkedin.com/company/finanhub" target="_blank" rel="noopener noreferrer" className="social-icon">
                      <i className="fa fa-linkedin"></i>
                    </a>
                    <a href="https://instagram.com/finanhub" target="_blank" rel="noopener noreferrer" className="social-icon">
                      <i className="fa fa-instagram"></i>
                    </a>
                    <a href="https://twitter.com/finanhub" target="_blank" rel="noopener noreferrer" className="social-icon">
                      <i className="fa fa-twitter"></i>
                    </a>
                    <a href="https://facebook.com/finanhub" target="_blank" rel="noopener noreferrer" className="social-icon">
                      <i className="fa fa-facebook"></i>
                    </a>
                  </div>
                </div>

                {/* MAP */}
                <div className="map-container">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3656.3292415175!2d-46.69614742466986!3d-23.61044497873856!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce572f6a70e70d%3A0x6e2f1f0d3b6f9f95!2sRua%20Engenheiro%20Luiz%20Carlos%20Berrini%2C%20105%20-%20Brooklin%2C%20S%C3%A3o%20Paulo%20-%20SP%2C%2004571-010!5e0!3m2!1spt-BR!2sbr!4v1713217436000!5m2!1spt-BR!2sbr" 
                    width="600" 
                    height="450" 
                    style={{ border: 0 }} 
                    allowFullScreen={true} 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>

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
