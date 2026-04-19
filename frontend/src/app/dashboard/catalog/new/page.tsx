'use client';

import React from 'react';
import { CatalogProvider } from './CatalogContext';
import { CatalogWizard } from './CatalogWizard';

export default function NewCatalogPage() {
  return (
    <CatalogProvider>
      <CatalogWizard />
    </CatalogProvider>
  );
}
