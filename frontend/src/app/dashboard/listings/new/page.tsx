'use client';

import React from 'react';
import { WizardProvider } from './WizardContext';
import { ListingWizard } from './ListingWizard';

export default function NewListingPage() {
  return (
    <WizardProvider>
      <ListingWizard />
    </WizardProvider>
  );
}
