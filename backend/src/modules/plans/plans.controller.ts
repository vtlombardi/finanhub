import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PlansService } from './plans.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  /** Lista pública de planos disponíveis */
  @Get()
  async getPublicPlans() {
    return this.plansService.getPublicPlans();
  }

  /** Assinatura ativa do tenant */
  @UseGuards(JwtAuthGuard)
  @Get('subscription')
  async getSubscription(@Request() req: any) {
    return this.plansService.getActiveSubscription(req.user.tenantId);
  }

  /** Consumo atual vs. limites */
  @UseGuards(JwtAuthGuard)
  @Get('usage')
  async getUsage(@Request() req: any) {
    return this.plansService.getUsage(req.user.tenantId);
  }

  /** Assinar um plano */
  @UseGuards(JwtAuthGuard)
  @Post('subscribe')
  async subscribe(@Request() req: any, @Body() body: { planId: string; billingCycle?: string }) {
    return this.plansService.subscribe(req.user.tenantId, body.planId, body.billingCycle);
  }

  /** Cancelar assinatura */
  @UseGuards(JwtAuthGuard)
  @Post('cancel')
  async cancel(@Request() req: any, @Body() body: { reason?: string }) {
    return this.plansService.cancelSubscription(req.user.tenantId, body.reason);
  }

  /** Toggle destaque em um listing */
  @UseGuards(JwtAuthGuard)
  @Post('feature/:listingId')
  async toggleFeatured(@Param('listingId') listingId: string, @Request() req: any) {
    return this.plansService.toggleFeatured(listingId, req.user.tenantId);
  }

  /** Seed de planos padrão (admin/setup) */
  @Post('seed')
  async seed() {
    return this.plansService.seedDefaultPlans();
  }
}
