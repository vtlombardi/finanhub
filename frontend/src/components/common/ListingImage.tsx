'use client';

import React, { useState, useEffect } from 'react';

interface ListingImageProps {
  src?: string | null;
  alt?: string;
  category?: string;
  className?: string;
  isCover?: boolean;
}

const CATEGORY_FALLBACKS: Record<string, string> = {
  'venda-empresas': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
  'startups': 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=800',
  'imoveis-comerciais': 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
  'maquinarios': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
  'franquias-e-licenciamento': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800',
  'agronegocio': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
  'servicos-e-consultoria': 'https://images.unsplash.com/photo-1454165833767-02a6e055ed16?auto=format&fit=crop&q=80&w=800',
  'ativos-e-estruturas': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
  'divulgacao-parcerias': 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800'
};

const INSTITUTIONAL_FALLBACK = '/logo-finanhub-white.png';

export const ListingImage: React.FC<ListingImageProps> = ({ 
  src, 
  alt = '', 
  category, 
  className = '',
  isCover = false
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(src || INSTITUTIONAL_FALLBACK);
  const [errorCount, setErrorCount] = useState(0);

  // Sincronizar se o src mudar externamente
  useEffect(() => {
    if (src) {
      setCurrentSrc(src);
      setErrorCount(0);
    }
  }, [src]);

  const handleError = () => {
    if (errorCount === 0) {
      // 1º Fallback: Imagem da Categoria
      const fallback = category ? CATEGORY_FALLBACKS[category] : null;
      if (fallback && fallback !== currentSrc) {
        setCurrentSrc(fallback);
        setErrorCount(1);
      } else {
        // Pula para o próximo se não houver fallback de categoria
        setCurrentSrc(INSTITUTIONAL_FALLBACK);
        setErrorCount(2);
      }
    } else if (errorCount === 1) {
      // 2º Fallback: Imagem Institucional
      setCurrentSrc(INSTITUTIONAL_FALLBACK);
      setErrorCount(2);
    }
    // Se falhar o institucional, não fazemos nada (evita loop infinito)
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={`${className} transition-opacity duration-300 ${errorCount >= 2 ? 'opacity-50 grayscale' : 'opacity-100'}`}
      onError={handleError}
      loading="lazy"
    />
  );
};
