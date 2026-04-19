'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, UseFormReturn } from 'react-hook-form';
import { Listing, ListingAttributeValue } from '@/../../shared/contracts/listings';
import { listingsService } from '@/services/listings.service';
import { useNotificationStore } from '@/store/useNotificationStore';
import { WizardStep, AutoSaveStatus } from './types';

interface WizardContextType {
  currentStep: WizardStep;
  setStep: (step: WizardStep) => void;
  form: UseFormReturn<any>;
  listingId: string | null;
  autoSaveStatus: AutoSaveStatus;
  lastSavedAt: Date | null;
  qualityScore: number;
  isFirstSave: boolean;
  saveProgress: () => Promise<void>;
  nextStep: () => Promise<boolean>;
  prevStep: () => void;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export function WizardProvider({ children, initialListingId }: { children: React.ReactNode, initialListingId?: string }) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [listingId, setListingId] = useState<string | null>(initialListingId || null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [qualityScore, setQualityScore] = useState(0);
  const [isFirstSave, setIsFirstSave] = useState(!initialListingId);
  const router = useRouter();
  const { show } = useNotificationStore();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const form = useForm({
    mode: 'onChange'
  });

  const calculateScore = (values: any) => {
    let score = 20; // Base
    if (values.title) score += 15;
    if (values.categoryId) score += 5;
    if (values.description?.length > 100) score += 15;
    if (values.price > 0) score += 15;
    if (values.annualRevenue > 0) score += 10;
    if (values.ebitda > 0) score += 10;
    if (values.employeesCount > 0) score += 5;
    if (values.marketTime > 0) score += 5;
    return Math.min(score, 100);
  };

  const saveProgress = useCallback(async () => {
    const rawData = form.getValues();
    
    // Step 1 check before creating draft
    if (isFirstSave) {
      if (!rawData.title || !rawData.categoryId) {
        setAutoSaveStatus('idle');
        return; 
      }
    }

    // Transform attributes object back to attrValues array for the backend
    const data: any = { ...rawData };
    if (rawData.attributes) {
      data.attrValues = Object.entries(rawData.attributes).map(([attributeId, value]) => ({
        attributeId,
        ...(typeof value === 'number' ? { valueNum: value } : 
           typeof value === 'boolean' || value === 'true' || value === 'false' ? { valueBool: String(value) === 'true' } : 
           { valueStr: String(value) })
      }));
      delete data.attributes;
    }

    setAutoSaveStatus('saving');
    try {
      if (isFirstSave && !listingId) {
        // Create initial draft
        const res = await listingsService.create({ ...data, status: 'DRAFT' });
        setListingId(res.id);
        setIsFirstSave(false);
        // Silently update URL if needed
      } else if (listingId) {
        // Update existing draft
        await listingsService.update(listingId, data);
      }
      setAutoSaveStatus('saved');
      setLastSavedAt(new Date());
    } catch (error) {
      console.error('Auto-save error:', error);
      setAutoSaveStatus('error');
    }
  }, [form, listingId, isFirstSave]);

  // Debounced Auto-save & Score update
  useEffect(() => {
    const subscription = form.watch((values) => {
      // Update score in real-time
      setQualityScore(calculateScore(values));

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      setAutoSaveStatus('saving');
      saveTimeoutRef.current = setTimeout(() => {
        saveProgress();
      }, 2000); // 2 second debounce
    });
    return () => subscription.unsubscribe();
  }, [form, saveProgress]);

  const nextStep = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      // Force immediate save when advancing
      await saveProgress();
      setCurrentStep((prev) => Math.min(prev + 1, 5) as WizardStep);
      return true;
    }
    return false;
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1) as WizardStep);
  };

  return (
    <WizardContext.Provider value={{
      currentStep,
      setStep: setCurrentStep,
      form,
      listingId,
      autoSaveStatus,
      lastSavedAt,
      qualityScore,
      isFirstSave,
      saveProgress,
      nextStep,
      prevStep
    }}>
      {children}
    </WizardContext.Provider>
  );
}

export const useWizard = () => {
  const context = useContext(WizardContext);
  if (!context) throw new Error('useWizard must be used within a WizardProvider');
  return context;
};
