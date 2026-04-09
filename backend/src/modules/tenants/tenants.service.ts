import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTenantDto, UpdateTenantDto } from './dto/create-tenants.dto';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tenant.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        document: true,
        createdAt: true,
        _count: { select: { users: true, listings: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        name: true,
        document: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { users: true, listings: true, leads: true } },
      },
    });

    if (!tenant) throw new NotFoundException('Tenant não encontrado.');
    return tenant;
  }

  async findBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        createdAt: true,
      },
    });

    if (!tenant) throw new NotFoundException('Tenant não encontrado.');
    return tenant;
  }

  async create(dto: CreateTenantDto) {
    const existing = await this.prisma.tenant.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException('Slug já está em uso.');

    if (dto.document) {
      const docExists = await this.prisma.tenant.findUnique({ where: { document: dto.document } });
      if (docExists) throw new ConflictException('Documento já cadastrado.');
    }

    return this.prisma.tenant.create({
      data: { name: dto.name, slug: dto.slug, document: dto.document },
      select: { id: true, slug: true, name: true, document: true, createdAt: true },
    });
  }

  async update(id: string, dto: UpdateTenantDto, requesterTenantId: string, requesterRole: string) {
    await this.assertAccess(id, requesterTenantId, requesterRole);

    return this.prisma.tenant.update({
      where: { id },
      data: { ...dto },
      select: { id: true, slug: true, name: true, document: true, updatedAt: true },
    });
  }

  async remove(id: string, requesterTenantId: string, requesterRole: string) {
    await this.assertAccess(id, requesterTenantId, requesterRole);

    await this.prisma.tenant.delete({ where: { id } });
    return { message: 'Tenant removido com sucesso.' };
  }

  private async assertAccess(tenantId: string, requesterTenantId: string, requesterRole: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant não encontrado.');

    const isAdmin = requesterRole === 'ADMIN' || requesterRole === 'OWNER';
    const isOwnTenant = tenantId === requesterTenantId;

    if (!isAdmin && !isOwnTenant) {
      throw new ForbiddenException('Acesso negado.');
    }
  }
}
