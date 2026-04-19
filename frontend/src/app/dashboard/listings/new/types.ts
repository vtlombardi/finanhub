import { Listing } from '@/../../shared/contracts/listings';

export type WizardStep = 1 | 2 | 3 | 4 | 5;

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface WizardState {
  currentStep: WizardStep;
  data: Partial<Listing>;
  listingId: string | null;
  autoSaveStatus: AutoSaveStatus;
  lastSavedAt: Date | null;
  qualityScore: number;
}

export interface CategoryAttribute {
  id: string;
  name: string;
  label: string;
  type: string;
  isRequired: boolean;
}

export interface HayiaInsight {
  type: 'tip' | 'warning' | 'opportunity';
  content: string;
}
