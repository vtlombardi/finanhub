/**
 * Contratos e tipos para o módulo de Oportunidades/Listings.
 */

export type ListingStatus = 
  | 'DRAFT'
  | 'PENDING_AI_REVIEW'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'FLAGGED'
  | 'SUSPENDED'
  | 'CLOSED';

export interface ListingCategory {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
}

export interface ListingMedia {
  id: string;
  url: string;
  mediaType: string;
  isCover: boolean;
}

export interface ListingAttributeValue {
  id: string;
  attribute: {
    name: string;
    label: string;
    type: string;
  };
  valueStr?: string | null;
  valueNum?: number | null;
  valueBool?: boolean | null;
}

export interface ListingFeature {
  id: string;
  name: string;
  iconClass?: string | null;
}

export interface Listing {
  id: string;
  tenantId: string;
  companyId: string;
  categoryId: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  status: ListingStatus;
  isFeatured: boolean;
  featuredUntil?: string | null;
  createdAt: string;
  updatedAt: string;
  category?: ListingCategory;
  tenant?: { name: string };
  company?: { 
    name: string; 
    isVerified: boolean; 
    trustScore?: number;
    responseRate?: number;
    responseTime?: string;
    yearsActive?: number;
    dealsCount?: number;
    bio?: string;
    createdAt: string;
  };
  media?: ListingMedia[];
  attrValues?: ListingAttributeValue[];
  features?: ListingFeature[];
  
  // Localização (Opcional no sumário, detalhado no review)
  city?: string | null;
  state?: string | null;
  neighborhood?: string | null;

  // Métricas Financeiras
  revenue?: string | null;
  ebitda?: string | null;
  employeesCount?: string | null;

  // IA Insight (Recomendável para futura expansão)
  matchScore?: number; // 0-100
  aiReasoning?: string;
}

export interface SearchFilters {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  state?: string;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'oldest';
  page?: number;
  limit?: number;
}

export interface ListingsResponse {
  data: Listing[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
