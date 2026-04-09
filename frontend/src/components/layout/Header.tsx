'use client';
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface HeaderProps {
  onOpenAuth?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuth }) => {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const toggleMobileNav = () => setMobileNavOpen(!mobileNavOpen);

  return (
    <header className="header" data-type="2" is-sticky="false" is-inverse="false" has-opacity="true">
      <div className="header-content">
        <div className="container">
          <div className="wrapper">
            <div className="content-left">
              <a href="/" target="_parent" title="" className="header-logo larger-h">
                <img 
                   src="https://finanhub.com.br/media/cache/logo/custom/domain_1/content_files/img_logo.png?1770814367" 
                   alt="FINANHUB" 
                />
              </a>
              <nav className="header-navbar">
                <Link href="/" className={`navbar-link ${pathname === '/' ? 'is-active' : ''}`}>Página Inicial</Link>
                <Link href="/nossa-empresa" className={`navbar-link ${pathname === '/nossa-empresa' ? 'is-active' : ''}`}>Nossa Empresa</Link>
                <Link href="/oportunidades" className={`navbar-link ${pathname === '/oportunidades' ? 'is-active' : ''}`}>Oportunidades</Link>
                <Link href="/deal" className={`navbar-link ${pathname === '/deal' ? 'is-active' : ''}`}>Deal </Link>
                <Link href="/anuncie" className={`navbar-link ${pathname === '/anuncie' ? 'is-active' : ''}`}>Planos</Link>
                <Link href="/contato" className={`navbar-link ${pathname === '/contato' ? 'is-active' : ''}`}>Contato</Link>
              </nav>
              <div className="content-mobile">
                <button className="toggler-button search-toggler"><i className="fa fa-search"></i></button>
                <button className="toggler-button navbar-toggler" onClick={toggleMobileNav}><i className="fa fa-bars"></i></button>
              </div>
            </div>
            <div className="content-right">
              <Link href="/anuncie" className="button button-bg is-inverse">Anuncie aqui</Link>
              <a href="javascript:void(0);" onClick={(e) => { e.preventDefault(); onOpenAuth?.(); }} className="button button-bg is-primary">Entrar</a>
            </div>
          </div>
        </div>
      </div>
      <div className={`navbar-mobile ${mobileNavOpen ? 'open' : ''}`} id="mobileNav">
        <div className="navbar-links">
          <a href="javascript:void(0);" onClick={(e) => { e.preventDefault(); onOpenAuth?.(); }} className="bar-link">Entrar</a>
        </div>
        <nav className="navbar-links">
          <Link href="/" className={`navbar-link ${pathname === '/' ? 'is-active' : ''}`}>Página Inicial</Link>
          <Link href="/nossa-empresa" className={`navbar-link ${pathname === '/nossa-empresa' ? 'is-active' : ''}`}>Nossa Empresa</Link>
          <Link href="/oportunidades" className={`navbar-link ${pathname === '/oportunidades' ? 'is-active' : ''}`}>Oportunidades</Link>
          <Link href="/deal" className={`navbar-link ${pathname === '/deal' ? 'is-active' : ''}`}>Deal</Link>
          <Link href="/anuncie" className={`navbar-link ${pathname === '/anuncie' ? 'is-active' : ''}`}>Planos</Link>
          <Link href="/contato" className={`navbar-link ${pathname === '/contato' ? 'is-active' : ''}`}>Contato</Link>
        </nav>
        <div className="navbar-links">
          <Link href="/anuncie" className="navbar-link">Anuncie aqui</Link>
        </div>
      </div>
    </header>
  );
};
