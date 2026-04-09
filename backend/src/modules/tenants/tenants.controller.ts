import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { UsersService } from '../users/users.service';
import { CreateTenantDto, UpdateTenantDto } from './dto/create-tenants.dto';
import { InviteMemberDto, UpdateUserDto } from '../users/dto/create-users.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('tenants')
export class TenantsController {
  constructor(
    private readonly tenantsService: TenantsService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Lista todos os tenants — restrito a ADMIN da plataforma.
   */
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.tenantsService.findAll();
  }

  /**
   * Cria um novo tenant — restrito a ADMIN da plataforma.
   */
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateTenantDto) {
    return this.tenantsService.create(dto);
  }

  /**
   * Retorna o próprio tenant do usuário autenticado.
   */
  @Get('me')
  getMyTenant(@Request() req) {
    return this.tenantsService.findById(req.user.tenantId);
  }

  /**
   * Busca tenant por slug — público (sem restrição de role).
   */
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.tenantsService.findBySlug(slug);
  }

  /**
   * Busca tenant por ID — OWNER do tenant ou ADMIN.
   */
  @Get(':id')
  findById(@Param('id') id: string, @Request() req) {
    const { tenantId, role } = req.user;
    // Não-admin só pode ver o próprio tenant
    if (role !== 'ADMIN' && tenantId !== id) {
      return this.tenantsService.findById(tenantId);
    }
    return this.tenantsService.findById(id);
  }

  /**
   * Atualiza dados do tenant — OWNER do tenant ou ADMIN.
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTenantDto, @Request() req) {
    const { tenantId, role } = req.user;
    return this.tenantsService.update(id, dto, tenantId, role);
  }

  /**
   * Remove um tenant — restrito a ADMIN da plataforma.
   */
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    const { tenantId, role } = req.user;
    return this.tenantsService.remove(id, tenantId, role);
  }

  // ─── Membros ──────────────────────────────────────────────────────────────

  /** Lista membros do próprio tenant. */
  @Get('members')
  listMembers(@Request() req) {
    return this.usersService.findAllByTenant(req.user.tenantId);
  }

  /** Convida um novo membro — OWNER ou ADMIN. */
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @Post('members')
  inviteMember(@Body() dto: InviteMemberDto, @Request() req) {
    const { tenantId, userId, role } = req.user;
    return this.usersService.inviteMember(tenantId, userId, role, dto);
  }

  /** Altera cargo de um membro — OWNER ou ADMIN. */
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @Patch('members/:id')
  updateMember(@Param('id') id: string, @Body() dto: UpdateUserDto, @Request() req) {
    const { tenantId, userId, role } = req.user;
    return this.usersService.updateMemberRole(tenantId, id, dto, userId, role);
  }

  /** Remove um membro — OWNER ou ADMIN. */
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @Delete('members/:id')
  removeMember(@Param('id') id: string, @Request() req) {
    const { tenantId, userId, role } = req.user;
    return this.usersService.removeMember(tenantId, id, userId, role);
  }
}
