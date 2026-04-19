import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export enum RecommendationType {
  LEAD_STALLED = 'LEAD_STALLED',
  HOT_LEAD_ACTIVITY = 'HOT_LEAD_ACTIVITY',
  NEGOTIATION_STUCK = 'NEGOTIATION_STUCK',
  LOW_PERFORMANCE = 'LOW_PERFORMANCE',
  DATAROOM_FOLLOWUP = 'DATAROOM_FOLLOWUP',
}

export interface Recommendation {
  id: string;
  type: RecommendationType;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  reason: string;
  suggestedAction: string;
  suggestedMessage?: string;
  metadata: any;
}

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Identifica e gera recomendações personalizadas para um vendedor.
   */
  async getRecommendedActions(userId: string): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // 1. Buscar Leads Parados (> 24h sem resposta em estágio inicial)
    const stalledLeads = await this.findStalledLeads(userId);
    recommendations.push(...stalledLeads);

    // 2. Buscar Atividade de Leads Quentes (> 80 score + Data Room)
    const hotLeadActivity = await this.findHotLeadActivity(userId);
    recommendations.push(...hotLeadActivity);

    // 3. Buscar Negociações Travadas (> 48h sem evolução em estágios avançados)
    const stuckNegotiations = await this.findStuckNegotiations(userId);
    recommendations.push(...stuckNegotiations);

    // 4. Performance do Anúncio (Anúncios com muitas views e poucos leads)
    const performanceInsights = await this.findPerformanceInsights(userId);
    recommendations.push(...performanceInsights);

    // Ordenar por prioridade (HIGH > MEDIUM > LOW)
    return recommendations.sort((a, b) => {
      const priorityWeights = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return priorityWeights[b.priority] - priorityWeights[a.priority];
    });
  }

  // ── Motores de Detecção ──────────────────────────────────────────────────

  private async findStalledLeads(userId: string): Promise<Recommendation[]> {
    const threshold = new Date();
    threshold.setHours(threshold.getHours() - 24);

    const leads = await this.prisma.lead.findMany({
      where: {
        tenant: { ownerId: userId },
        status: 'NEW',
        createdAt: { lt: threshold },
      },
      include: {
        investor: { select: { fullName: true } },
        listing: { select: { title: true } },
      },
      take: 5,
    });

    return leads.map(lead => ({
      id: `stalled-${lead.id}`,
      type: RecommendationType.LEAD_STALLED,
      priority: 'MEDIUM',
      title: 'Lead aguardando resposta',
      reason: `O investidor ${lead.investor.fullName} manifestou interesse há mais de 24h e ainda não recebeu retorno inicial.`,
      suggestedAction: 'Enviar mensagem de boas-vindas e agendar call',
      suggestedMessage: `Olá ${lead.investor.fullName.split(' ')[0]}, agradeço o interesse no anúncio "${lead.listing.title}". Gostaria de agendar uma breve call para apresentarmos os detalhes da operação?`,
      metadata: { leadId: lead.id, investorName: lead.investor.fullName },
    }));
  }

  private async findHotLeadActivity(userId: string): Promise<Recommendation[]> {
    const threshold = new Date();
    threshold.setHours(threshold.getHours() - 12);

    // Leads com score alto que viram dataroom recentemente
    const views = await this.prisma.dataRoomViewLog.findMany({
      where: {
        document: { listing: { ownerId: userId } },
        createdAt: { gte: threshold },
      },
      include: {
        investor: { 
          include: { 
            leads: { 
              where: { score: { gte: 80 } },
              take: 1 
            } 
          } 
        },
        document: { select: { listing: true, title: true } },
      },
    });

    const recommendations: Recommendation[] = [];
    const processedInvestors = new Set();

    for (const view of views) {
      const lead = view.investor.leads[0];
      if (lead && !processedInvestors.has(view.investor.id)) {
        processedInvestors.add(view.investor.id);
        recommendations.push({
          id: `hot-activity-${view.id}`,
          type: RecommendationType.HOT_LEAD_ACTIVITY,
          priority: 'HIGH',
          title: 'Atividade de Lead Qualificado',
          reason: `O investidor ${view.investor.fullName} (Score ${lead.score}) acabou de analisar o documento "${view.document.title}".`,
          suggestedAction: 'Follow-up focado na documentação analisada',
          suggestedMessage: `Oi ${view.investor.fullName.split(' ')[0]}, vi que você analisou a documentação estratégica do anúncio. Ficou com alguma dúvida sobre os números ou a estrutura da operação?`,
          metadata: { leadId: lead.id, investorName: view.investor.fullName },
        });
      }
    }

    return recommendations;
  }

  private async findStuckNegotiations(userId: string): Promise<Recommendation[]> {
    const threshold = new Date();
    threshold.setHours(threshold.getHours() - 48);

    const leads = await this.prisma.lead.findMany({
      where: {
        tenant: { ownerId: userId },
        status: { in: ['IN_CONTACT', 'PROPOSAL'] },
        updatedAt: { lt: threshold },
      },
      include: {
        investor: { select: { fullName: true } },
        listing: { select: { title: true } },
      },
    });

    return leads.map(lead => ({
      id: `stuck-${lead.id}`,
      type: RecommendationType.NEGOTIATION_STUCK,
      priority: 'MEDIUM',
      title: 'Negociação estagnada',
      reason: `Não houve evolução no status da negociação com ${lead.investor.fullName} nos últimos 2 dias.`,
      suggestedAction: 'Retomar contato para coletar feedback da proposta',
      suggestedMessage: `Olá ${lead.investor.fullName.split(' ')[0]}, passando para saber se você conseguiu avançar na análise da nossa última conversa sobre o anúncio "${lead.listing.title}". Ficamos à disposição para ajustes.`,
      metadata: { leadId: lead.id, investorName: lead.investor.fullName },
    }));
  }

  private async findPerformanceInsights(userId: string): Promise<Recommendation[]> {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - 7);

    // Busca anúncios ativos do usuário
    const listings = await this.prisma.listing.findMany({
      where: { ownerId: userId, status: 'ACTIVE' },
      include: {
        _count: {
          select: {
            leads: { where: { createdAt: { gte: threshold } } }
          }
        },
        metrics: {
          where: { type: 'VIEW', createdAt: { gte: threshold } }
        }
      }
    });

    return listings
      .filter(l => {
        const views = l.metrics.length;
        const leads = l._count.leads;
        return views > 30 && leads === 0; // Mais de 30 views e 0 leads na semana
      })
      .map(listing => ({
        id: `perf-${listing.id}`,
        type: RecommendationType.LOW_PERFORMANCE,
        priority: 'LOW',
        title: 'Baixa Conversão detectada',
        reason: `O anúncio "${listing.title}" teve ${listing.metrics.length} visualizações na última semana, mas nenhuma manifestação de interesse.`,
        suggestedAction: 'Revisar título e descrição para aumentar atratividade',
        metadata: { listingId: listing.id, views: listing.metrics.length },
      }));
  }
}
