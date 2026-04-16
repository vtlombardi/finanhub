import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AdminDashboardService {
  constructor(private prisma: PrismaService) {}

  async getGlobalMetrics() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalUsers,
      totalTenants,
      totalListings,
      activeListings,
      pendingListings,
      totalLeads,
      activeSubscriptions,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.tenant.count(),
      this.prisma.listing.count({ where: { status: { not: 'DELETED' } } }),
      this.prisma.listing.count({ where: { status: 'ACTIVE' } }),
      this.prisma.listing.count({ where: { status: 'PENDING_AI_REVIEW' } }),
      this.prisma.lead.count(),
      this.prisma.subscription.findMany({
        where: {
          isActive: true,
          lastPaymentAt: { gte: thirtyDaysAgo },
        },
        include: { plan: true },
      }),
    ]);

    // Calcula receita estimada dos últimos 30 dias baseada em assinaturas pagas
    const estimatedRevenue30d = activeSubscriptions.reduce((acc, sub) => {
      return acc + Number(sub.plan.price);
    }, 0);

    return {
      kpis: {
        totalUsers,
        totalTenants,
        totalListings,
        activeListings,
        pendingListings,
        totalLeads,
        estimatedRevenue30d,
      },
      activityFeed: await this.getActivityFeed(),
      moderationQueue: await this.getModerationQueue(),
      operationalSummary: await this.getOperationalSummary(),
    };
  }

  private async getActivityFeed() {
    // Busca eventos recentes de diversas tabelas para compor o feed
    const [users, listings, leads] = await Promise.all([
      this.prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, fullName: true, createdAt: true, role: true },
      }),
      this.prisma.listing.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, createdAt: true, status: true },
        where: { status: { not: 'DELETED' } },
      }),
      this.prisma.lead.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          investor: { select: { fullName: true } },
          listing: { select: { title: true } },
        },
      }),
    ]);

    const feed = [
      ...users.map((u) => ({ id: u.id, type: 'USER', title: `Novo Usuário: ${u.fullName}`, date: u.createdAt, metadata: { role: u.role } })),
      ...listings.map((l) => ({ id: l.id, type: 'LISTING', title: `Novo Anúncio: ${l.title}`, date: l.createdAt, metadata: { status: l.status } })),
      ...leads.map((l) => ({ id: l.id, type: 'LEAD', title: `Novo Lead em ${l.listing.title}`, date: l.createdAt, metadata: { investor: l.investor.fullName } })),
    ];

    return feed.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);
  }

  private async getModerationQueue() {
    return this.prisma.listing.findMany({
      where: {
        status: { in: ['PENDING_AI_REVIEW', 'FLAGGED'] },
      },
      include: {
        tenant: { select: { name: true } },
        category: { select: { name: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });
  }

  private async getOperationalSummary() {
    const topCategories = await this.prisma.listing.groupBy({
      by: ['categoryId'],
      _count: { _all: true },
      where: { status: 'ACTIVE' },
      orderBy: { _count: { categoryId: 'desc' } },
      take: 5,
    });

    // Mapeia IDs para nomes de categorias
    const categoriesWithNames = await Promise.all(
      topCategories.map(async (c) => {
        const cat = await this.prisma.category.findUnique({ where: { id: c.categoryId }, select: { name: true } });
        return { name: cat?.name || 'Outros', count: c._count._all };
      }),
    );

    return {
      topCategories: categoriesWithNames,
    };
  }
}
