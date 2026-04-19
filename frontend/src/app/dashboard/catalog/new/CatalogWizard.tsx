'use client';

import React from 'react';
import styles from '@/styles/Dashboard.module.css';
import { useCatalog } from './CatalogContext';
import { WizardHeader } from './components/WizardHeader';
import { WizardFooter } from './components/WizardFooter';
import { HayiaCatalogAdvisor } from './components/HayiaCatalogAdvisor';

// Placeholder steps
import { Step1Type } from './steps/Step1Type';
import { Step2BasicInfo } from './steps/Step2BasicInfo';
import { Step3Commercial } from './steps/Step3Commercial';
import { Step4Operational } from './steps/Step4Operational';
import { Step5Media } from './steps/Step5Media';
import { Step6Review } from './steps/Step6Review';

export function CatalogWizard() {
  const { currentStep } = useCatalog();

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1Type />;
      case 2: return <Step2BasicInfo />;
      case 3: return <Step3Commercial />;
      case 4: return <Step4Operational />;
      case 5: return <Step5Media />;
      case 6: return <Step6Review />;
      default: return <Step1Type />;
    }
  };

  return (
    <div className={styles.wizardWrapper}>
      <div className={styles.wizardMain}>
        <WizardHeader />
        
        <div className={styles.stepContent}>
          {renderStep()}
        </div>

        <WizardFooter />
      </div>

      <aside className={styles.wizardSide}>
        <HayiaCatalogAdvisor />
      </aside>
    </div>
  );
}
