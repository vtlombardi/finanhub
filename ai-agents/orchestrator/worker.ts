import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { AIJobNames, AI_QUEUE_NAME } from '../shared/jobs.enum';
import { JobContext } from '../shared/contracts';

// Handlers dos Agentes
import { processAdGeneration } from '../agents/ad-generator';
import { processLeadQualification } from '../agents/lead-qualifier';
import { processOpportunityAnalysis } from '../agents/opportunity-analyzer';

require('dotenv').config();

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null
});

console.log('🤖 AI Worker Orquestrador inicializando...');

// O Worker atuará isoladamente da Web-App consumindo do Redis
const aiWorker = new Worker(
  AI_QUEUE_NAME,
  async (job: Job) => {
    const context: JobContext = job.data?.context;
    
    if (!context || !context.tenantId) {
      throw new Error(`[FAULT] Job ${job.id} originado sem Contexto Seguro/TenantId de entrada.`);
    }

    console.log(`\n===========================================`);
    console.log(`📥 Recebendo Job: ${job.name} | ID: ${job.id}`);
    console.log(`🔑 Escopo de Execução - Tenant: ${context.tenantId}`);

    switch (job.name) {
      case AIJobNames.GENERATE_AD:
        return processAdGeneration(context, job.data.payload);
        
      case AIJobNames.QUALIFY_LEAD:
        return processLeadQualification(context, job.data.payload);
        
      case AIJobNames.ANALYZE_OPPORTUNITY:
        return processOpportunityAnalysis(context, job.data.payload);

      default:
        throw new Error(`Job type ${job.name} is unknown to AI Worker`);
    }
  },
  {
    connection,
    concurrency: 5, // Escala horizontal: processa até 5 requests de LLM em paralelo por Node.
  }
);

aiWorker.on('completed', (job) => {
  console.log(`✅ [${job.id}] Finalizado com sucesso. Resultado emitido.`);
});

aiWorker.on('failed', (job, err) => {
  console.error(`❌ [${job?.id || 'Unknown'}] Falhou permanentemente (Tratado pelo BullMQ Lifecycle). Erro:`, err.message);
});

// Resiliência contra quedas de container Docker
process.on('SIGTERM', async () => {
    console.log('Finalizando worker com graceful shutdown...');
    await aiWorker.close();
    process.exit(0);
});
