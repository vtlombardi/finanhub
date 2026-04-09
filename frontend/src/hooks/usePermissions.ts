import { useAuth } from '@/features/auth/AuthProvider';
import { UserRole } from '@shared/contracts';

export function usePermissions() {
  const { user } = useAuth();

  const role = user?.role as UserRole;

  return {
    role,
    isOwner: role === UserRole.OWNER,
    isAdmin: role === UserRole.ADMIN,
    isUser: role === UserRole.USER,
    
    // Helpers de permissão comuns
    canManageMembers: role === UserRole.OWNER || role === UserRole.ADMIN,
    canAccessAnalytics: role === UserRole.OWNER || role === UserRole.ADMIN,
    canModifyAssets: role === UserRole.OWNER || role === UserRole.ADMIN,
    canModerate: role === UserRole.OWNER || role === UserRole.ADMIN,
    
    // OWNER apenas
    canDeleteWorkspace: role === UserRole.OWNER,
    canTransferOwnership: role === UserRole.OWNER,
  };
}
