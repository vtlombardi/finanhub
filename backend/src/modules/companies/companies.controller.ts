import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateCompanyDto } from './dto/create-companies.dto';

@UseGuards(JwtAuthGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  async getMyCompanies(@Request() req) {
    return this.companiesService.findCompaniesByUserAndTenant(req.user.tenantId, req.user.userId);
  }

  @Post()
  async createCompany(@Request() req, @Body() data: CreateCompanyDto) {
    return this.companiesService.createCompany({ ...data, tenantId: req.user.tenantId }, req.user.userId);
  }
}
