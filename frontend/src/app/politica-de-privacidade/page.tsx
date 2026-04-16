'use client';

import React, { useState } from 'react';
import { Metadata } from 'next';
import { Bricolage_Grotesque } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AuthModal } from '@/components/auth/AuthModal';
import './privacy.css';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
});

// Nota: Metadata em Next.js App Router (Client Components) deve ser exportada de um layout ou de um Server Component.
// Como este é um Client Component (por causa do AuthModal/Header), vou focar na estrutura.
// Se fosse um Server Component puro, exportaria o objeto metadata.

export default function PrivacyPolicyPage() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className={`privacy-container ${bricolage.className}`}>
      <Header onOpenAuth={() => setAuthOpen(true)} />

      <main>
        {/* HERO */}
        <section className="privacy-hero">
          <div className="container">
            <span className="privacy-hero-tag">Transparência e Segurança</span>
            <h1 style={{ fontFamily: bricolage.style.fontFamily }}>Política de Privacidade</h1>
            <p>Entenda como a FINANHUB coleta, utiliza, armazena e protege os dados pessoais tratados em sua plataforma.</p>
          </div>
        </section>

        {/* CONTENT */}
        <section className="privacy-content">
          <div className="privacy-content-inner">
            
            <div className="privacy-section">
              <h2 style={{ fontFamily: bricolage.style.fontFamily }}>1. INTRODUÇÃO</h2>
              <p>A FINANHUB valoriza a privacidade, a segurança e a transparência no tratamento de dados pessoais.</p>
              <p>Esta Política de Privacidade descreve como coletamos, utilizamos, armazenamos e protegemos as informações dos usuários que acessam e utilizam a plataforma.</p>
              <p>Ao utilizar a FINANHUB, o usuário concorda com os termos desta Política.</p>
            </div>

            <div className="privacy-section">
              <h2 style={{ fontFamily: bricolage.style.fontFamily }}>2. DEFINIÇÕES IMPORTANTES</h2>
              <p>Para os fins desta Política:</p>
              <ul>
                <li><strong>Plataforma:</strong> sistema digital da FINANHUB</li>
                <li><strong>Usuário:</strong> qualquer pessoa que acessa ou utiliza a plataforma</li>
                <li><strong>Dados pessoais:</strong> informações que identificam ou podem identificar uma pessoa natural</li>
                <li><strong>Tratamento de dados:</strong> qualquer operação realizada com dados pessoais</li>
                <li><strong>Controlador:</strong> FINANHUB, responsável pelas decisões sobre o tratamento de dados</li>
                <li><strong>Operador:</strong> terceiros que tratam dados em nome da FINANHUB</li>
              </ul>
            </div>

            <div className="privacy-section">
              <h2 style={{ fontFamily: bricolage.style.fontFamily }}>3. DADOS COLETADOS</h2>
              
              <div className="privacy-subsection">
                <h3>3.1 Dados fornecidos pelo usuário</h3>
                <ul>
                  <li>Nome completo</li>
                  <li>E-mail</li>
                  <li>Telefone</li>
                  <li>Empresa</li>
                  <li>Cargo ou função</li>
                  <li>Informações empresariais, comerciais ou profissionais inseridas na plataforma</li>
                  <li>Dados inseridos em anúncios, oportunidades, propostas, leads ou interações internas</li>
                  <li>Mensagens trocadas dentro da plataforma, quando aplicável</li>
                </ul>
              </div>

              <div className="privacy-subsection">
                <h3>3.2 Dados coletados automaticamente</h3>
                <ul>
                  <li>Endereço IP</li>
                  <li>Dados aproximados de localização</li>
                  <li>Tipo de navegador e dispositivo</li>
                  <li>Sistema operacional</li>
                  <li>Páginas acessadas</li>
                  <li>Tempo de navegação</li>
                  <li>Identificadores digitais</li>
                  <li>Cookies e tecnologias semelhantes</li>
                </ul>
              </div>

              <div className="privacy-subsection">
                <h3>3.3 Dados sensíveis</h3>
                <p>A FINANHUB não solicita dados pessoais sensíveis, salvo quando estritamente necessário para fins legais, regulatórios, de validação ou compliance, sempre observando a legislação aplicável.</p>
              </div>
            </div>

            <div className="privacy-section">
              <h2 style={{ fontFamily: bricolage.style.fontFamily }}>4. FINALIDADES DO TRATAMENTO DOS DADOS</h2>
              <p>Os dados pessoais poderão ser utilizados para:</p>
              <ul>
                <li>criar e gerenciar contas</li>
                <li>permitir acesso à plataforma e às funcionalidades contratadas</li>
                <li>publicar, exibir e organizar anúncios e oportunidades</li>
                <li>intermediar conexões entre usuários, investidores, empresas e parceiros</li>
                <li>qualificar leads e oportunidades</li>
                <li>processar comunicações internas e notificações</li>
                <li>prestar suporte</li>
                <li>melhorar a experiência do usuário</li>
                <li>personalizar conteúdos e funcionalidades</li>
                <li>prevenir fraudes, abusos e acessos indevidos</li>
                <li>cumprir obrigações legais, regulatórias e contratuais</li>
                <li>proteger direitos da FINANHUB e de terceiros</li>
              </ul>
            </div>

            <div className="privacy-section">
              <h2 style={{ fontFamily: bricolage.style.fontFamily }}>5. BASE LEGAL PARA O TRATAMENTO</h2>
              <p>A FINANHUB poderá tratar dados pessoais com fundamento nas bases legais previstas na legislação aplicável, incluindo:</p>
              <ul>
                <li>consentimento do titular</li>
                <li>execução de contrato ou de procedimentos preliminares relacionados a contrato</li>
                <li>cumprimento de obrigação legal ou regulatória</li>
                <li>exercício regular de direitos</li>
                <li>legítimo interesse, quando aplicável</li>
                <li>proteção do crédito, quando cabível</li>
              </ul>
            </div>

            <div className="privacy-section">
              <h2 style={{ fontFamily: bricolage.style.fontFamily }}>6. COMPARTILHAMENTO DE DADOS</h2>
              <p>Os dados poderão ser compartilhados, quando necessário, com:</p>
              <ul>
                <li>prestadores de serviços tecnológicos</li>
                <li>parceiros operacionais</li>
                <li>ferramentas de hospedagem, infraestrutura, segurança, analytics e suporte</li>
                <li>meios de pagamento, se aplicável</li>
                <li>autoridades públicas, judiciais ou regulatórias, quando exigido por lei</li>
                <li>outros usuários da plataforma, exclusivamente dentro da lógica operacional da FINANHUB e respeitado o nível de confidencialidade aplicável</li>
              </ul>
              <p>A FINANHUB não comercializa dados pessoais de usuários.</p>
            </div>

            <div className="privacy-section">
              <h2 style={{ fontFamily: bricolage.style.fontFamily }}>7. CONFIDENCIALIDADE E INTERMEDIAÇÃO</h2>
              <p>A FINANHUB pode atuar como ambiente de intermediação entre partes interessadas em oportunidades, negócios, investimentos e conexões profissionais.</p>
              <p>Dependendo da natureza da operação, determinadas informações podem ser exibidas de forma parcial, controlada ou confidencial.</p>
              <p>A plataforma adota mecanismos para preservar, sempre que aplicável, o nível adequado de sigilo, segurança e controle de acesso às informações.</p>
            </div>

            <div className="privacy-section">
              <h2 style={{ fontFamily: bricolage.style.fontFamily }}>8. ARMAZENAMENTO E SEGURANÇA</h2>
              <p>A FINANHUB adota medidas técnicas e administrativas razoáveis para proteger os dados pessoais contra acessos não autorizados, destruição, perda, alteração, comunicação ou qualquer forma de tratamento inadequado ou ilícito.</p>
              <p>Essas medidas podem incluir:</p>
              <ul>
                <li>controle de acesso</li>
                <li>autenticação</li>
                <li>criptografia ou mecanismos equivalentes</li>
                <li>monitoramento de ambiente</li>
                <li>proteção de infraestrutura</li>
                <li>políticas internas de segurança</li>
              </ul>
              <p>Embora sejam adotadas boas práticas de segurança, nenhum sistema é totalmente imune a falhas ou incidentes.</p>
            </div>

            <div className="privacy-section">
              <h2 style={{ fontFamily: bricolage.style.fontFamily }}>9. RETENÇÃO DOS DADOS</h2>
              <p>Os dados pessoais serão armazenados pelo tempo necessário para cumprir as finalidades para as quais foram coletados, inclusive para:</p>
              <ul>
                <li>execução contratual</li>
                <li>cumprimento de obrigações legais e regulatórias</li>
                <li>exercício regular de direitos</li>
                <li>prevenção à fraude</li>
                <li>auditoria</li>
                <li>preservação de histórico operacional e transacional da plataforma</li>
              </ul>
              <p>Encerrado o período necessário, os dados poderão ser excluídos, anonimizados ou mantidos de forma legalmente permitida.</p>
            </div>

            <div className="privacy-section">
              <h2 style={{ fontFamily: bricolage.style.fontFamily }}>10. DIREITOS DO TITULAR</h2>
              <p>Nos termos da legislação aplicável, o titular dos dados poderá solicitar:</p>
              <ul>
                <li>confirmação da existência de tratamento</li>
                <li>acesso aos dados</li>
                <li>correcção de dados incompletos, inexatos ou desatualizados</li>
                <li>anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade</li>
                <li>portabilidade, quando aplicável</li>
                <li>informações sobre compartilhamento</li>
                <li>revogação do consentimento, quando esta for a base legal</li>
                <li>eliminação dos dados tratados com consentimento, ressalvadas as hipóteses legais de retenção</li>
              </ul>
            </div>

            <div className="privacy-section">
              <h2 style={{ fontFamily: bricolage.style.fontFamily }}>11. COOKIES E TECNOLOGIAS SEMELHANTES</h2>
              <p>A FINANHUB poderá utilizar cookies e tecnologias semelhantes para:</p>
              <ul>
                <li>funcionamento da plataforma</li>
                <li>autenticação e segurança</li>
                <li>análise de desempenho</li>
                <li>melhoria da navegação</li>
                <li>personalização de experiência</li>
              </ul>
              <p>O usuário poderá, dentro das limitações do navegador e do dispositivo utilizado, gerenciar preferências relacionadas a cookies.</p>
            </div>

            <div className="privacy-section">
              <h2 style={{ fontFamily: bricolage.style.fontFamily }}>12. TRANSFERÊNCIA INTERNACIONAL DE DADOS</h2>
              <p>Dependendo da infraestrutura tecnológica utilizada, alguns dados poderão ser processados ou armazenados em servidores localizados fora do Brasil.</p>
              <p>Nesses casos, a FINANHUB buscará adotar medidas apropriadas para assegurar nível adequado de proteção e conformidade com a legislação aplicável.</p>
            </div>

            <div className="privacy-section">
              <h2 style={{ fontFamily: bricolage.style.fontFamily }}>13. RESPONSABILIDADES DO USUÁRIO</h2>
              <p>O usuário se compromete a:</p>
              <ul>
                <li>fornecer informações verdadeiras, corretas e atualizadas</li>
                <li>utilizar a plataforma de forma lícita e ética</li>
                <li>preservar a confidencialidade de suas credenciais de acesso</li>
                <li>não violar direitos de terceiros</li>
                <li>respeitar as regras de uso da plataforma e a legislação vigente</li>
              </ul>
            </div>

            <div className="privacy-section">
              <h2 style={{ fontFamily: bricolage.style.fontFamily }}>14. ALTERAÇÕES DESTA POLÍTICA</h2>
              <p>A FINANHUB poderá atualizar esta Política de Privacidade a qualquer tempo, para refletir mudanças legais, regulatórias, operacionais ou tecnológicas.</p>
              <p>A versão atualizada passará a valer a partir de sua publicação na plataforma.</p>
            </div>

            <div className="privacy-section">
              <h2 style={{ fontFamily: bricolage.style.fontFamily }}>15. CONTATO</h2>
              <p>Para dúvidas, solicitações ou assuntos relacionados a esta Política de Privacidade, utilizar os canais institucionais da FINANHUB.</p>
              
              <div className="contact-box">
                <p><strong>E-mail:</strong> contato@finanhub.com.br</p>
                <p><strong>Endereço:</strong> Rua Engenheiro Luiz Carlos Berrini, 105 - Brooklin - São Paulo/SP - CEP 04570-010</p>
              </div>
            </div>

            <div className="privacy-section">
              <h2 style={{ fontFamily: bricolage.style.fontFamily }}>16. DISPOSIÇÕES FINAIS</h2>
              <p>Ao acessar e utilizar a plataforma, o usuário declara estar ciente desta Política de Privacidade.</p>
            </div>

          </div>
        </section>
      </main>

      <Footer />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
