import { createAdReviewWorker } from './workers/AdReviewWorker';
import { createLeadQualificationWorker } from './workers/LeadQualificationWorker';

console.log('🤖 Inicializando Finanhub AI-Agents Workers Daemon...');
console.log('🔗 Conectando-se as Filas do Redis...');

const adWorker = createAdReviewWorker();
const leadWorker = createLeadQualificationWorker();

console.log('✅ Worker `AdReview` Operacional.');
console.log('✅ Worker `LeadQualification` Operacional.');
console.log('📡 Daemon de IA aguardando submissões M&A no background!');

process.on('SIGINT', async () => {
    console.log('🔌 Desligando graciosamente workers...');
    await Promise.all([adWorker.close(), leadWorker.close()]);
    process.exit(0);
});

