import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from './notifications.service';
import { NotificationEvents } from './notifications.events';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class NotificationsHandlerService {
  constructor(
    private readonly notifications: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent(NotificationEvents.LEAD_CREATED)
  async handleLeadCreated(payload: { leadId: string }) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: payload.leadId },
      include: { listing: { select: { ownerId: true, title: true } } },
    });

    if (lead?.listing?.ownerId) {
      await this.notifications.create(
        lead.listing.ownerId,
        NotificationEvents.LEAD_CREATED,
        '',
        '',
        { listingTitle: lead.listing.title, leadId: lead.id }
      );

      // Check for High Score Intelligence
      if (lead.score && lead.score >= 80) {
        await this.notifications.create(
          lead.listing.ownerId,
          NotificationEvents.LEAD_SCORE_HIGH,
          '',
          '',
          { listingTitle: lead.listing.title, score: lead.score, leadId: lead.id }
        );
      }
    }
  }

  @OnEvent(NotificationEvents.DATAROOM_REQUESTED)
  async handleDataRoomRequested(payload: { requestId: string }) {
    const request = await this.prisma.dataRoomRequest.findUnique({
      where: { id: payload.requestId },
      include: { listing: { select: { ownerId: true, title: true } } },
    });

    if (request?.listing?.ownerId) {
      await this.notifications.create(
        request.listing.ownerId,
        NotificationEvents.DATAROOM_REQUESTED,
        '',
        '',
        { listingTitle: request.listing.title, requestId: request.id }
      );
    }
  }

  @OnEvent(NotificationEvents.DATAROOM_VIEWED)
  async handleDataRoomViewed(payload: { investorId: string; documentId: string }) {
    const doc = await this.prisma.dataRoomDocument.findUnique({
      where: { id: payload.documentId },
      include: { listing: { select: { ownerId: true, title: true } } },
    });

    if (doc?.listing?.ownerId) {
      await this.notifications.create(
        doc.listing.ownerId,
        NotificationEvents.DATAROOM_VIEWED,
        '',
        '',
        { listingTitle: doc.listing.title, docName: doc.name, investorId: payload.investorId }
      );
    }
  }

  @OnEvent(NotificationEvents.PROPOSAL_RECEIVED)
  async handleProposalReceived(payload: { proposalId: string }) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: payload.proposalId },
      include: { lead: { include: { listing: true } } },
    });

    if (proposal?.lead?.listing?.ownerId) {
      await this.notifications.create(
        proposal.lead.listing.ownerId,
        NotificationEvents.PROPOSAL_RECEIVED,
        '',
        '',
        { listingTitle: proposal.lead.listing.title, proposalId: proposal.id }
      );
    }
  }
}
