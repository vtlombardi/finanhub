'use client';

import React from 'react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardTopbar } from '@/components/layout/DashboardTopbar';
import styles from '@/styles/Dashboard.module.css';

/**
 * Dashboard Layout - 1:1 Premium Visualization Shell
 * Applies the 290px Sidebar and Premium Topbar globally to /dashboard/**
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.shell}>
        <DashboardSidebar />
        
        <div className={styles.content}>
          <DashboardTopbar />
          {children}
          
          <div className={styles.footerNote}>
            Conceito visual para validação antes da implementação • HTML estático premium do dashboard do usuário da FINANHUB
          </div>
        </div>
      </div>
    </div>
  );
}
