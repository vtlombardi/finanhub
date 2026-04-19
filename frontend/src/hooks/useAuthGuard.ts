import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthProvider';

/**
 * Hook de proteção de rota com suporte a RBAC (Role-Based Access Control)
 * @param allowedRoles Lista de papéis permitidos para acessar a rota. Se omitido, apenas exige autenticação.
 */
export function useAuthGuard(allowedRoles?: string[]) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // 1. Não autenticado -> Redireciona para Login
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // 2. Se houver restrição de roles, valida se o user possui alguma permitida
    if (allowedRoles && allowedRoles.length > 0) {
      const hasPermission = user?.role && allowedRoles.includes(user.role);
      
      if (!hasPermission) {
        console.warn(`[RBAC] Usuário ${user?.email} tentou acessar rota restrita. Role: ${user?.role}`);
        router.push('/dashboard');
      }
    }
  }, [user, loading, isAuthenticated, allowedRoles, router]);

  return { loading, user };
}
