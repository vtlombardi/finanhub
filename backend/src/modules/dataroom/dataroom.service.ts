import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationEvents } from '../notifications/notifications.events';
import {
  RequestDataRoomAccessDto,
  UpdateDataRoomRequestDto,
  CreateDataRoomDocumentDto,
} from './dto/dataroom.dto';
import { DocCategory } from '@prisma/client';

@Injectable()
export class DataRoomService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly eventEmitter: EventEmitter2,
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

    // Notify tenant managers
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

    // Emitir evento para notificações inteligentes HAYIA
    this.eventEmitter.emit(NotificationEvents.DATAROOM_REQUESTED, { requestId: request.id });

    return request;
  }

  /** Investor accepts the NDA for a specific listing. */
  async acceptNda(investorId: string, listingId: string) {
    const request = await this.prisma.dataRoomRequest.findUnique({
      where: { listingId_investorId: { listingId, investorId } },
    });

    if (!request) {
      throw new NotFoundException('Solicitação de acesso não encontrada.');
    }

    return this.prisma.dataRoomRequest.update({
      where: { id: request.id },
      data: { acceptedNdaAt: new Date() },
    });
  }

  /** Logs that an investor opened a document. */
  async logDocumentView(investorId: string, documentId: string) {
    const doc = await this.prisma.dataRoomDocument.findUnique({
      where: { id: documentId },
    });

    if (!doc) throw new NotFoundException('Documento não encontrado.');

    // Verify access
    const request = await this.prisma.dataRoomRequest.findUnique({
      where: { listingId_investorId: { listingId: doc.listingId, investorId } },
    });

    if (!request || request.status !== 'APPROVED') {
      throw new ForbiddenException('Acesso não autorizado.');
    }

    const log = await this.prisma.dataRoomViewLog.create({
      data: {
        documentId,
        investorId,
      },
    });

    // Emitir evento para notificações inteligentes HAYIA
    this.eventEmitter.emit(NotificationEvents.DATAROOM_VIEWED, { investorId, documentId });

    return log;
  }

  /** Investor checks their own request status for a listing. */
  async getMyRequest(investorId: string, listingId: string) {
    return this.prisma.dataRoomRequest.findUnique({
      where: { listingId_investorId: { listingId, investorId } },
    });
  }

  /** Returns documents for an investor — only if APPROVED and NDA accepted. */
  async getDocumentsForInvestor(investorId: string, listingId: string) {
    const request = await this.prisma.dataRoomRequest.findUnique({
      where: { listingId_investorId: { listingId, investorId } },
    });

    if (!request || request.status !== 'APPROVED') {
      throw new ForbiddenException('Acesso ao Data Room não autorizado.');
    }

    if (!request.acceptedNdaAt) {
      throw new ForbiddenException('Aceite do NDA obrigatório para visualizar documentos.');
    }

    const docs = await this.prisma.dataRoomDocument.findMany({
      where: { listingId },
      orderBy: { createdAt: 'asc' },
    });

    return docs;
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

  /** Direct grant access for a lead (Seller proactively releasing). */
  async grantDirectAccess(tenantId: string, listingId: string, investorId: string) {
    const listing = await this.prisma.listing.findFirst({
      where: { id: listingId, tenantId },
    });
    if (!listing) throw new NotFoundException('Listing não encontrado.');

    return this.prisma.dataRoomRequest.upsert({
      where: { listingId_investorId: { listingId, investorId } },
      update: { status: 'APPROVED' },
      create: {
        tenantId,
        listingId,
        investorId,
        status: 'APPROVED',
      },
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

    const category = this.mapCategory(dto.category);

    return this.prisma.dataRoomDocument.create({
      data: {
        tenantId,
        listingId,
        name: dto.name,
        url: dto.url,
        category,
        mediaType: dto.mediaType ?? 'document',
      },
    });
  }

  /** Returns tracking logs for a listing. */
  async getTrackingLogs(listingId: string, tenantId: string) {
    const listing = await this.prisma.listing.findFirst({
      where: { id: listingId, tenantId },
    });
    if (!listing) throw new ForbiddenException('Acesso negado.');

    return this.prisma.dataRoomViewLog.findMany({
      where: { document: { listingId } },
      include: {
        investor: { select: { fullName: true, email: true } },
        document: { select: { name: true, category: true } },
      },
      orderBy: { viewedAt: 'desc' },
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

  private mapCategory(cat?: string): DocCategory {
    if (!cat) return DocCategory.OUTROS;
    const normalized = cat.toUpperCase();
    if (Object.values(DocCategory).includes(normalized as any)) {
      return normalized as DocCategory;
    }
    return DocCategory.OUTROS;
  }
}
