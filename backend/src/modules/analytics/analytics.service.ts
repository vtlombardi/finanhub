import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async trackEvent(tenantId: string, type: string, listingId?: string) {
    return this.prisma.metric.create({
      data: {
        tenantId,
        type,
        listingId: listingId ?? null,
        value: 1,
      },
    });
  }

  async getSummary(tenantId: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalListings,
      totalLeads,
      totalProposals,
      viewsLast30Days,
      conversionRate,
    ] = await Promise.all([
      this.prisma.listing.count({ where: { tenantId, status: 'ACTIVE' } }),
      this.prisma.lead.count({ where: { tenantId } }),
      this.prisma.proposal.count({
        where: {
          lead: {
            tenantId,
          },
        },
      }),
      this.prisma.metric.aggregate({
        where: { tenantId, type: 'VIEW', createdAt: { gte: thirtyDaysAgo } },
        _sum: { value: true },
      }),
      this.calculateConversion(tenantId),
    ]);

    return {
      kpis: {
        activeDeals: totalListings,
        totalLeads,
        totalProposals,
        monthlyViews: viewsLast30Days._sum.value || 0,
        conversionRate: conversionRate.toFixed(2) + '%',
      },
      trends: await this.getTrends(tenantId),
    };
  }

  private async calculateConversion(tenantId: string) {
    const [views, leads] = await Promise.all([
      this.prisma.metric.count({ where: { tenantId, type: 'VIEW' } }),
      this.prisma.lead.count({ where: { tenantId } }),
    ]);

    if (views === 0) return 0;
    return (leads / views) * 100;
  }

  private async getTrends(tenantId: string) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [metrics, leads] = await Promise.all([
      this.prisma.metric.findMany({
        where: { tenantId, type: 'VIEW', createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true, value: true },
      }),
      this.prisma.lead.findMany({
        where: { tenantId, createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true },
      }),
    ]);

    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const viewsByDay = new Map<string, number>();
    const leadsByDay = new Map<string, number>();
    dates.forEach((d) => { viewsByDay.set(d, 0); leadsByDay.set(d, 0); });

    metrics.forEach((m) => {
      const day = m.createdAt.toISOString().split('T')[0];
      viewsByDay.set(day, (viewsByDay.get(day) ?? 0) + m.value);
    });

    leads.forEach((l) => {
      const day = l.createdAt.toISOString().split('T')[0];
      leadsByDay.set(day, (leadsByDay.get(day) ?? 0) + 1);
    });

    return dates.map((date) => ({
      date,
      views: viewsByDay.get(date) ?? 0,
      leads: leadsByDay.get(date) ?? 0,
    }));
  }

  async exportLeadsToCsv(tenantId: string) {
    const leads = await this.prisma.lead.findMany({
      where: { tenantId },
      include: {
        investor: { select: { fullName: true, email: true } },
        listing: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const header = 'Data,Nome,Email,Deal,Score\n';
    const rows = leads
      .map((l) => {
        const date = l.createdAt.toISOString().split('T')[0];
        const name = l.investor.fullName.replace(/,/g, '');
        const email = l.investor.email;
        const deal = l.listing.title.replace(/,/g, '');
        const score = l.score ?? 'N/A';
        return `${date},${name},${email},${deal},${score}`;
      })
      .join('\n');

    return header + rows;
  }
}
