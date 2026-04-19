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

  async getSummary(tenantId: string, days: number = 30) {
    const now = new Date();
    const currentPeriodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const previousPeriodStart = new Date(now.getTime() - 2 * days * 24 * 60 * 60 * 1000);

    const [
      totalListings,
      currentLeads,
      previousLeads,
      currentViews,
      previousViews,
      potentialVolume,
      intentDistribution,
      trends
    ] = await Promise.all([
      this.prisma.listing.count({ where: { tenantId, status: 'ACTIVE' } }),
      this.prisma.lead.count({ where: { tenantId, createdAt: { gte: currentPeriodStart } } }),
      this.prisma.lead.count({ where: { tenantId, createdAt: { gte: previousPeriodStart, lt: currentPeriodStart } } }),
      this.prisma.metric.aggregate({
        where: { tenantId, type: 'VIEW', createdAt: { gte: currentPeriodStart } },
        _sum: { value: true },
      }),
      this.prisma.metric.aggregate({
        where: { tenantId, type: 'VIEW', createdAt: { gte: previousPeriodStart, lt: currentPeriodStart } },
        _sum: { value: true },
      }),
      this.getPotentialVolume(tenantId, currentPeriodStart),
      this.getLeadIntentDistribution(tenantId, currentPeriodStart),
      this.getTrends(tenantId, days),
    ]);

    const currentViewsVal = currentViews._sum.value || 0;
    const previousViewsVal = previousViews._sum.value || 0;
    const currentConv = currentViewsVal > 0 ? (currentLeads / currentViewsVal) * 100 : 0;
    const previousConv = previousViewsVal > 0 ? (previousLeads / previousViewsVal) * 100 : 0;

    return {
      kpis: {
        activeDeals: totalListings,
        totalLeads: currentLeads,
        leadsVariation: this.calculateVariation(currentLeads, previousLeads),
        monthlyViews: currentViewsVal,
        viewsVariation: this.calculateVariation(currentViewsVal, previousViewsVal),
        conversionRate: currentConv.toFixed(2) + '%',
        conversionVariation: (currentConv - previousConv).toFixed(2) + '%',
        potentialVolume: potentialVolume,
      },
      intentDistribution,
      trends,
    };
  }

  private calculateVariation(current: number, previous: number) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  private async getPotentialVolume(tenantId: string, since: Date) {
    const listingsWithLeads = await this.prisma.listing.findMany({
      where: {
        tenantId,
        leads: { some: { createdAt: { gte: since } } },
      },
      select: { price: true },
    });

    return listingsWithLeads.reduce((acc, l) => acc + Number(l.price || 0), 0);
  }

  private async getLeadIntentDistribution(tenantId: string, since: Date) {
    const counts = await this.prisma.lead.groupBy({
      by: ['intentLevel'],
      where: { tenantId, createdAt: { gte: since } },
      _count: { _all: true },
    });

    return counts.map(c => ({
      level: c.intentLevel || 'UNDEFINED',
      count: c._count._all,
    }));
  }

  private async getTrends(tenantId: string, days: number) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const [metrics, leads] = await Promise.all([
      this.prisma.metric.findMany({
        where: { tenantId, type: 'VIEW', createdAt: { gte: startDate } },
        select: { createdAt: true, value: true },
      }),
      this.prisma.lead.findMany({
        where: { tenantId, createdAt: { gte: startDate } },
        select: { createdAt: true },
      }),
    ]);

    const dates = Array.from({ length: days }, (_, i) => {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      return d.toISOString().split('T')[0];
    });

    const viewsByDay = new Map<string, number>();
    const leadsByDay = new Map<string, number>();
    dates.forEach((d) => { viewsByDay.set(d, 0); leadsByDay.set(d, 0); });

    metrics.forEach((m) => {
      const day = m.createdAt.toISOString().split('T')[0];
      if (viewsByDay.has(day)) {
        viewsByDay.set(day, (viewsByDay.get(day) ?? 0) + m.value);
      }
    });

    leads.forEach((l) => {
      const day = l.createdAt.toISOString().split('T')[0];
      if (leadsByDay.has(day)) {
        leadsByDay.set(day, (leadsByDay.get(day) ?? 0) + 1);
      }
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
