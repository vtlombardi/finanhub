import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req) {
    // Busca apenas usuários do mesmo tenant do logado
    return this.usersService.findAllByTenant(req.user.tenantId);
  }

  // Permite criar usuários vinculados diretamente à hierarquia Tenant
  @Post()
  async createUser(@Body() body: any) {
    return this.usersService.createUser(body);
  }
}
