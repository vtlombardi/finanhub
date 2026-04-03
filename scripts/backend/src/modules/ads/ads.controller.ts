import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AdsService } from './ads.service';
import { CreateAdsDto } from './dto/create-ads.dto';

@Controller('api/v1/ads')
export class AdsController {
  constructor(private readonly service: AdsService) {}

  @Post()
  create(@Body() createDto: CreateAdsDto, @Request() req: any) {
    const tenantId = req.user?.tenantId; // Proteção multi-tenant via Request
    return this.service.create(createDto, tenantId);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.service.findAll(req.user?.tenantId);
  }
}
