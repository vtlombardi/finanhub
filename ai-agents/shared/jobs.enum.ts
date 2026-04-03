export enum AIJobNames {
  GENERATE_AD = 'generate_ad',
  QUALIFY_LEAD = 'qualify_lead',
  ANALYZE_OPPORTUNITY = 'analyze_opportunity',
}

export enum JobStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export const AI_QUEUE_NAME = 'finanhub:ai-jobs';
