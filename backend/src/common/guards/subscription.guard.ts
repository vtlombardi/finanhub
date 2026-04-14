import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PlansService } from '../../modules/plans/plans.service';
import { PlanTier } from '@prisma/client';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private plansService: PlansService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredTier = this.reflector.get<PlanTier>('requiredTier', context.getHandler());
    const requiredFeature = this.reflector.get<string>('requiredFeature', context.getHandler());

    if (!requiredTier && !requiredFeature) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.tenantId) {
      throw new ForbiddenException('Tenant não identificado.');
    }

    const usage = await this.plansService.getUsage(user.tenantId);

    // 1. Verificar por Tier mínimo
    if (requiredTier) {
      const tiers: PlanTier[] = [
        PlanTier.FREE,
        PlanTier.BASIC,
        PlanTier.BASE,
        PlanTier.ESSENTIAL,
        PlanTier.PROFESSIONAL,
        PlanTier.PREMIUM,
        PlanTier.BUSINESS,
        PlanTier.ELITE,
        PlanTier.ENTERPRISE,
        PlanTier.CORPORATE_ELITE
      ];
      const userTierIndex = tiers.indexOf(usage.plan.tier as PlanTier);
      const requiredTierIndex = tiers.indexOf(requiredTier);

      if (userTierIndex < requiredTierIndex) {
        throw new ForbiddenException({
          message: `Este recurso exige o plano ${requiredTier}.`,
          code: 'UPGRADE_REQUIRED',
          currentTier: usage.plan.tier,
          requiredTier: requiredTier,
        });
      }
    }

    // 2. Verificar por Feature específica
    if (requiredFeature && !usage.features[requiredFeature]) {
      throw new ForbiddenException({
        message: `O recurso '${requiredFeature}' não está disponível no seu plano atual.`,
        code: 'FEATURE_LOCKED',
        feature: requiredFeature,
      });
    }

    return true;
  }
}
