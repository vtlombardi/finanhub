'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import styles from '@/styles/Dashboard.module.css';
import { useCatalog } from '../CatalogContext';

export function WizardFooter() {
  const { currentStep, nextStep, prevStep, saveDraft, publish } = useCatalog();

  const isLastStep = currentStep === 6;

  return (
    <footer className={styles.wizardFooter}>
      <div className={styles.footerLeft}>
        {currentStep > 1 && (
          <button 
            type="button" 
            className={styles.btnSecondary} 
            onClick={prevStep}
          >
            <ChevronLeft size={18} />
            Voltar
          </button>
        )}
      </div>

      <div className={styles.footerRight}>
        <button 
          type="button" 
          className={styles.btnSecondary} 
          onClick={saveDraft}
        >
          <Save size={18} />
          Salvar Rascunho
        </button>

        {isLastStep ? (
          <button 
            type="button" 
            className={styles.btnPrimary} 
            onClick={publish}
          >
            Publicar Oferta
          </button>
        ) : (
          <button 
            type="button" 
            className={styles.btnPrimary} 
            onClick={nextStep}
          >
            Continuar
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </footer>
  );
}
