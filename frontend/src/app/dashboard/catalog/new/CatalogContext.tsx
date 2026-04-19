'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CatalogService } from '@/services/CatalogService';

interface CatalogWizardState {
  currentStep: number;
  draftId: string | null;
  formData: any;
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt: Date | null;
}

interface CatalogContextType extends CatalogWizardState {
  setFormData: (data: any) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  saveDraft: () => Promise<void>;
  publish: () => Promise<void>;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CatalogWizardState>({
    currentStep: 1,
    draftId: null,
    formData: {
      type: 'PRODUCT',
      name: '',
      // ... initialization of fields
    },
    autoSaveStatus: 'idle',
    lastSavedAt: null,
  });

  const setFormData = useCallback((data: any) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...data }
    }));
  }, []);

  const nextStep = () => setState(prev => ({ ...prev, currentStep: Math.min(prev.currentStep + 1, 6) }));
  const prevStep = () => setState(prev => ({ ...prev, currentStep: Math.max(prev.currentStep - 1, 1) }));
  const goToStep = (step: number) => setState(prev => ({ ...prev, currentStep: step }));

  const saveDraft = async () => {
    setState(prev => ({ ...prev, autoSaveStatus: 'saving' }));
    try {
      if (state.draftId) {
        await CatalogService.update(state.draftId, state.formData);
      } else {
        const draft = await CatalogService.createDraft(state.formData);
        setState(prev => ({ ...prev, draftId: draft.id }));
      }
      setState(prev => ({ ...prev, autoSaveStatus: 'saved', lastSavedAt: new Date() }));
    } catch (error) {
      console.error('Save draft error:', error);
      setState(prev => ({ ...prev, autoSaveStatus: 'error' }));
    }
  };

  const publish = async () => {
    if (!state.draftId) return;
    await CatalogService.publish(state.draftId);
  };

  return (
    <CatalogContext.Provider value={{ 
      ...state, 
      setFormData, 
      nextStep, 
      prevStep, 
      goToStep, 
      saveDraft,
      publish 
    }}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) throw new Error('useCatalog must be used within a CatalogProvider');
  return context;
}
