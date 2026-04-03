import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async findCompaniesByUserAndTenant(tenantId: string, userId: string) {
    return this.prisma.company.findMany({
      where: {
        tenantId,
        members: {
          some: { userId }
        }
      },
      include: {
        members: { select: { role: true } }
      }
    });
  }

  async createCompany(data: any, ownerUserId: string) {
    const existing = await this.prisma.company.findUnique({
      where: { tenantId_slug: { tenantId: data.tenantId, slug: data.slug } }
    });

    if (existing) {
      throw new ConflictException('Slug da Empresa já existe nesta Tenant.');
    }

    return this.prisma.company.create({
      data: {
        tenantId: data.tenantId,
        slug: data.slug,
        name: data.name,
        document: data.document,
        members: {
          create: {
             userId: ownerUserId,
             role: 'OWNER'
          }
        }
      }
    });
  }
}
