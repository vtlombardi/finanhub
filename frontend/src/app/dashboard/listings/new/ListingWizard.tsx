'use client';

import React from 'react';
import styles from '@/styles/Dashboard.module.css';
import { useWizard } from './WizardContext';
import { WizardHeader } from './components/WizardHeader';
import { HayiaAdvisor } from './components/HayiaAdvisor';
import { StepOverview } from './steps/StepOverview';
import { StepFinancials } from './steps/StepFinancials';
import { StepStructure } from './steps/StepStructure';
import { StepMaterials } from './steps/StepMaterials';
import { StepReview } from './steps/StepReview';
import { WizardFooter } from './components/WizardFooter';

export function ListingWizard() {
  const { currentStep, nextStep, prevStep } = useWizard();

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <StepOverview />;
      case 2: return <StepFinancials />;
      case 3: return <StepStructure />;
      case 4: return <StepMaterials />;
      case 5: return <StepReview />;
      default: return <StepOverview />;
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
        <HayiaAdvisor />
      </aside>
    </div>
  );
}
