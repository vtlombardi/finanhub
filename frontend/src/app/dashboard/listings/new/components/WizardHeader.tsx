'use client';

import React from 'react';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import styles from '@/styles/Dashboard.module.css';
import { useWizard } from '../WizardContext';

export function WizardHeader() {
  const { currentStep, autoSaveStatus, lastSavedAt } = useWizard();

  const steps = [
    'Visão Geral',
    'Indicadores',
    'Estrutura',
    'Materiais',
    'Revisão'
  ];

  const progress = ((currentStep - 1) / 4) * 100;

  return (
    <header className={styles.wizardHeader}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
        <div>
          <h1>Novo Anúncio</h1>
          <p>Siga os passos abaixo para publicar sua oportunidade com padrão institucional.</p>
        </div>
        
        <div className={styles.saveStatus}>
          {autoSaveStatus === 'saving' && (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Salvando alterações...</span>
            </>
          )}
          {autoSaveStatus === 'saved' && (
            <>
              <Check size={14} />
              <span className={styles.savePulse} />
              <span>Salvo automaticamente {lastSavedAt ? `às ${lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}</span>
            </>
          )}
          {autoSaveStatus === 'error' && (
            <>
              <AlertCircle style={{ color: 'var(--red)' }} />
              <span style={{ color: 'var(--red)' }}>Erro ao salvar rascunho</span>
            </>
          )}
          {autoSaveStatus === 'idle' && lastSavedAt && (
            <span>Todas as alterações foram salvas</span>
          )}
        </div>
      </div>

      <div className={styles.stepIndicator}>
        {steps.map((step, idx) => (
          <span 
            key={idx} 
            className={(idx + 1) <= currentStep ? styles.stepActive : ''}
          >
            {idx + 1}. {step}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-4 mt-6">
        <span className="text-[10px] font-black text-var(--brand) uppercase tracking-widest whitespace-nowrap">
          Etapa {currentStep} de 5
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
