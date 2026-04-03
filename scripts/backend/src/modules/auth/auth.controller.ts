import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post()
  create(@Body() createDto: CreateAuthDto, @Request() req: any) {
    const tenantId = req.user?.tenantId; // Proteção multi-tenant via Request
    return this.service.create(createDto, tenantId);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.service.findAll(req.user?.tenantId);
  }
}
