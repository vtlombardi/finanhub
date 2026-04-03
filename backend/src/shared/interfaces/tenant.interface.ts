export interface ITenant {
  id: string;
  slug: string;
  name: string;
  cnpj?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICompanyMember {
  id: string;
  tenantId: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'USER';
}
