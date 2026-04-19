import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class MatchingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calcula o score de matching (0-100) entre um investidor e uma oportunidade.
   */
  async calculateMatchScore(userId: string, listingId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) return null;

    // 1. Histórico de busca do usuário (inferência de perfil)
    const history = await this.getUserInteractionHistory(userId);

    // Cálculos parciais
    const financialScore = this.calculateFinancialAdherence(listing, history);
    const sectorScore = this.calculateSectorAffinity(listing, history);
    const behavioralScore = await this.calculateBehavioralSignals(userId, listingId);
    
    // Pegar score IA se houver lead
    const lead = await this.prisma.lead.findFirst({
      where: { investorId: userId, listingId },
    });
    const aiScore = lead?.score || 50; // Default 50 se não houver lead

    // Pesos do Algoritmo (HAYIA Engine)
    // Financeira 35%, Setorial 25%, Comportamental 25%, IA 15%
    const totalScore = Math.round(
      (financialScore * 0.35) +
      (sectorScore * 0.25) +
      (behavioralScore * 0.25) +
      (aiScore * 0.15)
    );

    const classification = this.getClassification(totalScore);
    const justification = this.generateJustification(totalScore, { financialScore, sectorScore, behavioralScore, aiScore });

    return {
      score: totalScore,
      classification,
      justification,
      factors: {
        financial: financialScore,
        sector: sectorScore,
        behavioral: behavioralScore,
        ai: aiScore,
      }
    };
  }

  /**
   * Pega as melhores oportunidades para um investidor específico.
   */
  async getRecommendedListings(userId: string, limit = 10) {
    const activeListings = await this.prisma.listing.findMany({
      where: { status: 'ACTIVE' },
      take: 100, // Amostra inicial
    });

    const scores = await Promise.all(
      activeListings.map(async (listing) => {
        const match = await this.calculateMatchScore(userId, listing.id);
        return { ...listing, match };
      })
    );

    return scores
      .filter(s => s.match)
      .sort((a, b) => (b.match?.score || 0) - (a.match?.score || 0))
      .slice(0, limit);
  }

  /**
   * Pega os investidores mais aderentes para uma listagem específica.
   */
  async getTopMatchesForListing(listingId: string, limit = 5) {
    // Investidores ativos (quem interagiu recentemente com o portal)
    const activeInvestors = await this.prisma.user.findMany({
      where: {
        OR: [
          { leads: { some: {} } },
          { favorites: { some: {} } }
        ]
      },
      take: 200,
    });

    const matches = await Promise.all(
      activeInvestors.map(async (user) => {
        const match = await this.calculateMatchScore(user.id, listingId);
        return { ...user, match };
      })
    );

    return matches
      .filter(m => m.match && m.match.score >= 40) // Guardrail de relevância
      .sort((a, b) => (b.match?.score || 0) - (a.match?.score || 0))
      .slice(0, limit);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private async getUserInteractionHistory(userId: string) {
    const leads = await this.prisma.lead.findMany({
      where: { investorId: userId },
      include: { listing: { select: { investmentValue: true, categoryId: true } } },
    });

    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: { listing: { select: { investmentValue: true, categoryId: true } } },
    });

    return { leads, favorites };
  }

  private calculateFinancialAdherence(listing: any, history: any) {
    if (!listing.investmentValue) return 70; // Neutro se listagem não tem valor

    const allValues = [
      ...history.leads.map(l => Number(l.listing.investmentValue || 0)),
      ...history.favorites.map(f => Number(f.listing.investmentValue || 0))
    ].filter(v => v > 0);

    if (allValues.length === 0) return 50;

    const avgBudget = allValues.reduce((a, b) => a + b, 0) / allValues.length;
    const listingPrice = Number(listing.investmentValue);

    const diff = Math.abs(listingPrice - avgBudget);
    const adherence = Math.max(0, 100 - (diff / avgBudget) * 100);
    
    return Math.min(100, adherence);
  }

  private calculateSectorAffinity(listing: any, history: any) {
    const categories = [
      ...history.leads.map(l => l.listing.categoryId),
      ...history.favorites.map(f => f.listing.categoryId)
    ];

    if (categories.length === 0) return 50;

    const count = categories.filter(c => c === listing.categoryId).length;
    const ratio = count / categories.length;

    if (ratio > 0.5) return 100;
    if (ratio > 0.2) return 80;
    if (ratio > 0) return 60;
    return 30; // Diferente mas pode interessar
  }

  private async calculateBehavioralSignals(userId: string, listingId: string) {
    let score = 40; // Base inicial

    // 1. Data Room (Sinal Forte)
    const views = await this.prisma.dataRoomViewLog.findMany({
      where: { 
        investorId: userId,
        document: { listingId }
      }
    });

    if (views.length > 0) {
      score += 40; // Viu documentos = interesse sério
      if (views.length > 3) score += 10; // Recorrência = interesse estratégico
    }

    // 2. Favoritos (Sinal Inicial)
    const isFavorite = await this.prisma.favorite.findFirst({
      where: { userId, listingId }
    });

    if (isFavorite) score += 10;

    return Math.min(100, score);
  }

  private getClassification(score: number) {
    if (score >= 90) return 'Muito Alto';
    if (score >= 70) return 'Alto';
    if (score >= 40) return 'Médio';
    return 'Baixo';
  }

  private generateJustification(score: number, factors: any) {
    const sorted = Object.entries(factors).sort(([, a], [, b]) => (b as number) - (a as number));
    const [topFactor] = sorted[0];

    switch (topFactor) {
      case 'financialScore':
        return 'Forte aderência entre faixa de investimento e perfil histórico.';
      case 'sectorScore':
        return 'Alta afinidade com o setor e tipo de ativo desta oportunidade.';
      case 'behavioralScore':
        return 'Engajamento recorrente e interesse direto em documentação estratégica.';
      case 'aiScore':
        return 'Perfil altamente qualificado pela inteligência de análise HAYIA.';
      default:
        return 'Equilíbrio sólido entre perfil, orçamento e interesse demonstrado.';
    }
  }
}
