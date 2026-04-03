import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
// REMOVE COMPLETAMENTE essa importação

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async createLead(
    tenantId: string,
    investorId: string,
    listingId: string,
    message: string,
  ) {
    const listing = await this.prisma.listing.findFirst({
      where: {
        id: listingId,
        tenantId,
      },
    });

    if (!listing) {
      throw new NotFoundException('Listing não encontrado');
    }

    return this.prisma.lead.create({
      data: {
        tenantId,
        listingId,
        investorId,
        message: message ?? '',
        score: 0,
      },
      include: {
        listing: true,
        investor: true,
      },
    });
  }

  async getLeadsForTenant(tenantId: string) {
    return this.prisma.lead.findMany({
      where: { tenantId },
      include: {
        listing: { select: { id: true, title: true } },
        investor: { select: { id: true, fullName: true, email: true } },
        proposals: true,
      },
      orderBy: [{ score: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async getMyLeads(investorId: string) {
    return this.prisma.lead.findMany({
      where: { investorId },
      include: {
        listing: { select: { id: true, title: true } },
        proposals: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createProposal(
    leadId: string,
    investorId: string,
    valueOffered: number,
    conditions?: string,
  ) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: { listing: true, investor: true },
    });

    if (!lead) {
      throw new NotFoundException('Lead não encontrado');
    }

    if (lead.investorId !== investorId) {
      throw new ForbiddenException('Acesso não autorizado');
    }

    return this.prisma.proposal.create({
      data: {
        lead: {
          connect: { id: leadId },
        },
        investor: {
          connect: { id: investorId },
        },
        valueOffered,
        conditions: conditions ?? null,
      },
      include: {
        lead: {
          include: {
            listing: true,
            investor: true,
          },
        },
        investor: true,
      },
    });
  }

  async updateProposalStatus(
    proposalId: string,
    tenantId: string,
    status: string,
  ) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
      include: { lead: true },
    });

    if (!proposal) {
      throw new NotFoundException('Proposta não encontrada');
    }

    if (proposal.lead.tenantId !== tenantId) {
      throw new ForbiddenException('Acesso não autorizado');
    }

    return this.prisma.proposal.update({
      where: { id: proposalId },
      data: { status },
      include: {
        lead: {
          include: {
            listing: true,
            investor: true,
          },
        },
        investor: true,
      },
    });
  }
}
