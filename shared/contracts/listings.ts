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
  subtitle?: string | null;
  description: string;
  price: number;
  status: ListingStatus;
  isFeatured: boolean;
  featuredUntil?: string | null;
  createdAt: string;
  updatedAt: string;
  ownerId?: string | null;
  
  category?: ListingCategory;
  tenant?: { name: string };
  company?: { 
    name: string; 
    isVerified: boolean; 
    createdAt: string;
  };
  media?: ListingMedia[];
  attrValues?: ListingAttributeValue[];
  features?: ListingFeature[];
  
  // Localização
  city?: string | null;
  state?: string | null;
  neighborhood?: string | null;
  zipCode?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  addressReference?: string | null;
  country?: string | null;

  // Financeiro e Métricas (Padronizados)
  annualRevenue?: number | null;
  ebitda?: number | null;
  ebitdaMargin?: number | null;
  avgTicket?: number | null;
  investmentValue?: number | null;
  
  // Operacional e Negócio
  employeesCount?: number | null;
  marketTime?: number | null;
  clientBaseCount?: number | null;
  revenueModel?: string | null;
  valuationMethod?: string | null;
  reasonForSale?: string | null;
  operationStructure?: string | null;
  buyerProfile?: string | null;
  nextSteps?: string | null;
  confidentialityNote?: string | null;

  // Contato e SEO
  email?: string | null;
  websiteUrl?: string | null;
  phonePrimary?: string | null;
  phoneSecondary?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  twitterUrl?: string | null;
  linkedinUrl?: string | null;
  tiktokUrl?: string | null;
  logoUrl?: string | null;
  videoUrl?: string | null;
  videoDescription?: string | null;
  seoTitle?: string | null;
  seoKeywords?: string | null;
  seoDescription?: string | null;

  // IA Insight
  matchScore?: number; // 0-100
  aiReasoning?: string;
}

export interface SearchFilters {
  q?: string;
  category?: string;
  subCategory?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  state?: string;
  opportunityType?: string;
  minRevenue?: number;
  maxRevenue?: number;
  minEbitda?: number;
  maxEbitda?: number;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'revenue_desc' | 'ebitda_desc';
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
