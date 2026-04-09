export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  tenantId: string;
  isEmailVerified: boolean;
  avatarUrl?: string;
  createdAt?: string;
}

export interface UserProfileUpdate {
  fullName?: string;
  avatarUrl?: string;
}

export interface ChangePasswordRequest {
  currentPassword?: string;
  newPassword: string;
}
