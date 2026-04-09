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
const AI_TEMPERATURE = parseFloat(process.env.OPENAI_TEMPERATURE || '0.2');
const AI_MAX_RETRIES = parseInt(process.env.OPENAI_MAX_RETRIES || '3', 10);
const AI_TIMEOUT_MS = parseInt(process.env.OPENAI_TIMEOUT_MS || '20000', 10);

/** Extrai JSON de uma string que pode vir com markdown ```json ... ``` */
function parseAiJson(raw: string): any {
  const cleaned = raw.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
}

export const createAdReviewWorker = () => {
  const worker = new Worker(
    'ai-review',
    async (job: Job) => {
      const { listingId, tenantId } = job.data;
      console.log(`\n[AdReview] Job ${job.id} — Listing: ${listingId}`);

      const listing = await prisma.listing.findUnique({ where: { id: listingId } });

      if (!listing) throw new Error(`Listing ${listingId} não encontrada. Job dropado.`);

      if (listing.status !== 'PENDING_AI_REVIEW') {
        console.log(`[AdReview] Listing já avaliada (${listing.status}). Ignorando.`);
        return { skipped: true };
      }

      // Auditoria: cria AiJob
      const traceId = `ad-review-${listingId}-${Date.now()}`;
      const aiJob = await prisma.aiJob.create({
        data: {
          tenantId,
          traceId,
          jobName: 'REVIEW_AD',
          status: 'PROCESSING',
          payload: {
            listingId,
            title: listing.title,
            price: listing.price?.toString(),
          },
        },
      });

      try {
        console.log(`[AdReview] Avaliando via ${AI_MODEL}...`);

        const aiResponse = await openai.chat.completions.create(
          {
            model: AI_MODEL,
            temperature: AI_TEMPERATURE,
            messages: [
              {
                role: 'system',
                content: `Você é o Auditor M&A da Finanhub. Avalie anúncios de venda de empresas.

Regras de REPROVAÇÃO (FLAGGED):
- Palavras obscenas ou ofensivas
- Promessas financeiras absurdas ou irrealistas ("Lucro garantido", "Retorno de 1000%")
- Descrição sem nexo, vazia ou claramente falsa
- Indícios de golpe ou fraude (urgência extrema, pedir dados sensíveis)

Regras de APROVAÇÃO (ACTIVE):
- Sumário executivo razoável e descritivo
- Informações financeiras plausíveis
- Texto limpo, profissional ou neutro

Responda EXCLUSIVAMENTE com JSON limpo (sem markdown):
{
  "status": "ACTIVE" | "FLAGGED",
  "reason": "<justificativa em 1 frase>",
  "recommendedTitle": "<sugestão de título melhorado ou null>",
  "flags": ["<tag1>", "<tag2>"],
  "scamProbability": <0.0 a 1.0>
}`,
              },
              {
                role: 'user',
                content: `Título: ${listing.title}\nPreço: R$ ${listing.price ?? 'não informado'}\nDescrição: ${listing.description ?? 'não informada'}`,
              },
            ],
          },
          { timeout: AI_TIMEOUT_MS },
        );

        const rawJson = aiResponse.choices[0].message.content?.trim() ?? '';
        console.log(`[AdReview] Resposta bruta: ${rawJson}`);

        const payload = parseAiJson(rawJson);
        const newStatus = payload.status === 'ACTIVE' ? 'ACTIVE' : 'FLAGGED';

        // Atualiza status do listing
        await prisma.listing.update({
          where: { id: listingId },
          data: { status: newStatus },
        });

        // Persiste insight para o painel de moderação
        await prisma.aiInsight.create({
          data: {
            listingId,
            scamProbability: payload.scamProbability ?? 0,
            recommendedTitle: payload.recommendedTitle ?? null,
            flags: payload.flags ?? [],
          },
        });

        // Fecha AiJob como COMPLETED
        await prisma.aiJob.update({
          where: { id: aiJob.id },
          data: {
            status: 'COMPLETED',
            result: payload,
            completedAt: new Date(),
          },
        });

        console.log(`[AdReview] ✅ Listing ${listingId} → ${newStatus} (scam: ${payload.scamProbability})`);
        return { status: newStatus, success: true };

      } catch (e: any) {
        console.error(`[AdReview] ❌ Falha:`, e.message);

        await prisma.aiJob.update({
          where: { id: aiJob.id },
          data: { status: 'FAILED', error: e.message, completedAt: new Date() },
        });

        if (job.attemptsMade >= AI_MAX_RETRIES - 1) {
          console.log(`[AdReview] Última tentativa. Marcando como FLAGGED.`);
          await prisma.listing.update({
            where: { id: listingId },
            data: { status: 'FLAGGED' },
          });
        }

        throw e;
      }
    },
    { connection, concurrency: 2 },
  );

  worker.on('failed', (job, err) => {
    console.error(`[AdReview] Job ${job?.id} falhou decisivamente: ${err.message}`);
  });

  worker.on('completed', (job, result) => {
    if (!result?.skipped) {
      console.log(`[AdReview] Job ${job?.id} concluído: ${result?.status}`);
    }
  });

  return worker;
};
