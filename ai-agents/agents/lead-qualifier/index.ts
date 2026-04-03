import { LeadQualifierInput, LeadQualifierOutput, JobContext } from '../../shared/contracts';

export async function processLeadQualification(context: JobContext, data: LeadQualifierInput): Promise<LeadQualifierOutput> {
  console.log(`[LeadQualifier] Tenant: ${context.tenantId} Trace: ${context.traceId}`);
  
  // TODO: Emissão de Prompt LLM verificador de intenções
  await new Promise(resolve => setTimeout(resolve, 1500));

  const contentSize = data.chatHistory.join(' ').length;
  
  return {
    fitScore: contentSize > 100 ? 85 : 40,
    intentLevel: contentSize > 100 ? 'HIGH' : 'LOW',
    summary: 'Lead demonstrou interesse inicial no valuation do asset.'
  };
}
