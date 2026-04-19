import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { JwtAuthGuard } from '../../features/auth/guards/jwt-auth.guard';

@Controller('catalog')
@UseGuards(JwtAuthGuard)
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Post('draft')
  createDraft(@Request() req, @Body() data: any) {
    const { tenantId, id: userId } = req.user;
    return this.catalogService.createDraft(tenantId, userId, data);
  }

  @Get()
  findAll(@Request() req) {
    const { tenantId, id: userId } = req.user;
    return this.catalogService.findAll(tenantId, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.catalogService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.catalogService.update(id, data);
  }

  @Post(':id/media')
  saveMedia(@Param('id') id: string, @Body() media: any[]) {
    return this.catalogService.saveMedia(id, media);
  }

  @Post(':id/publish')
  publish(@Param('id') id: string) {
    return this.catalogService.publish(id);
  }
}
