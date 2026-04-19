'use client';

import React from 'react';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import styles from '@/styles/Dashboard.module.css';
import { useCatalog } from '../CatalogContext';

export function WizardHeader() {
  const { currentStep, autoSaveStatus, lastSavedAt } = useCatalog();

  const steps = [
    'Tipo',
    'Básico',
    'Comercial',
    'Operação',
    'Mídia',
    'Revisão'
  ];

  const progress = ((currentStep - 1) / 5) * 100;

  return (
    <header className={styles.wizardHeader}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
        <div>
          <h1>Produtos e Serviços</h1>
          <p>Estruture sua oferta com padrão premium para as oportunidades FINANHUB.</p>
        </div>
        
        <div className={styles.saveStatus}>
          {autoSaveStatus === 'saving' && (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Salvando...</span>
            </>
          )}
          {autoSaveStatus === 'saved' && (
            <>
              <Check size={14} />
              <span>Salvo {lastSavedAt ? lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
            </>
          )}
          {autoSaveStatus === 'error' && (
            <>
              <AlertCircle size={14} style={{ color: 'var(--red)' }} />
              <span style={{ color: 'var(--red)' }}>Erro ao salvar</span>
            </>
          )}
        </div>
      </div>

      <div className={styles.stepIndicator}>
        {steps.map((step, idx) => (
          <span 
            key={idx} 
            className={(idx + 1) <= currentStep ? styles.stepActive : ''}
            style={{ opacity: (idx + 1) === currentStep ? 1 : 0.6 }}
          >
            {idx + 1}. {step}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-4 mt-6">
        <span className="text-[10px] font-black text-[#00b8b2] uppercase tracking-widest whitespace-nowrap">
          Etapa {currentStep} de 6
        </span>
        <div className={styles.progressTrack}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>
    </header>
  );
}
