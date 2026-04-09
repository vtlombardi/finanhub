import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="footer" data-type="2" is-inverse="false">
      <div className="footer-content">
        <div className="container">
          <div className="wrapper">
            <div className="footer-wrapper">
              <div className="footer-logo">
                <a href="/" className="logo-link">
                  <img 
                    src="https://finanhub.com.br/media/cache/logo/custom/domain_1/content_files/img_logo.png?1770814367" 
                    alt="" 
                  />
                </a>
              </div>
              <div className="footer-social">
                <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="social-link">
                  <i className="fa fa-facebook"></i>
                </a>
                <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" className="social-link">
                  <i className="fa fa-linkedin"></i>
                </a>
                <a href="https://x.com/" target="_blank" rel="noopener noreferrer" className="social-link">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={{ width: '16px', fill: 'currentColor' }}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="social-link">
                  <i className="fa fa-instagram"></i>
                </a>
                <a href="https://www.pinterest.com/" target="_blank" rel="noopener noreferrer" className="social-link">
                  <i className="fa fa-pinterest"></i>
                </a>
                <a href="https://tiktok.com/" target="_blank" rel="noopener noreferrer" className="social-link">
                  <svg fill="currentColor" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" style={{ width: '16px' }}><path d="M412.19,118.66a109.27,109.27,0,0,1-9.45-5.5,132.87,132.87,0,0,1-24.27-20.62c-18.1-20.71-24.86-41.72-27.35-56.43h.1C349.14,23.9,350,16,350.13,16H267.69V334.78c0,4.28,0,8.51-.18,12.69,0,.52-.05,1-.08,1.56,0,.23,0,.47-.05.71,0,.06,0,.12,0,.18a70,70,0,0,1-35.22,55.56,68.8,68.8,0,0,1-34.11,9c-38.41,0-69.54-31.32-69.54-70s31.13-70,69.54-70a68.9,68.9,0,0,1,21.41,3.39l.1-83.94a153.14,153.14,0,0,0-118,34.52,161.79,161.79,0,0,0-35.3,43.53c-3.48,6-16.61,30.11-18.2,69.24-1,22.21,5.67,45.22,8.85,54.73v.2c2,5.6,9.75,24.71,22.38,40.82A167.53,167.53,0,0,0,115,470.66v-.2l.2.2C155.11,497.78,199.36,496,199.36,496c7.66-.31,33.32,0,62.46-13.81,32.32-15.31,50.72-38.12,50.72-38.12a158.46,158.46,0,0,0,27.64-45.93c7.46-19.61,9.95-43.13,9.95-52.53V176.49c1,.6,14.32,9.41,14.32,9.41s19.19,12.3,49.13,20.31c21.48,5.7,50.42,6.9,50.42,6.9V131.27C453.86,132.37,433.27,129.17,412.19,118.66Z"/></svg>
                </a>
              </div>
            </div>
            <div className="footer-actions">
              <div className="footer-item" data-content="site-content">
                <div className="heading footer-item-title">Conteúdo do Site</div>
                <div className="footer-item-content">
                  <Link href="/" className="link-footer">Página Inicial</Link>
                  <Link href="/oportunidades" className="link-footer">Empresas</Link>
                  <Link href="/artigo" className="link-footer">Artigos</Link>
                  <Link href="/blog" className="link-footer">Blog</Link>
                  <Link href="/anuncie" className="link-footer">Anunciar</Link>
                  <Link href="/contato" className="link-footer">Entre em contato</Link>
                  <Link href="/perguntas-frequentes" className="link-footer">FAQ</Link>
                  <Link href="/termos-de-uso" className="link-footer">Termos de Uso</Link>
                  <Link href="/politica-de-privacidade" className="link-footer">Política de Privacidade</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bar">
        <div className="container">
          <div className="wrapper">
            <div className="footer-copyright"></div>
          </div>
        </div>
      </div>
    </footer>
  );
};
