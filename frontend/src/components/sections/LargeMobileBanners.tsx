'use client';
import React, { useEffect, useState } from 'react';
import { fetchActiveAds, Ad } from '@/services/ads.service';

const FallbackBanners: React.FC = () => (
  <>
    <a href="/anuncie" style={{ display: 'block', cursor: 'pointer' }}>
      <svg width="100%" viewBox="0 0 320 100" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '9px', display: 'block' }}>
        <defs>
          <linearGradient id="lb1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#000000' }}/>
            <stop offset="100%" style={{ stopColor: '#0d2d2c' }}/>
          </linearGradient>
        </defs>
        <rect width="320" height="100" fill="url(#lb1)" rx="9"/>
        <circle cx="270" cy="50" r="65" fill="#12b3af" fillOpacity="0.08"/>
        <circle cx="270" cy="50" r="38" fill="#12b3af" fillOpacity="0.10"/>
        <rect x="0" y="0" width="4" height="100" fill="#12b3af" rx="2"/>
        <text x="22" y="32" fontFamily="Poppins,sans-serif" fontSize="9" fontWeight="700" fill="#12b3af" letterSpacing="2">INVESTIDORES</text>
        <text x="22" y="54" fontFamily="Poppins,sans-serif" fontSize="16" fontWeight="800" fill="#ffffff">Encontre seu</text>
        <text x="22" y="72" fontFamily="Poppins,sans-serif" fontSize="16" fontWeight="800" fill="#12b3af">próximo deal</text>
        <text x="22" y="92" fontFamily="Poppins,sans-serif" fontSize="10" fill="rgba(255,255,255,0.45)">Anuncie aqui →</text>
        <rect x="252" y="62" width="8" height="20" fill="#12b3af" fillOpacity="0.7" rx="1"/>
        <rect x="264" y="50" width="8" height="32" fill="#12b3af" fillOpacity="0.85" rx="1"/>
        <rect x="276" y="42" width="8" height="40" fill="#12b3af" rx="1"/>
        <rect x="288" y="55" width="8" height="27" fill="#12b3af" fillOpacity="0.6" rx="1"/>
      </svg>
    </a>

    <a href="/anuncie" style={{ display: 'block', cursor: 'pointer' }}>
      <svg width="100%" viewBox="0 0 320 100" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '9px', display: 'block' }}>
        <defs>
          <linearGradient id="lb2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#0a1a1a' }}/>
            <stop offset="100%" style={{ stopColor: '#000000' }}/>
          </linearGradient>
        </defs>
        <rect width="320" height="100" fill="url(#lb2)" rx="9"/>
        <circle cx="50" cy="50" r="65" fill="#12b3af" fillOpacity="0.07"/>
        <circle cx="50" cy="50" r="35" fill="#12b3af" fillOpacity="0.09"/>
        <rect x="316" y="0" width="4" height="100" fill="#12b3af" rx="2"/>
        <text x="22" y="32" fontFamily="Poppins,sans-serif" fontSize="9" fontWeight="700" fill="#12b3af" letterSpacing="2">EMPREENDEDORES</text>
        <text x="22" y="54" fontFamily="Poppins,sans-serif" fontSize="16" fontWeight="800" fill="#ffffff">Exponha sua</text>
        <text x="22" y="72" fontFamily="Poppins,sans-serif" fontSize="16" fontWeight="800" fill="#12b3af">oportunidade</text>
        <text x="22" y="92" fontFamily="Poppins,sans-serif" fontSize="10" fill="rgba(255,255,255,0.45)">Cadastre-se grátis →</text>
        <text x="262" y="65" fontFamily="sans-serif" fontSize="36" fill="#12b3af" fillOpacity="0.7">🚀</text>
      </svg>
    </a>

    <a href="/anuncie" style={{ display: 'block', cursor: 'pointer' }}>
      <svg width="100%" viewBox="0 0 320 100" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '9px', display: 'block' }}>
        <defs>
          <linearGradient id="lb3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#091a1a' }}/>
            <stop offset="100%" style={{ stopColor: '#000000' }}/>
          </linearGradient>
        </defs>
        <rect width="320" height="100" fill="url(#lb3)" rx="9"/>
        <g stroke="#12b3af" strokeOpacity="0.07" strokeWidth="1">
          <line x1="0" y1="25" x2="320" y2="25"/><line x1="0" y1="50" x2="320" y2="50"/>
          <line x1="0" y1="75" x2="320" y2="75"/><line x1="80" y1="0" x2="80" y2="100"/>
          <line x1="160" y1="0" x2="160" y2="100"/><line x1="240" y1="0" x2="240" y2="100"/>
        </g>
        <rect x="0" y="0" width="4" height="100" fill="#12b3af" rx="2"/>
        <text x="22" y="30" fontFamily="Poppins,sans-serif" fontSize="9" fontWeight="700" fill="#12b3af" letterSpacing="2">PLANOS A PARTIR DE</text>
        <text x="22" y="58" fontFamily="Poppins,sans-serif" fontSize="28" fontWeight="800" fill="#ffffff">R$ 0</text>
        <text x="22" y="76" fontFamily="Poppins,sans-serif" fontSize="12" fontWeight="300" fill="rgba(255,255,255,0.55)">Comece grátis. Cresça com a FINANHUB.</text>
        <rect x="22" y="82" width="120" height="14" fill="#12b3af" rx="7"/>
        <text x="82" y="93" fontFamily="Poppins,sans-serif" fontSize="9" fontWeight="700" fill="#ffffff" textAnchor="middle">Ver planos →</text>
      </svg>
    </a>
  </>
);

export const LargeMobileBanners: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    fetchActiveAds('MOBILE_BANNER')
      .then(setAds)
      .catch(() => setAds([]));
  }, []);

  return (
    <div className="banner" data-type="large-mobile" {...{ 'is-wide': 'false' } as any} data-bg="brand" data-count="3" has-gap="">
      <div className="container">
        {ads.length === 0 ? (
          <FallbackBanners />
        ) : (
          ads.map((ad) => (
            <a key={ad.id} href={ad.linkUrl} style={{ display: 'block', cursor: 'pointer' }} target="_blank" rel="noopener noreferrer">
              {ad.imageUrl ? (
                <img src={ad.imageUrl} alt={ad.title} style={{ width: '100%', borderRadius: '9px', display: 'block' }} />
              ) : (
                <svg width="100%" viewBox="0 0 320 100" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '9px', display: 'block' }}>
                  <rect width="320" height="100" fill="#0d2d2c" rx="9"/>
                  <rect x="0" y="0" width="4" height="100" fill="#12b3af" rx="2"/>
                  <text x="22" y="54" fontFamily="Poppins,sans-serif" fontSize="16" fontWeight="800" fill="#ffffff">{ad.title}</text>
                  <text x="22" y="72" fontFamily="Poppins,sans-serif" fontSize="10" fill="rgba(255,255,255,0.45)">Saiba mais →</text>
                </svg>
              )}
            </a>
          ))
        )}
      </div>
    </div>
  );
};
