import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { PrismaService } from '../../common/prisma/prisma.service';

const ALLOWED_PROPOSAL_STATUS = ['OPEN', 'ACCEPTED', 'REJECTED', 'COUNTER_OFFER', 'WITHDRAWN'] as const;
type AllowedProposalStatus = (typeof ALLOWED_PROPOSAL_STATUS)[number];

@Injectable()
export class LeadsService {
  private leadQueue: Queue;

  constructor(private readonly prisma: PrismaService) {
    this.leadQueue = new Queue('ai-lead-qualification', {
      connection: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        maxRetriesPerRequest: null,
      },
    });

    // Silencia erros de conexão se o Redis não estiver rodando localmente
    this.leadQueue.on('error', () => {});
  }

  async createLead(
    investorId: string,
    data: CreateLeadDto,
  ) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: data.listingId },
    });

    if (!listing || listing.status !== 'ACTIVE') {
      throw new NotFoundException('Listing não encontrado ou indisponível');
    }

    const lead = await this.prisma.lead.create({
      data: {
        tenantId: listing.tenantId,
        listingId: data.listingId,
        investorId,
        message: data.message ?? '',
        userName: data.userName,
        userEmail: data.userEmail,
        userPhone: data.userPhone,
        userCompany: data.userCompany,
        objective: data.objective,
        investmentRange: data.investmentRange,
        mediationAccepted: data.mediationAccepted,
        score: 0,
      },
      include: {
        listing: true,
        investor: true,
      },
    });

    // Enfileira qualificação AI de forma assíncrona — falha silenciosa para não bloquear o usuário
    try {
      await this.leadQueue.add(
        'qualify-lead-job',
        { leadId: lead.id, tenantId: lead.tenantId },
        { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
      );
    } catch (e) {
      console.error('[LeadsService] Falha ao enfileirar qualificação AI:', e);
    }

    return lead;
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
    const normalizedStatus = status.toUpperCase() as AllowedProposalStatus;

    if (!ALLOWED_PROPOSAL_STATUS.includes(normalizedStatus)) {
      throw new ForbiddenException('Status de proposta inválido');
    }

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
      data: { status: normalizedStatus as any },
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
