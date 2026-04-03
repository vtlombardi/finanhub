import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  async getMyCompanies(@Request() req) {
    // Lista as companias que o User pertence como 'CompanyMember'
    return this.companiesService.findCompaniesByUserAndTenant(req.user.tenantId, req.user.userId);
  }

  @Post()
  async createCompany(@Request() req, @Body() data: any) {
    // Cria companiola nova atrelada ao tenant, e autovincula o User como OWNER.
    return this.companiesService.createCompany({ ...data, tenantId: req.user.tenantId }, req.user.userId);
  }
}
