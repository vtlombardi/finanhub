import { ReactNode } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

/**
 * Layout principal engessando a /dashboard
 * Tudo abaixo disso obriga AuthGuard e renderiza com o painel lateral M&A B2B
 */
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </AuthGuard>
  );
}
