import { Controller, Get, Query } from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';

@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly service: OpportunitiesService) {}

  @Get()
  async findAll(@Query() query: Record<string, unknown>) {
    return this.service.findAll(query);
  }
}