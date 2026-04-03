import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Controller('api/v1/tenants')
export class TenantsController {
  constructor(private readonly service: TenantsService) {}

  @Post()
  create(@Body() createDto: CreateTenantDto, @Request() req: any) {
    const tenantId = req.user?.tenantId; // Proteção multi-tenant via Request
    return this.service.create(createDto, tenantId);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.service.findAll(req.user?.tenantId);
  }
}
