'use client';

import React, { useState } from 'react';
import { Bricolage_Grotesque } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AuthModal } from '@/components/auth/AuthModal';
import './terms.css';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
});

export default function TermsOfUsePage() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className={`terms-container ${bricolage.className}`}>
      <Header onOpenAuth={() => setAuthOpen(true)} />

      <main>
        {/* HERO */}
        <section className="terms-hero">
          <div className="container">
            <span className="terms-hero-tag">Governança e Transparência</span>
            <h1 style={{ fontFamily: bricolage.style.fontFamily }}>Termos de Uso</h1>
            <p>
              Estes Termos de Uso regulam o acesso e a utilização da plataforma digital FINANHUB, operada por sua respectiva entidade administradora, constituindo um contrato vinculante entre a FINANHUB e qualquer pessoa física ou jurídica que acesse ou utilize seus serviços.
            </p>
            <div className="terms-last-update">Última atualização: Abril de 2026</div>
          </div>
        </section>

        {/* CONTENT */}
        <section className="terms-content">
          <div className="terms-content-inner">
            
            <div className="terms-section">
              <h2 style={{ fontFamily: bricolage.style.fontFamily }}>1. DEFINIÇÕES</h2>
              <p>Para os fins destes Termos, consideram-se:</p>
              <ul>
                <li><strong>Plataforma:</strong> ambiente digital disponibilizado pela FINANHUB para conexão entre usuários interessados em oportunidades de negócio</li>
                <li><strong>Usuário:</strong> qualquer pessoa que acesse ou utilize a Plataforma, mediante cadastro ou não</li>
                <li><strong>Anunciante:</strong> Usuário que publica oportunidades na Plataforma</li>
                <li><strong>Investidor:</strong> Usuário interessado em oportunidades publicadas</li>
                <li><strong>Lead:</strong> manifestação de interesse formal em determinada oportunidade</li>
                <li><strong>Conteúdo:</strong> toda e qualquer informação, dado, texto, imagem ou material inserido na Plataforma</li>
              </ul>
            </div>

            <div className="terms-section">
              <h2 style={{ fontFamily: bricolage.style.fontFamily }}>2. OBJETO</h2>
              <p>A Plataforma tem por objeto disponibilizar um ambiente digital destinado à:</p>
              <ul>
                <li>Publicação de oportunidades de negócios</li>
                <li>Conexão entre investidores e anunciantes</li>
                <li>Intermediação de contatos entre usuários</li>
                <li>Disponibilização de ferramentas de análise e negociação</li>
              </ul>
              <p>A FINANHUB atua como intermediadora tecnológica, não integrando, em regra, as relações contratuais estabelecidas entre os Usuários.</p>
            </div>

            <div className="terms-section">
              <h2 style={{ fontFamily: bricolage.style.fontFamily }}>3. ACEITAÇÃO E CAPACIDADE LEGAL</h2>
              <p>O uso da Plataforma está condicionado à aceitação integral destes Termos.</p>
              <p>O Usuário declara que:</p>
              <ul>
                <li>Possui plena capacidade civil para celebrar contratos</li>
                <li>Atua em nome próprio ou possui poderes para representar terceiros</li>
                <li>Fornecerá informações verídicas, completas e atualizadas</li>
              </ul>
              <p>A utilização da Plataforma por menores de idade somente será permitida mediante representação legal.</p>
            </div>

            <div className="terms-section">
              <h2 style={{ fontFamily: bricolage.style.fontFamily }}>4. CADASTRO E SEGURANÇA DA CONTA</h2>
              <p>Para acesso a determinadas funcionalidades, será exigido cadastro prévio.</p>
              <p>O Usuário obriga-se a:</p>
              <ul>
                <li>Fornecer dados corretos e atualizados</li>
                <li>Manter a confidencialidade de suas credenciais de acesso</li>
                <li>Comunicar imediatamente qualquer uso não autorizado</li>
              </ul>
              <p>A FINANHUB não se responsabiliza por acessos indevidos decorrentes de falha na guarda das credenciais pelo Usuário.</p>
            </div>

            <div className="privacy-section"> {/* Usando a mesma estrutura visual da outra página onde aplicável */}
              <div className="terms-section">
                <h2 style={{ fontFamily: bricolage.style.fontFamily }}>5. PUBLICAÇÃO DE CONTEÚDO E RESPONSABILIDADE</h2>
                <p>O Usuário que publicar conteúdo na Plataforma declara e garante que:</p>
                <ul>
                  <li>Detém todos os direitos necessários sobre o conteúdo publicado</li>
                  <li>As informações são verídicas, completas e não enganosas</li>
                  <li>A publicação não viola direitos de terceiros ou legislação vigente</li>
                </ul>
                <p>A FINANHUB não realiza auditoria prévia integral dos conteúdos, podendo, entretanto:</p>
                <ul>
                  <li>Revisar, editar ou remover conteúdos a qualquer tempo</li>
                  <li>Solicitar comprovação documental</li>
                  <li>Suspender conteúdos que violem estes Termos</li>
                </ul>
                <p>O Anunciante assume responsabilidade integral por eventuais danos decorrentes de informações prestadas.</p>
              </div>
            </div>

            <div className="terms-section">
              <h2 style={{ fontFamily: bricolage.style.fontFamily }}>6. INTERMEDIAÇÃO E LIMITAÇÃO DE ATUAÇÃO</h2>
              <p>A FINANHUB limita-se a disponibilizar infraestrutura tecnológica para conexão entre Usuários.</p>
              <p>Dessa forma:</p>
              <ul>
                <li>Não participa das negociações entre as partes</li>
                <li>Não garante a veracidade das informações prestadas por terceiros</li>
                <li>Não assegura a concretização de qualquer transação</li>
              </ul>
              <p>Qualquer relação contratual estabelecida entre Usuários é de sua exclusiva responsabilidade.</p>
            </div>

            <div className="terms-section">
              <h2 style={{ fontFamily: bricolage.style.fontFamily }}>7. PLANOS, SERVIÇOS E REMUNERAÇÃO</h2>
              <p>A Plataforma poderá disponibilizar planos e serviços pagos, incluindo, mas não se limitando a:</p>
              <ul>
                <li>Planos de publicação de anúncios</li>
                <li>Acesso a funcionalidades premium</li>
                <li>Serviços de destaque e visibilidade</li>
              </ul>
              <p>A contratação implica:</p>
              <ul>
                <li>Aceitação das condições comerciais vigentes</li>
                <li>Obrigação de pagamento conforme valores e prazos estabelecidos</li>
              </ul>
              <p>A inadimplência poderá resultar em suspensão de funcionalidades ou encerramento da conta.</p>
            </div>

            <div className="terms-section">
              <h2 style={{ fontFamily: bricolage.style.fontFamily }}>8. USO INDEVIDO E RESTRIÇÕES</h2>
              <p>É expressamente vedado ao Usuário:</p>
              <ul>
                <li>Utilizar a Plataforma para fins ilícitos ou fraudulentos</li>
                <li>Publicar conteúdo falso, enganoso ou ofensivo</li>
                <li>Tentar acessar sistemas ou dados sem autorização</li>
                <li>Burlar mecanismos de intermediação da Plataforma</li>
                <li>Utilizar automações não autorizadas</li>
              </ul>
              <p>A violação destas disposições poderá acarretar:</p>
              <ul>
                <li>Suspensão imediata da conta</li>
                <li>Exclusão definitiva</li>
                <li>Responsabilização civil e criminal</li>
              </ul>
            </div>

            <div className="terms-section">
              <h2 style={{ fontFamily: bricolage.style.fontFamily }}>9. PROPRIEDADE INTELECTUAL</h2>
              <p>Todos os direitos relativos à Plataforma, incluindo:</p>
              <ul>
                <li>Código-fonte</li>
                <li>Interface</li>
                <li>Layout</li>
                <li>Marca FINANHUB</li>
                <li>Conteúdos institucionais</li>
              </ul>
              <p>são de titularidade exclusiva da FINANHUB ou de seus licenciadores. É vedada a reprodução, modificação ou exploração sem autorização prévia e expressa.</p>
            </div>

            <div className="terms-section">
              <h2 style={{ fontFamily: bricolage.style.fontFamily }}>10. PROTEÇÃO DE DADOS</h2>
              <p>O tratamento de dados pessoais observará a legislação aplicável, especialmente a Lei nº 13.709/2018 (LGPD).</p>
              <p>A FINANHUB poderá:</p>
              <ul>
                <li>Coletar e armazenar dados necessários à operação da Plataforma</li>
                <li>Utilizar dados para aprimoramento de serviços</li>
                <li>Empregar sistemas automatizados para análise e qualificação de informações</li>
              </ul>
              <p>O Usuário declara estar ciente e concordar com tais práticas.</p>
            </div>

            <div className="terms-section">
              <h2 style={{ fontFamily: bricolage.style.fontFamily }}>11. LIMITAÇÃO DE RESPONSABILIDADE</h2>
              <p>Na máxima extensão permitida pela legislação aplicável, a FINANHUB não será responsável por:</p>
              <ul>
                <li>Decisões de investimento dos Usuários</li>
                <li>Danos decorrentes de negociações entre terceiros</li>
                <li>Perdas financeiras ou lucros cessantes</li>
                <li>Informações fornecidas por Usuários</li>
              </ul>
              <p>A responsabilidade da FINANHUB limita-se à disponibilização da Plataforma em condições adequadas de funcionamento.</p>
            </div>

            <div className="terms-section">
              <h2 style={{ fontFamily: bricolage.style.fontFamily }}>12. MODERAÇÃO E CONFORMIDADE</h2>
              <p>A FINANHUB poderá adotar medidas de controle, incluindo:</p>
              <ul>
                <li>Análise automatizada de conteúdo</li>
                <li>Processos de moderação manual</li>
                <li>Sistemas de prevenção a fraudes</li>
              </ul>
              <p>Tais medidas não garantem eliminação integral de riscos, sendo recomendada diligência própria pelos Usuários.</p>
            </div>

            <div className="terms-section">
              <h2 style={{ fontFamily: bricolage.style.fontFamily }}>13. SUSPENSÃO E ENCERRAMENTO</h2>
              <p>A FINANHUB poderá, a seu exclusivo critério:</p>
              <ul>
                <li>Suspender ou encerrar contas</li>
                <li>Remover conteúdos</li>
                <li>Restringir acessos</li>
              </ul>
              <p>em caso de descumprimento destes Termos ou suspeita de irregularidade.</p>
            </div>

            <div className="terms-section">
              <h2 style={{ fontFamily: bricolage.style.fontFamily }}>14. ALTERAÇÕES DOS TERMOS</h2>
              <p>Estes Termos poderão ser modificados a qualquer tempo.</p>
              <p>A versão atualizada será publicada na Plataforma, passando a produzir efeitos imediatos. A continuidade do uso implica concordância com as alterações.</p>
            </div>

            <div className="terms-section">
              <h2 style={{ fontFamily: bricolage.style.fontFamily }}>15. LEGISLAÇÃO APLICÁVEL E FORO</h2>
              <p>Estes Termos são regidos pelas leis da República Federativa do Brasil.</p>
              <p>Fica eleito o foro da Comarca de São Paulo/SP, com renúncia a qualquer outro, por mais privilegiado que seja.</p>
            </div>

            <div className="terms-section">
              <h2 style={{ fontFamily: bricolage.style.fontFamily }}>16. DISPOSIÇÕES GERAIS</h2>
              <ul>
                <li>A eventual tolerância quanto ao descumprimento de cláusulas não implicará novação</li>
                <li>Caso qualquer disposição seja considerada inválida, as demais permanecerão em vigor</li>
                <li>Estes Termos constituem o acordo integral entre as partes</li>
              </ul>
            </div>

            <div className="terms-section">
              <h2 style={{ fontFamily: bricolage.style.fontFamily }}>17. CONTATO</h2>
              <p>Para esclarecimentos:</p>
              <div className="contact-box">
                <p><strong>E-mail:</strong> contato@finanhub.com.br</p>
                <p><strong>Endereço:</strong> Rua Engenheiro Luiz Carlos Berrini, 105 – São Paulo/SP</p>
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
