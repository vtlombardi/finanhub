import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Post()
  create(@Body() createDto: CreateUserDto, @Request() req: any) {
    const tenantId = req.user?.tenantId; // Proteção multi-tenant via Request
    return this.service.create(createDto, tenantId);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.service.findAll(req.user?.tenantId);
  }
}
