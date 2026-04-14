'use client';

import React, { useEffect, useRef } from 'react';
import Script from 'next/script';

/**
 * OpportunitySidebar (Bridge)
 * Este componente atua como ponte entre o ecossistema React/Next.js e o Web Component 
 * isolado <finanhub-filter> via Shadow DOM.
 */

interface OpportunitySidebarProps {
  onFilterChange: (filters: any) => void;
  initialSearch?: string;
}

// Declarando o elemento customizado para o TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'finanhub-filter': any;
    }
  }
}

export const OpportunitySidebar: React.FC<OpportunitySidebarProps> = ({ onFilterChange, initialSearch = '' }) => {
  const filterRef = useRef<any>(null);

  useEffect(() => {
    const handleFilterChange = (event: any) => {
      const detail = event.detail;
      console.log('Filtros recebidos do Web Component:', detail);
      
      // Mapeamento para o formato esperado pelo onFilterChange original
      onFilterChange({
        search: detail.busca,
        category: detail.categoria,
        subcategory: detail.subcategoria,
        minPrice: detail.precoMin,
        maxPrice: detail.precoMax,
        rangePrice: detail.rangeValue,
        state: detail.estado,
        city: detail.cidade,
        businessModel: detail.modeloNegocio,
        opportunityType: detail.tipoOportunidade,
        isVerified: detail.verificado,
        dueDiligence: detail.dueDiligence,
        iaScore: detail.iaScore,
        sort: detail.ordenarPor
      });
    };

    const currentFilter = filterRef.current;
    if (currentFilter) {
      currentFilter.addEventListener('filter-change', handleFilterChange);
    }

    return () => {
      if (currentFilter) {
        currentFilter.removeEventListener('filter-change', handleFilterChange);
      }
    };
  }, [onFilterChange]);

  return (
    <>
      <Script 
        src="/components/finanhub-filter.js" 
        strategy="afterInteractive"
      />
      
      <div className="sidebar-wrapper" style={{ minWidth: '320px' }}>
        {/* Usando o Custom Element isolado */}
        <finanhub-filter 
          ref={filterRef}
          data-initial-search={initialSearch}
        />
      </div>

      <style jsx>{`
        .sidebar-wrapper {
          position: sticky;
          top: 100px;
          height: fit-content;
        }
      `}</style>
    </>
  );
};
