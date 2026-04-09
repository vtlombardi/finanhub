import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AdsService } from './ads.service';
import { CreateAdDto, UpdateAdDto, AdPosition } from './dto/create-ads.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  /**
   * Retorna anúncios ativos para um slot — público (consumido pelo frontend).
   * GET /ads/active?position=LEADERBOARD
   */
  @Get('active')
  findActive(@Query('position') position: AdPosition) {
    return this.adsService.findActive(position);
  }

  /**
   * Lista todos os anúncios — restrito a ADMIN.
   * GET /ads?position=MOBILE_BANNER (position é opcional)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll(@Query('position') position?: AdPosition) {
    return this.adsService.findAll(position);
  }

  /**
   * Busca anúncio por ID — restrito a ADMIN.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.adsService.findById(id);
  }

  /**
   * Cria um anúncio — restrito a ADMIN.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateAdDto) {
    return this.adsService.create(dto);
  }

  /**
   * Atualiza um anúncio — restrito a ADMIN.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAdDto) {
    return this.adsService.update(id, dto);
  }

  /**
   * Remove um anúncio — restrito a ADMIN.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adsService.remove(id);
  }
}
