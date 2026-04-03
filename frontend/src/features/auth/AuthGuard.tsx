'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Evita loop enquanto checa
    if (loading) return; 

    // O Guard barrará o acesso se não estiver autenticado e a rota nao for pública
    const isPublicRoute = pathname?.startsWith('/login') || pathname?.startsWith('/register');

    if (!isAuthenticated && !isPublicRoute) {
      router.replace('/login');
    }
  }, [isAuthenticated, loading, router, pathname]);

  // Se bloqueado/carregando, retorna null para não renderizar as entranhas da dashboard
  if (loading || (!isAuthenticated && !pathname?.startsWith('/login'))) {
    return <div className="h-screen w-full flex items-center justify-center text-gray-500">Autenticando sessão segura...</div>;
  }

  return <>{children}</>;
}
