import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

const AI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const AI_TEMPERATURE = parseFloat(process.env.OPENAI_TEMPERATURE || '0.3');
const AI_TIMEOUT_MS = parseInt(process.env.OPENAI_TIMEOUT_MS || '30000', 10);
const AI_MAX_RETRIES = parseInt(process.env.OPENAI_MAX_RETRIES || '3', 10);

export const createLeadQualificationWorker = () => {
  const worker = new Worker('ai-lead-qualification', async (job: Job) => {
    const { leadId, tenantId } = job.data;
    console.log(`\n[LeadQualify] Job ${job.id} — Processando Lead: ${leadId}`);

    // 1. Buscar Lead com contexto completo
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        investor: { select: { fullName: true, email: true } },
        listing: { select: { title: true, description: true, price: true } },
      },
    });

    if (!lead) {
      throw new Error(`Lead ${leadId} não encontrado. Job dropado.`);
    }

    if (lead.aiProcessedAt) {
      console.log(`[LeadQualify] Lead ${leadId} já processado. Ignorando.`);
      return { skipped: true };
    }

    // 2. Registrar AiJob para auditabilidade
    const traceId = `lead-qual-${leadId}-${Date.now()}`;
    const aiJob = await prisma.aiJob.create({
      data: {
        tenantId,
        traceId,
        jobName: 'QUALIFY_LEAD',
        status: 'PROCESSING',
        payload: {
          leadId,
          investorName: lead.investor.fullName,
          investorEmail: lead.investor.email,
          listingTitle: lead.listing.title,
          listingPrice: lead.listing.price?.toString(),
          message: lead.message,
        },
      },
    });

    try {
      console.log(`[LeadQualify] Chamando ${AI_MODEL} para qualificação...`);

      const aiResponse = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          {
            role: 'system',
            content: `Você é o Analista de Qualificação de Leads M&A da Finanhub.
Sua função é avaliar se um investidor que manifestou interesse em uma empresa à venda é um lead qualificado.

Critérios de avaliação:
- QUALIDADE da mensagem: é específica, demonstra conhecimento do setor, menciona capacidade financeira?
- INTENÇÃO: o investidor parece sério ou é apenas curioso?
- FIT: a mensagem indica compatibilidade com o tipo de negócio anunciado?

Classificações possíveis:
- QUALIFIED: Lead qualificado, demonstra intenção real e capacidade aparente
- WARM: Lead parcialmente qualificado, precisa de mais informações
- UNQUALIFIED: Lead não qualificado, mensagem genérica ou sem substância

Você DEVE responder exclusivamente com JSON limpo, sem markdown:
{
  "score": <número de 0 a 100>,
  "classification": "QUALIFIED" | "WARM" | "UNQUALIFIED",
  "intentLevel": "LOW" | "MEDIUM" | "HIGH",
  "reasonSummary": "<justificativa em 1-2 frases>",
  "recommendedAction": "<ação sugerida para o vendedor em 1 frase>"
}

IMPORTANTE: Você analisa e recomenda. A decisão final é SEMPRE humana. Nunca rejeite automaticamente.`,
          },
          {
            role: 'user',
            content: `ANÚNCIO: ${lead.listing.title}
DESCRIÇÃO DO NEGÓCIO: ${lead.listing.description}
VALUATION: R$ ${lead.listing.price}

INVESTIDOR: ${lead.investor.fullName} (${lead.investor.email})
MENSAGEM DO INVESTIDOR: "${lead.message}"`,
          },
        ],
        temperature: AI_TEMPERATURE,
      }, { timeout: AI_TIMEOUT_MS });

      const rawJson = aiResponse.choices[0].message.content?.trim();
      console.log(`[LeadQualify] Resposta bruta: ${rawJson}`);

      const result = JSON.parse(
        rawJson || '{"score":0,"classification":"UNQUALIFIED","intentLevel":"LOW","reasonSummary":"Falha de parse","recommendedAction":"Revisar manualmente"}',
      );

      // 3. Persistir resultado no Lead (UPDATE direto via Prisma)
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          score: Math.min(100, Math.max(0, result.score)),
          intentLevel: result.intentLevel,
          aiClassification: result.classification,
          aiReasonSummary: result.reasonSummary,
          aiRecommendedAction: result.recommendedAction,
          aiProcessedAt: new Date(),
          aiError: null,
        },
      });

      // 4. Atualizar AiJob como COMPLETED
      await prisma.aiJob.update({
        where: { id: aiJob.id },
        data: {
          status: 'COMPLETED',
          result,
          completedAt: new Date(),
        },
      });

      console.log(`[LeadQualify] ✅ Lead ${leadId} qualificado: ${result.classification} (score: ${result.score})`);
      return { success: true, ...result };

    } catch (e: any) {
      console.error(`[LeadQualify] ❌ Falha na qualificação:`, e.message);

      // Persistir erro para auditoria
      await prisma.aiJob.update({
        where: { id: aiJob.id },
        data: {
          status: 'FAILED',
          error: e.message,
          completedAt: new Date(),
        },
      });

      // Na última tentativa, gravar o erro no próprio Lead
      if (job.attemptsMade >= AI_MAX_RETRIES - 1) {
        await prisma.lead.update({
          where: { id: leadId },
          data: {
            aiError: `Falha após ${AI_MAX_RETRIES} tentativas: ${e.message}`,
            aiProcessedAt: new Date(),
          },
        });
      }

      throw e;
    }
  }, { connection });

  worker.on('failed', (job, err) => {
    console.error(`[LeadQualify] Job ${job?.id} falhou decisivamente: ${err.message}`);
  });

  return worker;
};
