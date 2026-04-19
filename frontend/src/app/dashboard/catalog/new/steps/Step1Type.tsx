'use client';

import React from 'react';
import { Box, Wrench, Layers } from 'lucide-react';
import styles from '@/styles/Dashboard.module.css';
import { useCatalog } from '../CatalogContext';

export function Step1Type() {
  const { formData, setFormData, nextStep } = useCatalog();

  const options = [
    {
      id: 'PRODUCT',
      title: 'Produto',
      description: 'Ofertas baseadas em ativos físicos, mercadorias ou softwares empacotados.',
      icon: <Box size={32} />
    },
    {
      id: 'SERVICE',
      title: 'Serviço',
      description: 'Ofertas baseadas em prestação de serviços, consultoria ou expertise técnica.',
      icon: <Wrench size={32} />
    },
    {
      id: 'BOTH',
      title: 'Produto + Serviço',
      description: 'Soluções híbridas que combinam fornecimento de itens e execução de serviços.',
      icon: <Layers size={32} />
    }
  ];

  const handleSelect = (id: string) => {
    setFormData({ type: id });
    // Opcionalmente podemos avançar direto se o usuário estiver criando novo
    // nextStep(); 
  };

  return (
    <div className={styles.wizardStep}>
      <div className={styles.stepHeader}>
        <h2>Tipo de Oferta</h2>
        <p>Selecione a categoria que melhor define o que você deseja cadastrar.</p>
      </div>

      <div className={styles.gridOptions}>
        {options.map((opt) => (
          <div 
            key={opt.id}
            className={`${styles.optionCard} ${formData.type === opt.id ? styles.optionSelected : ''}`}
            onClick={() => handleSelect(opt.id)}
          >
            <div className={styles.optionIcon}>{opt.icon}</div>
            <h3>{opt.title}</h3>
            <p>{opt.description}</p>
            <div className={styles.selectionCheck} />
          </div>
        ))}
      </div>
    </div>
  );
}
