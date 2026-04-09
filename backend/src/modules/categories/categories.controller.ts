import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-categories.dto';
import { CreateCategoryAttributeDto, UpdateCategoryAttributeDto } from './dto/category-attribute.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /** Pública — usada nos filtros da vitrine */
  @Get()
  async findAll() {
    return this.categoriesService.findAll();
  }

  /** Admin — categorias do tenant autenticado */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @Get('my')
  async findMine(@Request() req: any) {
    return this.categoriesService.findByTenant(req.user.tenantId);
  }

  /** Admin — criar nova categoria */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @Post()
  async create(@Request() req: any, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(req.user.tenantId, dto);
  }

  /** Admin — editar categoria */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @Patch(':id')
  async update(@Param('id') id: string, @Request() req: any, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, req.user.tenantId, dto);
  }

  /** Admin — excluir categoria (bloqueado se houver listings vinculados) */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.categoriesService.remove(id, req.user.tenantId);
  }

  // ── CategoryAttribute endpoints ───────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @Get(':categoryId/attributes')
  async getAttributes(@Param('categoryId') categoryId: string, @Request() req: any) {
    return this.categoriesService.getAttributes(categoryId, req.user.tenantId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @Post(':categoryId/attributes')
  async createAttribute(
    @Param('categoryId') categoryId: string,
    @Request() req: any,
    @Body() dto: CreateCategoryAttributeDto,
  ) {
    return this.categoriesService.createAttribute(categoryId, req.user.tenantId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @Patch('attributes/:attributeId')
  async updateAttribute(
    @Param('attributeId') attributeId: string,
    @Request() req: any,
    @Body() dto: UpdateCategoryAttributeDto,
  ) {
    return this.categoriesService.updateAttribute(attributeId, req.user.tenantId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @Delete('attributes/:attributeId')
  async removeAttribute(@Param('attributeId') attributeId: string, @Request() req: any) {
    return this.categoriesService.removeAttribute(attributeId, req.user.tenantId);
  }
}
