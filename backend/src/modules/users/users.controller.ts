import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-users.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req) {
    return this.usersService.findAllByTenant(req.user.tenantId);
  }

  @Post()
  async createUser(@Body() body: CreateUserDto) {
    return this.usersService.createUser(body);
  }
}
