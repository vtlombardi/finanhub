import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, UseGuards, Request,
} from '@nestjs/common';
import { DataRoomService } from './dataroom.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  RequestDataRoomAccessDto,
  UpdateDataRoomRequestDto,
  CreateDataRoomDocumentDto,
} from './dto/dataroom.dto';

@Controller('dataroom')
@UseGuards(JwtAuthGuard)
export class DataRoomController {
  constructor(private readonly dataRoomService: DataRoomService) {}

  // ── Investor endpoints ─────────────────────────────────────────────────────

  /** Request access to a listing's data room */
  @Post('request')
  async requestAccess(@Request() req: any, @Body() dto: RequestDataRoomAccessDto) {
    return this.dataRoomService.requestAccess(req.user.userId, dto);
  }

  /** Check own request status for a listing */
  @Get('request')
  async getMyRequest(@Request() req: any, @Query('listingId') listingId: string) {
    return this.dataRoomService.getMyRequest(req.user.userId, listingId);
  }

  /** Get documents — only if approved */
  @Get(':listingId/documents')
  async getDocumentsForInvestor(
    @Param('listingId') listingId: string,
    @Request() req: any,
  ) {
    return this.dataRoomService.getDocumentsForInvestor(req.user.userId, listingId);
  }

  /** Accept NDA for a listing */
  @Post('accept-nda')
  async acceptNda(@Request() req: any, @Body('listingId') listingId: string) {
    return this.dataRoomService.acceptNda(req.user.userId, listingId);
  }

  /** Log a document view */
  @Post(':documentId/view')
  async logView(@Param('documentId') documentId: string, @Request() req: any) {
    return this.dataRoomService.logDocumentView(req.user.userId, documentId);
  }

  // ── Seller endpoints ───────────────────────────────────────────────────────

  /** All incoming requests for the tenant */
  @Get('requests')
  async getRequests(@Request() req: any) {
    return this.dataRoomService.getRequestsForTenant(req.user.tenantId);
  }

  /** Direct grant access (proactive release) */
  @Post('seller/grant-access')
  async grantAccess(
    @Request() req: any,
    @Body('listingId') listingId: string,
    @Body('investorId') investorId: string,
  ) {
    return this.dataRoomService.grantDirectAccess(req.user.tenantId, listingId, investorId);
  }

  /** Get tracking logs for a listing */
  @Get('seller/:listingId/tracking')
  async getTracking(
    @Param('listingId') listingId: string,
    @Request() req: any,
  ) {
    return this.dataRoomService.getTrackingLogs(listingId, req.user.tenantId);
  }

  /** Approve or reject a request */
  @Patch('requests/:id')
  async updateRequest(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: UpdateDataRoomRequestDto,
  ) {
    return this.dataRoomService.updateRequestStatus(id, req.user.tenantId, dto);
  }

  /** List documents for a listing (seller view) */
  @Get('seller/:listingId/documents')
  async getDocumentsForSeller(
    @Param('listingId') listingId: string,
    @Request() req: any,
  ) {
    return this.dataRoomService.getDocumentsForSeller(listingId, req.user.tenantId);
  }

  /** Add a document to a listing's data room */
  @Post('seller/:listingId/documents')
  async addDocument(
    @Param('listingId') listingId: string,
    @Request() req: any,
    @Body() dto: CreateDataRoomDocumentDto,
  ) {
    return this.dataRoomService.addDocument(listingId, req.user.tenantId, dto);
  }

  /** Remove a document */
  @Delete('documents/:id')
  async removeDocument(@Param('id') id: string, @Request() req: any) {
    return this.dataRoomService.removeDocument(id, req.user.tenantId);
  }
}
