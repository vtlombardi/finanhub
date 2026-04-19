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
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationEvents } from '../notifications/notifications.events';
import { MatchingService } from '../matching/matching.service';

const ALLOWED_PROPOSAL_STATUS = ['OPEN', 'ACCEPTED', 'REJECTED', 'COUNTER_OFFER', 'WITHDRAWN'] as const;
type AllowedProposalStatus = (typeof ALLOWED_PROPOSAL_STATUS)[number];

// Pipeline de status válidos para transições
const VALID_PIPELINE_STATUSES = Object.values(LeadStatus);

@Injectable()
export class LeadsService {
  private leadQueue: Queue;

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly matchingService: MatchingService,
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

    // Construir mensagem enriquecida com dados do formulário caso existam
    let enrichedMessage = data.message || '';
    const extraInfo = [];
    if (data.userName) extraInfo.push(`Nome: ${data.userName}`);
    if (data.userEmail) extraInfo.push(`E-mail: ${data.userEmail}`);
    if (data.userPhone) extraInfo.push(`Tel: ${data.userPhone}`);
    if (data.userCompany) extraInfo.push(`Empresa: ${data.userCompany}`);
    if (data.objective) extraInfo.push(`Objetivo: ${data.objective}`);
    if (data.investmentRange) extraInfo.push(`Faixa: ${data.investmentRange}`);

    if (extraInfo.length > 0) {
      enrichedMessage = `--- INFO DO INVESTIDOR ---\n${extraInfo.join('\n')}\n\n--- MENSAGEM ---\n${enrichedMessage}`;
    }

    const lead = await (this.prisma.lead as any).create({
      data: {
        tenantId: listing.tenantId,
        listingId: data.listingId,
        investorId,
        message: enrichedMessage,
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

    // Emitir evento para notificações inteligentes
    this.eventEmitter.emit(NotificationEvents.LEAD_CREATED, { leadId: lead.id });

    return lead;
  }

  async getLeadsForTenant(tenantId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where = { tenantId };

    const [data, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        include: {
          listing: { 
            select: { 
              id: true, 
              title: true,
              dataRoomRequests: true 
            } 
          },
          investor: { select: { id: true, fullName: true, email: true } },
          proposals: true,
        },
        orderBy: [{ score: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.lead.count({ where }),
    ]);

    const enrichedLeads = await Promise.all(
      data.map(async (lead) => {
        const match = await this.matchingService.calculateMatchScore(lead.investorId, lead.listingId);
        return { ...lead, match };
      })
    );

    return {
      data: enrichedLeads,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getMyLeads(investorId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where = { investorId };

    const [data, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        include: {
          listing: {
            include: {
              category: true,
            },
          },
          proposals: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.lead.count({ where }),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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

    const proposal = await (this.prisma.proposal as any).create({
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

    // Emitir evento para notificações inteligentes
    this.eventEmitter.emit(NotificationEvents.PROPOSAL_RECEIVED, { proposalId: proposal.id });

    return proposal;
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
   * Atualiza o status do lead para o tenant (vendedor).
   * Inclui validação de propriedade e registro de auditoria.
   */
  async updateLeadStatus(id: string, tenantId: string, userId: string, dto: UpdateLeadStatusDto) {
    if (!VALID_PIPELINE_STATUSES.includes(dto.status as LeadStatus)) {
      throw new BadRequestException(`Status inválido: ${dto.status}`);
    }

    const lead = await (this.prisma.lead as any).findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead não encontrado');
    if (lead.tenantId !== tenantId) throw new ForbiddenException('Acesso não autorizado ao lead');

    const previousStatus = lead.status;

    const updatedLead = await (this.prisma.lead as any).update({
      where: { id },
      data: { status: dto.status as PrismaLeadStatus },
    });

    // Registrar no log de auditoria para histórico (Pode ser estendido para LeadActivity se necessário)
    try {
      await (this.prisma.auditLog as any).create({
        data: {
          tenantId,
          userId,
          action: 'LEAD_STATUS_CHANGE',
          entityType: 'LEAD',
          entityId: id,
          metadata: {
            previousStatus,
            newStatus: dto.status,
            source: 'TENANT_DASHBOARD'
          }
        }
      });
    } catch (e) {
      console.error('[LeadsService] Erro ao gravar audit log:', e);
    }

    return updatedLead;
  }

  /**
   * Atualiza as notas internas do lead para o tenant.
   */
  async updateLeadNotes(id: string, tenantId: string, userId: string, dto: UpdateLeadNotesDto) {
    const lead = await (this.prisma.lead as any).findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead não encontrado');
    if (lead.tenantId !== tenantId) throw new ForbiddenException('Acesso não autorizado ao lead');

    return (this.prisma.lead as any).update({
      where: { id },
      data: { internalNotes: dto.notes },
    });
  }

  /**
   * Atualiza o status operacional de um lead no pipeline (Admin).
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
