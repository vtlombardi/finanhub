import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Queue } from 'bullmq';

@Injectable()
export class LeadsService {
  private aiQueue: Queue;

  constructor(private prisma: PrismaService) {
    this.aiQueue = new Queue('ai-lead-qualification', {
      connection: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    });
  }

  /**
   * Investidor demonstra interesse em um listing.
   * Cria um Lead e dispara qualificação assíncrona via IA.
   */
  async createLead(listingId: string, investorId: string, message: string, tenantId: string) {
    const listing = await this.prisma.listing.findFirst({
      where: { id: listingId, status: 'ACTIVE' },
    });

    if (!listing) {
      throw new NotFoundException('Anúncio não encontrado ou indisponível.');
    }

    const newLead = await this.prisma.lead.create({
      data: {
        listingId,
        investorId,
        tenantId: listing.tenantId,
        message,
      },
      include: {
        listing: { select: { title: true, slug: true } },
      },
    });

    // Dispatch para qualificação assíncrona via IA
    try {
      await this.aiQueue.add('qualify-lead-job', {
        leadId: newLead.id,
        tenantId: listing.tenantId,
      }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      });
      console.log(`[Queue] Lead ${newLead.id} despachado para qualificação IA.`);
    } catch (e) {
      console.error('[Queue Error] Falha ao despachar lead para IA:', e);
    }

    return newLead;
  }

  /**
   * Investidor vê seus próprios leads.
   */
  async getMyLeads(investorId: string) {
    return this.prisma.lead.findMany({
      where: { investorId },
      include: {
        listing: {
          select: { id: true, title: true, slug: true, price: true, status: true },
        },
        proposals: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Vendedor vê todos os leads recebidos com dados de qualificação IA.
   */
  async getLeadsForTenant(tenantId: string) {
    return this.prisma.lead.findMany({
      where: { tenantId },
      include: {
        listing: { select: { id: true, title: true, slug: true } },
        investor: { select: { id: true, fullName: true, email: true } },
        proposals: true,
      },
      orderBy: [
        { score: { sort: 'desc', nulls: 'last' } },
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Enviar proposta formal atrelada a um Lead existente.
   */
  async createProposal(leadId: string, investorId: string, valueOffered: number, conditions?: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new NotFoundException('Lead não encontrado.');
    }

    if (lead.investorId !== investorId) {
      throw new ForbiddenException('Você não é o autor deste Lead.');
    }

    return this.prisma.proposal.create({
      data: {
        leadId,
        investorId,
        valueOffered,
        conditions,
        status: 'OPEN',
      },
    });
  }

  /**
   * Vendedor atualiza status da proposta (aceitar, rejeitar, contra-oferta).
   */
  async updateProposalStatus(proposalId: string, tenantId: string, status: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
      include: { lead: true },
    });

    if (!proposal) {
      throw new NotFoundException('Proposta não encontrada.');
    }

    if (proposal.lead.tenantId !== tenantId) {
      throw new ForbiddenException('Ação não autorizada para este Tenant.');
    }

    return this.prisma.proposal.update({
      where: { id: proposalId },
      data: { status },
    });
  }
}
