import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

/** Definição centralizada dos tiers e seus limites padrão */
const TIER_DEFAULTS = {
  FREE: {
    name: 'Starter',
    description: 'Ideal para quem está começando a explorar o marketplace M&A.',
    price: 0,
    maxListings: 1,
    maxLeadsPerMonth: 5,
    maxFeaturedListings: 0,
    hasAiQualification: false,
    hasChat: false,
    hasPrioritySupport: false,
    hasAnalytics: false,
    hasApiAccess: false,
    hasCustomBranding: false,
  },
  BASIC: {
    name: 'Essencial',
    description: 'Para empresas que querem visibilidade e negociação ativa.',
    price: 297,
    maxListings: 5,
    maxLeadsPerMonth: 50,
    maxFeaturedListings: 1,
    hasAiQualification: true,
    hasChat: true,
    hasPrioritySupport: false,
    hasAnalytics: false,
    hasApiAccess: false,
    hasCustomBranding: false,
  },
  PRO: {
    name: 'Profissional',
    description: 'Visibilidade máxima, IA avançada e suporte prioritário.',
    price: 997,
    maxListings: 25,
    maxLeadsPerMonth: 500,
    maxFeaturedListings: 5,
    hasAiQualification: true,
    hasChat: true,
    hasPrioritySupport: true,
    hasAnalytics: true,
    hasApiAccess: false,
    hasCustomBranding: true,
  },
  ENTERPRISE: {
    name: 'Enterprise',
    description: 'Sob medida para operações M&A de grande porte.',
    price: 4997,
    maxListings: -1, // ilimitado
    maxLeadsPerMonth: -1,
    maxFeaturedListings: -1,
    hasAiQualification: true,
    hasChat: true,
    hasPrioritySupport: true,
    hasAnalytics: true,
    hasApiAccess: true,
    hasCustomBranding: true,
  },
};

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  /**
   * Lista todos os planos públicos disponíveis para assinatura.
   */
  async getPublicPlans() {
    return this.prisma.plan.findMany({
      where: { isPublic: true },
      orderBy: { price: 'asc' },
    });
  }

  /**
   * Retorna a assinatura ativa do tenant com o plano vinculado.
   */
  async getActiveSubscription(tenantId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { tenantId, isActive: true },
      include: { plan: true },
      orderBy: { startDate: 'desc' },
    });

    if (!subscription) {
      // Retornar indicação de plano free (sem assinatura formal)
      return {
        subscription: null,
        plan: { tier: 'FREE', ...TIER_DEFAULTS.FREE },
        isFreeTier: true,
      };
    }

    return {
      subscription,
      plan: subscription.plan,
      isFreeTier: subscription.plan.tier === 'FREE',
    };
  }

  /**
   * Retorna o consumo atual do tenant vs. limites do plano ativo.
   */
  async getUsage(tenantId: string) {
    const { plan } = await this.getActiveSubscription(tenantId);

    const [activeListings, totalLeadsThisMonth, featuredListings] = await Promise.all([
      this.prisma.listing.count({
        where: { tenantId, status: { in: ['ACTIVE', 'PENDING_AI_REVIEW'] as any } },
      }),
      this.prisma.lead.count({
        where: {
          tenantId,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      this.prisma.listing.count({
        where: { tenantId, isFeatured: true },
      }),
    ]);

    return {
      plan: {
        tier: plan.tier,
        name: plan.name,
      },
      usage: {
        listings: { current: activeListings, limit: plan.maxListings, unlimited: plan.maxListings === -1 },
        leadsPerMonth: { current: totalLeadsThisMonth, limit: plan.maxLeadsPerMonth, unlimited: plan.maxLeadsPerMonth === -1 },
        featuredListings: { current: featuredListings, limit: plan.maxFeaturedListings, unlimited: plan.maxFeaturedListings === -1 },
      },
      features: {
        aiQualification: plan.hasAiQualification,
        chat: plan.hasChat,
        prioritySupport: plan.hasPrioritySupport,
        analytics: plan.hasAnalytics,
        apiAccess: plan.hasApiAccess,
        customBranding: plan.hasCustomBranding,
      },
    };
  }

  /**
   * Ativa uma assinatura de plano para um tenant. 
   * Prepara para billing futuro (externalId, billingCycle).
   */
  async subscribe(tenantId: string, planId: string, billingCycle = 'MONTHLY') {
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plano não encontrado.');

    // Desativar assinatura atual
    await this.prisma.subscription.updateMany({
      where: { tenantId, isActive: true },
      data: { isActive: false, endDate: new Date() },
    });

    // Criar nova assinatura
    const subscription = await this.prisma.subscription.create({
      data: {
        tenantId,
        planId,
        isActive: true,
        billingCycle,
        startDate: new Date(),
        nextBillingAt: billingCycle === 'YEARLY'
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      include: { plan: true },
    });

    return subscription;
  }

  /**
   * Cancela a assinatura ativa (downgrade para FREE).
   */
  async cancelSubscription(tenantId: string, reason?: string) {
    const current = await this.prisma.subscription.findFirst({
      where: { tenantId, isActive: true },
    });

    if (!current) throw new NotFoundException('Nenhuma assinatura ativa.');

    await this.prisma.subscription.update({
      where: { id: current.id },
      data: {
        canceledAt: new Date(),
        cancelReason: reason,
        // Mantém ativa até o final do período
      },
    });

    return { message: 'Assinatura cancelada. Permanecerá ativa até o final do período.' };
  }

  /**
   * Verifica se um tenant pode criar mais listings (enforcement de limite).
   */
  async canCreateListing(tenantId: string): Promise<{ allowed: boolean; reason?: string }> {
    const { plan } = await this.getActiveSubscription(tenantId);
    if (plan.maxListings === -1) return { allowed: true };

    const count = await this.prisma.listing.count({
      where: { tenantId, status: { in: ['ACTIVE', 'PENDING_AI_REVIEW', 'DRAFT'] as any } },
    });

    if (count >= plan.maxListings) {
      return {
        allowed: false,
        reason: `Limite de ${plan.maxListings} anúncios atingido no plano ${plan.name}. Faça upgrade para publicar mais.`,
      };
    }

    return { allowed: true };
  }

  /**
   * Verifica se um tenant pode destacar mais listings.
   */
  async canFeatureListing(tenantId: string): Promise<{ allowed: boolean; reason?: string }> {
    const { plan } = await this.getActiveSubscription(tenantId);
    if (plan.maxFeaturedListings === -1) return { allowed: true };
    if (plan.maxFeaturedListings === 0) {
      return { allowed: false, reason: `Destaques não disponíveis no plano ${plan.name}. Faça upgrade.` };
    }

    const count = await this.prisma.listing.count({
      where: { tenantId, isFeatured: true },
    });

    if (count >= plan.maxFeaturedListings) {
      return {
        allowed: false,
        reason: `Limite de ${plan.maxFeaturedListings} destaque(s) atingido.`,
      };
    }

    return { allowed: true };
  }

  /**
   * Toggle featured no listing com verificação de limite do plano.
   */
  async toggleFeatured(listingId: string, tenantId: string) {
    const listing = await this.prisma.listing.findFirst({
      where: { id: listingId, tenantId },
    });

    if (!listing) throw new NotFoundException('Listing não encontrado.');

    if (!listing.isFeatured) {
      const check = await this.canFeatureListing(tenantId);
      if (!check.allowed) throw new ForbiddenException(check.reason);

      await this.prisma.listing.update({
        where: { id: listingId },
        data: {
          isFeatured: true,
          featuredPriority: 10,
          featuredUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
      return { featured: true };
    }

    await this.prisma.listing.update({
      where: { id: listingId },
      data: { isFeatured: false, featuredPriority: 0, featuredUntil: null },
    });
    return { featured: false };
  }

  /**
   * Seed dos planos padrão (utility para setup inicial).
   */
  async seedDefaultPlans() {
    const existing = await this.prisma.plan.count();
    if (existing > 0) return { message: 'Planos já existem.' };

    const plans = Object.entries(TIER_DEFAULTS).map(([tier, data]) => ({
      tier: tier as any,
      name: data.name,
      description: data.description,
      price: data.price,
      priceYearly: data.price > 0 ? data.price * 10 : 0, // 2 meses grátis no anual
      maxListings: data.maxListings,
      maxLeadsPerMonth: data.maxLeadsPerMonth,
      maxFeaturedListings: data.maxFeaturedListings,
      hasAiQualification: data.hasAiQualification,
      hasChat: data.hasChat,
      hasPrioritySupport: data.hasPrioritySupport,
      hasAnalytics: data.hasAnalytics,
      hasApiAccess: data.hasApiAccess,
      hasCustomBranding: data.hasCustomBranding,
      isPublic: true,
    }));

    await this.prisma.plan.createMany({ data: plans });
    return { message: `${plans.length} planos criados.` };
  }
}
