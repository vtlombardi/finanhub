import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  RequestDataRoomAccessDto,
  UpdateDataRoomRequestDto,
  CreateDataRoomDocumentDto,
} from './dto/dataroom.dto';

@Injectable()
export class DataRoomService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  // ── Investor side ──────────────────────────────────────────────────────────

  /** Investor requests access to a listing's data room. */
  async requestAccess(investorId: string, dto: RequestDataRoomAccessDto) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: dto.listingId },
      select: { id: true, tenantId: true, title: true, status: true },
    });

    if (!listing || listing.status !== 'ACTIVE') {
      throw new NotFoundException('Listing não encontrado ou indisponível.');
    }

    const existing = await this.prisma.dataRoomRequest.findUnique({
      where: { listingId_investorId: { listingId: dto.listingId, investorId } },
    });

    if (existing) {
      // Return existing request — let frontend show current status
      return existing;
    }

    const request = await this.prisma.dataRoomRequest.create({
      data: {
        tenantId: listing.tenantId,
        listingId: dto.listingId,
        investorId,
        message: dto.message ?? null,
      },
    });

    // Notify tenant OWNER/ADMIN about the new request
    const tenantManagers = await this.prisma.user.findMany({
      where: { tenantId: listing.tenantId, role: { in: ['OWNER', 'ADMIN'] } },
      select: { id: true },
    });

    await this.notifications.createMany(
      tenantManagers.map((u) => u.id),
      'NEW_DATA_ROOM_REQUEST',
      'Novo pedido de acesso ao Data Room',
      `Um investidor solicitou acesso aos documentos confidenciais de "${listing.title}".`,
      { listingId: listing.id, requestId: request.id },
    );

    return request;
  }

  /** Investor checks their own request status for a listing. */
  async getMyRequest(investorId: string, listingId: string) {
    return this.prisma.dataRoomRequest.findUnique({
      where: { listingId_investorId: { listingId, investorId } },
    });
  }

  /** Returns documents for an investor — only if their request is APPROVED. */
  async getDocumentsForInvestor(investorId: string, listingId: string) {
    const request = await this.prisma.dataRoomRequest.findUnique({
      where: { listingId_investorId: { listingId, investorId } },
    });

    if (!request || request.status !== 'APPROVED') {
      throw new ForbiddenException('Acesso ao Data Room não autorizado.');
    }

    return this.prisma.dataRoomDocument.findMany({
      where: { listingId },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ── Seller side ────────────────────────────────────────────────────────────

  /** Returns all incoming data room requests for the tenant. */
  async getRequestsForTenant(tenantId: string) {
    return this.prisma.dataRoomRequest.findMany({
      where: { tenantId },
      include: {
        investor: { select: { id: true, fullName: true, email: true } },
        listing: { select: { id: true, title: true, slug: true } },
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });
  }

  /** Seller approves or rejects an access request. */
  async updateRequestStatus(
    requestId: string,
    tenantId: string,
    dto: UpdateDataRoomRequestDto,
  ) {
    const request = await this.prisma.dataRoomRequest.findFirst({
      where: { id: requestId, tenantId },
      include: { listing: { select: { title: true } } },
    });

    if (!request) throw new NotFoundException('Solicitação não encontrada.');

    const updated = await this.prisma.dataRoomRequest.update({
      where: { id: requestId },
      data: { status: dto.status },
    });

    // Notify investor of the decision
    const actionLabel = dto.status === 'APPROVED' ? 'aprovado' : 'rejeitado';
    await this.notifications.create(
      request.investorId,
      'DATA_ROOM_REQUEST_UPDATE',
      `Acesso ao Data Room ${actionLabel}`,
      dto.status === 'APPROVED'
        ? `Seu acesso aos documentos de "${request.listing.title}" foi liberado.`
        : `Seu pedido de acesso ao Data Room de "${request.listing.title}" foi recusado.`,
      { listingId: request.listingId, requestId, status: dto.status },
    );

    return updated;
  }

  /** Returns all data room documents for a listing (seller view). */
  async getDocumentsForSeller(listingId: string, tenantId: string) {
    const listing = await this.prisma.listing.findFirst({
      where: { id: listingId, tenantId },
      select: { id: true },
    });
    if (!listing) throw new NotFoundException('Listing não encontrado ou acesso negado.');

    return this.prisma.dataRoomDocument.findMany({
      where: { listingId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /** Seller adds a document to a listing's data room. */
  async addDocument(listingId: string, tenantId: string, dto: CreateDataRoomDocumentDto) {
    const listing = await this.prisma.listing.findFirst({
      where: { id: listingId, tenantId },
      select: { id: true },
    });
    if (!listing) throw new NotFoundException('Listing não encontrado ou acesso negado.');

    return this.prisma.dataRoomDocument.create({
      data: {
        tenantId,
        listingId,
        name: dto.name,
        url: dto.url,
        mediaType: dto.mediaType ?? 'document',
      },
    });
  }

  /** Seller removes a document. */
  async removeDocument(documentId: string, tenantId: string) {
    const doc = await this.prisma.dataRoomDocument.findFirst({
      where: { id: documentId, tenantId },
    });
    if (!doc) throw new NotFoundException('Documento não encontrado ou acesso negado.');

    await this.prisma.dataRoomDocument.delete({ where: { id: documentId } });
    return { deleted: true };
  }
}
