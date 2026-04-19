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
  phonePrimary?: string;
  phoneSecondary?: string;
  jobTitle?: string;
  companyName?: string;
  websiteUrl?: string;
  city?: string;
  state?: string;
  country?: string;
  createdAt?: string;
  tenant?: {
    id: string;
    name: string;
  };
}

export interface UserProfileUpdate {
  fullName?: string;
  avatarUrl?: string;
  phonePrimary?: string;
  phoneSecondary?: string;
  jobTitle?: string;
  companyName?: string;
  websiteUrl?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface ChangePasswordRequest {
  currentPassword?: string;
  newPassword: string;
}
