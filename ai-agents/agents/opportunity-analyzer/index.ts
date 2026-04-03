import { OpportunityAnalyzerInput, OpportunityAnalyzerOutput, JobContext } from '../../shared/contracts';

export async function processOpportunityAnalysis(context: JobContext, data: OpportunityAnalyzerInput): Promise<OpportunityAnalyzerOutput> {
  console.log(`[OppAnalyzer] Avaliando tenant ${context.tenantId} - Background: ${data.companyBackground}`);

  // Simulação AI de checagem Scam
  await new Promise(resolve => setTimeout(resolve, 2500));

  const isSuspicious = data.companyBackground.toLowerCase().includes('garantido');

  return {
    scamProbability: isSuspicious ? 0.95 : 0.1,
    isApproved: !isSuspicious,
    flags: isSuspicious ? ['Promessa de ganho garantido detectada no background'] : [],
  };
}
