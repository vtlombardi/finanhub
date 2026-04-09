import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-categories.dto';
import { CreateCategoryAttributeDto, UpdateCategoryAttributeDto } from './dto/category-attribute.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Lista pública — todas as categorias (usada nos filtros da vitrine) */
  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /** Lista categorias de um tenant específico (painel admin) */
  async findByTenant(tenantId: string) {
    return this.prisma.category.findMany({
      where: { tenantId },
      include: {
        _count: { select: { listings: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  /** Cria categoria para o tenant autenticado */
  async create(tenantId: string, dto: CreateCategoryDto) {
    const slug = dto.slug || this.generateSlug(dto.name);

    const existing = await this.prisma.category.findUnique({
      where: { tenantId_slug: { tenantId, slug } },
    });
    if (existing) {
      throw new ConflictException(`Já existe uma categoria com o slug "${slug}" neste workspace.`);
    }

    return this.prisma.category.create({
      data: { tenantId, name: dto.name, slug, description: dto.description, iconClass: dto.iconClass },
    });
  }

  /** Atualiza categoria — verifica posse pelo tenantId */
  async update(id: string, tenantId: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findFirst({ where: { id, tenantId } });
    if (!category) throw new NotFoundException('Categoria não encontrada ou acesso negado.');

    return this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.iconClass !== undefined ? { iconClass: dto.iconClass } : {}),
      },
    });
  }

  /** Remove categoria — verifica posse e garante que não há listings vinculados */
  async remove(id: string, tenantId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, tenantId },
      include: { _count: { select: { listings: true } } },
    });

    if (!category) throw new NotFoundException('Categoria não encontrada ou acesso negado.');

    if (category._count.listings > 0) {
      throw new BadRequestException(
        `Não é possível excluir: ${category._count.listings} anúncio(s) estão vinculados a esta categoria.`,
      );
    }

    await this.prisma.category.delete({ where: { id } });
    return { deleted: true };
  }

  // ── CategoryAttribute CRUD ────────────────────────────────────────────────

  private async assertCategoryOwnership(categoryId: string, tenantId: string) {
    const cat = await this.prisma.category.findFirst({ where: { id: categoryId, tenantId } });
    if (!cat) throw new NotFoundException('Categoria não encontrada ou acesso negado.');
    return cat;
  }

  async getAttributes(categoryId: string, tenantId: string) {
    await this.assertCategoryOwnership(categoryId, tenantId);
    return this.prisma.categoryAttribute.findMany({
      where: { categoryId },
      orderBy: { name: 'asc' },
    });
  }

  async createAttribute(categoryId: string, tenantId: string, dto: CreateCategoryAttributeDto) {
    await this.assertCategoryOwnership(categoryId, tenantId);

    const existing = await this.prisma.categoryAttribute.findUnique({
      where: { categoryId_name: { categoryId, name: dto.name } },
    });
    if (existing) {
      throw new ConflictException(`Já existe um atributo com o nome "${dto.name}" nesta categoria.`);
    }

    return this.prisma.categoryAttribute.create({
      data: {
        tenantId,
        categoryId,
        name: dto.name,
        label: dto.label,
        type: dto.type,
        isRequired: dto.isRequired ?? false,
      },
    });
  }

  async updateAttribute(attributeId: string, tenantId: string, dto: UpdateCategoryAttributeDto) {
    const attr = await this.prisma.categoryAttribute.findFirst({
      where: { id: attributeId, tenantId },
    });
    if (!attr) throw new NotFoundException('Atributo não encontrado ou acesso negado.');

    return this.prisma.categoryAttribute.update({
      where: { id: attributeId },
      data: {
        ...(dto.label !== undefined ? { label: dto.label } : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.isRequired !== undefined ? { isRequired: dto.isRequired } : {}),
      },
    });
  }

  async removeAttribute(attributeId: string, tenantId: string) {
    const attr = await this.prisma.categoryAttribute.findFirst({
      where: { id: attributeId, tenantId },
      include: { _count: { select: { values: true } } },
    });
    if (!attr) throw new NotFoundException('Atributo não encontrado ou acesso negado.');

    if (attr._count.values > 0) {
      throw new BadRequestException(
        `Não é possível excluir: ${attr._count.values} anúncio(s) já preencheram este atributo. Remova os valores primeiro.`,
      );
    }

    await this.prisma.categoryAttribute.delete({ where: { id: attributeId } });
    return { deleted: true };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
