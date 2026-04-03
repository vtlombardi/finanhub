import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * Métricas agregadas do Tenant (Empresa Vendedora).
   * Retorna KPIs fundamentais para o painel B2B.
   */
  async getMetrics(tenantId: string) {
    const [
      totalListings,
      activeListings,
      pendingListings,
      flaggedListings,
      totalLeads,
      totalProposals,
      proposalVolume,
    ] = await Promise.all([
      this.prisma.listing.count({ where: { tenantId } }),
      this.prisma.listing.count({ where: { tenantId, status: 'ACTIVE' } }),
      this.prisma.listing.count({ where: { tenantId, status: 'PENDING_AI_REVIEW' } }),
      this.prisma.listing.count({ where: { tenantId, status: 'FLAGGED' } }),
      this.prisma.lead.count({ where: { tenantId } }),
      this.prisma.proposal.count({
        where: { lead: { tenantId } },
      }),
      this.prisma.proposal.aggregate({
        where: { lead: { tenantId } },
        _sum: { valueOffered: true },
      }),
    ]);

    return {
      listings: {
        total: totalListings,
        active: activeListings,
        pending: pendingListings,
        flagged: flaggedListings,
      },
      leads: {
        total: totalLeads,
      },
      proposals: {
        total: totalProposals,
        volumeTotal: proposalVolume._sum.valueOffered || 0,
      },
    };
  }

  /**
   * Leads recentes (últimos 10) para feed do dashboard.
   */
  async getRecentLeads(tenantId: string) {
    return this.prisma.lead.findMany({
      where: { tenantId },
      include: {
        investor: { select: { fullName: true, email: true } },
        listing: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }
}
