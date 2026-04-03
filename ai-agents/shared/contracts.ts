import { z } from 'zod';

/** BASE CONTEXT: Obrigatório em todos os Jobs */
export interface JobContext {
  tenantId: string;
  userId?: string;
  traceId: string;        // UUID tracking observability
  timestamp: number;
}

/** AD-GENERATOR */
export const AdGeneratorInputSchema = z.object({
  rawIdea: z.string(),
  budgetType: z.string().optional(),
  targetIndustry: z.string().optional()
});
export type AdGeneratorInput = z.infer<typeof AdGeneratorInputSchema>;

export interface AdGeneratorOutput {
  title: string;
  pitch: string;
  recommendedKeywords: string[];
}

/** LEAD-QUALIFIER */
export const LeadQualifierInputSchema = z.object({
  chatHistory: z.array(z.string()),
  dealValue: z.number().optional()
});
export type LeadQualifierInput = z.infer<typeof LeadQualifierInputSchema>;

export interface LeadQualifierOutput {
  fitScore: number;     // 0 a 100
  intentLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  summary: string;
}

/** OPPORTUNITY-ANALYZER */
export const OpportunityAnalyzerInputSchema = z.object({
  metrics: z.record(z.string(), z.any()),
  companyBackground: z.string()
});
export type OpportunityAnalyzerInput = z.infer<typeof OpportunityAnalyzerInputSchema>;

export interface OpportunityAnalyzerOutput {
  scamProbability: number; // 0.0 a 1.0
  isApproved: boolean;
  flags: string[];
}
