'use client';

import React from 'react';
import styles from '@/styles/Dashboard.module.css';
import { useWizard } from '../WizardContext';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';

export function WizardFooter() {
  const { currentStep, nextStep, prevStep, qualityScore } = useWizard();

  return (
    <footer className={styles.wizardFooter}>
      <div className={styles.wizardFooterInner}>
        <div className={styles.footerProgress}>
          <div className={styles.footerStepInfo}>
            <span className={styles.footerStepLabel}>Progresso</span>
            <span className={styles.footerStepValue}>Etapa {currentStep} de 5</span>
          </div>
          
          <div className={styles.footerScore}>
            <span className={styles.footerScoreLabel}>Score de Qualidade</span>
            <span className={styles.footerScoreValue}>{qualityScore}%</span>
          </div>
        </div>

        <div className={styles.footerActions}>
          <button 
            type="button" 
            className={`${styles.btn} ${styles.btnGhost}`}
            onClick={prevStep}
            disabled={currentStep === 1}
            style={{ 
              opacity: currentStep === 1 ? 0 : 1, 
              pointerEvents: currentStep === 1 ? 'none' : 'all',
              padding: '0 24px',
              height: '52px'
            }}
          >
            <ArrowLeft className="mr-2" /> Voltar
          </button>

          <button 
            type="button" 
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={() => nextStep()}
            style={{ 
              padding: '0 32px',
              height: '52px'
            }}
          >
            {currentStep === 5 ? (
              <>Publicar Anúncio <Check className="ml-2" /></>
            ) : (
              <>Próxima Etapa <ArrowRight className="ml-2" /></>
            )}
          </button>
        </div>
      </div>
    </footer>
  );
}
