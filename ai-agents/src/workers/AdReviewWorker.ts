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

// Variáveis Genéricas Configuráveis de IA
const AI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const AI_TEMPERATURE = parseFloat(process.env.OPENAI_TEMPERATURE || '0.2');
const AI_MAX_RETRIES = parseInt(process.env.OPENAI_MAX_RETRIES || '3', 10);
const AI_TIMEOUT_MS = parseInt(process.env.OPENAI_TIMEOUT_MS || '30000', 10);

export const createAdReviewWorker = () => {
  const worker = new Worker('ai-review', async (job: Job) => {
    const { listingId, tenantId } = job.data;
    console.log(`\n[IA-Worker] Processando Job ${job.id} para Listing: ${listingId}`);

    const listing = await prisma.listing.findUnique({
      where: { id: listingId }
    });

    if (!listing) {
      throw new Error(`Listing ${listingId} não encontrada. Job dropado.`);
    }

    if (listing.status !== 'PENDING_AI_REVIEW') {
      console.log(`[IA-Worker] Listing ${listingId} já avaliada (${listing.status}). Ignorando.`);
      return { skipped: true };
    }

    try {
      console.log(`[IA-Worker] Avaliando via ${AI_MODEL}...`);
      const aiResponse = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          {
            role: "system",
            content: `Você é o Auditor M&A da Finanhub. Analise os anúncios de listagem de empresas. 
            Regras de Reprovação (FLAGGED): Se houver palavras obscenas, promessas irrealistas ("Lucro Garantido Absurdo") ou descrições sem nexo.
            Regras de Aprovação (ACTIVE): Se for um sumário executivo razoável, descritivo, limpo.
            
            Você DEVE responder exclusivamente com um JSON limpo, sem markdown, contendo:
            {"status": "ACTIVE" | "FLAGGED", "reason": "Justificativa breve de 1 frase."}`
          },
          {
            role: "user",
            content: `Título do Anúncio: ${listing.title}\nPreço Base: R$ ${listing.price}\nDescrição: ${listing.description}`
          }
        ],
        temperature: AI_TEMPERATURE
      }, { timeout: AI_TIMEOUT_MS });

      const rawJson = aiResponse.choices[0].message.content?.trim();
      const payload = JSON.parse(rawJson || '{"status": "FLAGGED", "reason": "Falha de Parse na Resposta LLM"}');
      
      console.log(`[IA-Worker] Veredicto recebido: ${payload.status}`);
      await prisma.listing.update({
        where: { id: listingId },
        data: { 
          status: payload.status === 'ACTIVE' ? 'ACTIVE' : 'FLAGGED',
        }
      });

      console.log(`[IA-Worker] Banco atualizado com Sucesso para ${listingId}.`);
      return { status: payload.status, success: true };

    } catch (e: any) {
       console.error(`[IA-Worker] Falha na integração OpenAI:`, e.message);

       // Se estourar a cota de tentativa de re-connects limpos do próprio job, persistimos a Falha no DB pra o lojista não ficar cego
       if (job.attemptsMade >= AI_MAX_RETRIES - 1) {
          console.log(`[IA-Worker] Última tentativa estourada. Escrevendo FLAGGED_ERROR_AI no BD.`);
          await prisma.listing.update({
             where: { id: listingId },
             data: { status: 'FLAGGED' } // Ou um status como 'ERROR' a depender do engessamento enum, usamos FLAGGED pra congelar
          });
       }

       throw e; 
    }
  }, { connection });

  worker.on('failed', (job, err) => {
    console.error(`[IA-Worker] Job ${job?.id} falhou decisivamente: ${err.message}`);
  });

  return worker;
};
