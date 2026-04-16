import { api } from './api.client';

export interface ListingFeature {
  name: string;
  iconClass?: string;
}

export interface BusinessHour {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
}

export interface ListingMedia {
  id?: string;
  url: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  isCover: boolean;
}

export interface ListingData {
  id?: string;
  title: string;
  subtitle?: string;
  slug?: string;
  description: string;
  price?: number;
  categoryId: string;
  companyId: string;
  
  // Localização
  city?: string;
  state?: string;
  neighborhood?: string;
  addressLine1?: string;
  addressLine2?: string;
  zipCode?: string;
  addressReference?: string;
  country?: string;
  
  // Contato
  email?: string;
  websiteUrl?: string;
  phonePrimary?: string;
  phoneSecondary?: string;
  
  // Sociais
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  tiktokUrl?: string;
  
  // Financeiro e Métricas (Padronizados)
  annualRevenue?: number;
  ebitda?: number;
  ebitdaMargin?: number;
  avgTicket?: number;
  investmentValue?: number;

  // Operacional e Negócio
  employeesCount?: number;
  marketTime?: number;
  clientBaseCount?: number;
  revenueModel?: string;
  valuationMethod?: string;
  reasonForSale?: string;
  operationStructure?: string;
  buyerProfile?: string;
  nextSteps?: string;
  confidentialityNote?: string;
  
  // SEO
  seoTitle?: string;
  seoKeywords?: string;
  seoDescription?: string;
  
  // Mídia
  logoUrl?: string;
  videoUrl?: string;
  videoDescription?: string;
  
  // Atributos Dinâmicos (Categorias específicas)
  attrValues?: {
    attributeId: string;
    valueStr?: string;
    valueNum?: number;
    attribute?: {
      name: string;
      label: string;
    };
  }[];

  // Campos Virtuais para Formulários (Mapeados para attrValues no submit)
  franchiseName?: string;
  initialInvestmentTotal?: number;
  franchiseFee?: number;
  averageEstimatedRevenue?: number;
  estimatedPayback?: string;
  operationModel?: string;
  royaltiesFee?: string;
  marketingFee?: string;
  supportOffered?: string;
  trainingIncluded?: string;
  openedUnitsCount?: number;
  idealFranchiseeProfile?: string;
  territorialExclusivity?: string;
  expansionRegion?: string;

  // Campos Virtuais para Startups
  startupStage?: string;
  targetSector?: string;
  fundingRound?: string;
  fundingAmountRequested?: number;
  equityOffered?: string;
  businessModelType?: string;
  mrrCurrent?: number;
  tamMarketSize?: string;
  foundingTeamBrief?: string;
  techStackBrief?: string;
  validationPOCBrief?: string;
  startupProblem?: string;
  startupSolution?: string;
  competitiveEdge?: string;
  useOfCapital?: string;
  growthPotentialBrief?: string;

  // Relações
  features?: ListingFeature[];
  businessHours?: BusinessHour[];
  media?: ListingMedia[];
  
  // Status
  status?: string;
}

export const listingsService = {
  getById: async (id: string) => {
    const response = await api.get(`/listings/private/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<ListingData>) => {
    const response = await api.patch(`/listings/private/${id}`, data);
    return response.data;
  },

  create: async (data: ListingData) => {
    const response = await api.post('/listings/private', data);
    return response.data;
  },

  listMyListings: async () => {
    const response = await api.get('/listings/me');
    return response.data;
  },

  uploadMedia: async (file: File): Promise<{ url: string }> => {
    const form = new FormData();
    form.append('file', file);
    const response = await api.post('/listings/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  listCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
};
