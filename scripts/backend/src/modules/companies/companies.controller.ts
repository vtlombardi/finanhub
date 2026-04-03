import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';

@Controller('api/v1/companies')
export class CompaniesController {
  constructor(private readonly service: CompaniesService) {}

  @Post()
  create(@Body() createDto: CreateCompanyDto, @Request() req: any) {
    const tenantId = req.user?.tenantId; // Proteção multi-tenant via Request
    return this.service.create(createDto, tenantId);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.service.findAll(req.user?.tenantId);
  }
}
