import { SetMetadata, applyDecorators, UseGuards } from '@nestjs/common';
import { PlanTier } from '@prisma/client';
import { SubscriptionGuard } from '../guards/subscription.guard';

export const CHECK_SUBSCRIPTION_KEY = 'requiredTier';
export const CHECK_FEATURE_KEY = 'requiredFeature';

export function CheckSubscription(tier: PlanTier) {
  return applyDecorators(
    SetMetadata(CHECK_SUBSCRIPTION_KEY, tier),
    UseGuards(SubscriptionGuard),
  );
}

export function CheckFeature(feature: string) {
  return applyDecorators(
    SetMetadata(CHECK_FEATURE_KEY, feature),
    UseGuards(SubscriptionGuard),
  );
}
