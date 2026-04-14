import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { LeadStatus as PrismaLeadStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AdminLeadQueryDto, LeadStatus, UpdateLeadNotesDto, UpdateLeadStatusDto } from './dto/admin-lead.dto';
import { CreateLeadDto } from './dto/create-lead.dto';

const ALLOWED_PROPOSAL_STATUS = ['OPEN', 'ACCEPTED', 'REJECTED', 'COUNTER_OFFER', 'WITHDRAWN'] as const;
type AllowedProposalStatus = (typeof ALLOWED_PROPOSAL_STATUS)[number];

// Pipeline de status válidos para transições
const VALID_PIPELINE_STATUSES = Object.values(LeadStatus);

@Injectable()
export class LeadsService {
  private leadQueue: Queue;

  constructor(
    private readonly prisma: PrismaService,
  ) {
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

    const lead = await (this.prisma.lead as any).create({
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
        status: PrismaLeadStatus.NEW,  // Pipeline sempre inicia em NEW
      },
      include: {
        listing: true,
        investor: true,
      },
    });

    // Enfileira qualificação AI de forma assíncrona (melhor esforço)
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
        listing: {
          include: {
            category: true,
          },
        },
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

    return (this.prisma.proposal as any).create({
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

    return (this.prisma.proposal as any).update({
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

  async adminFindAll(query: AdminLeadQueryDto) {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      tenantId,
      companyId,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (tenantId) {
      where.tenantId = tenantId;
    }

    if (companyId) {
      where.tenant = { companyId };
    }

    if (search) {
      where.OR = [
        { userName: { contains: search, mode: 'insensitive' } },
        { userEmail: { contains: search, mode: 'insensitive' } },
        { userPhone: { contains: search, mode: 'insensitive' } },
        { listing: { title: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const [data, total] = await Promise.all([
      (this.prisma.lead as any).findMany({
        where,
        include: {
          listing: {
            include: {
              category: true,
              tenant: true,
            },
          },
          investor: true,
          proposals: true,
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      (this.prisma.lead as any).count({ where }),
    ]);

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  /**
   * Atualiza o status operacional de um lead no pipeline.
   * Valida que o status pertence ao enum LeadStatus definido.
   */
  async adminUpdateStatus(id: string, dto: UpdateLeadStatusDto) {
    if (!VALID_PIPELINE_STATUSES.includes(dto.status as LeadStatus)) {
      throw new BadRequestException(
        `Status inválido: '${dto.status}'. Use um dos valores: ${VALID_PIPELINE_STATUSES.join(', ')}`,
      );
    }

    const lead = await (this.prisma.lead as any).findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead não encontrado');

    return (this.prisma.lead as any).update({
      where: { id },
      data: { status: dto.status as PrismaLeadStatus },
    });
  }

  /**
   * Atualiza notas internas de mediação (acesso restrito a ADMIN).
   * As notas são estritamente privadas e nunca expostas a investidores ou anunciantes.
   */
  async adminUpdateNotes(id: string, dto: UpdateLeadNotesDto) {
    const lead = await (this.prisma.lead as any).findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead não encontrado');

    return (this.prisma.lead as any).update({
      where: { id },
      data: { internalNotes: dto.notes },
    });
  }
}
