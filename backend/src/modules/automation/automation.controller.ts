import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AutomationService, Recommendation } from './automation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('automation')
@UseGuards(JwtAuthGuard)
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  @Get('recommendations')
  async getRecommendations(@Request() req): Promise<Recommendation[]> {
    return this.automationService.getRecommendedActions(req.user.id);
  }
}
