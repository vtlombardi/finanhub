import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createDraft(tenantId: string, ownerId: string, data: any) {
    return this.prisma.catalogItem.create({
      data: {
        ...data,
        tenantId,
        ownerId,
        status: 'DRAFT',
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.catalogItem.update({
      where: { id },
      data,
    });
  }

  async findOne(id: string) {
    return this.prisma.catalogItem.findUnique({
      where: { id },
      include: { media: true },
    });
  }

  async findAll(tenantId: string, ownerId: string) {
    return this.prisma.catalogItem.findMany({
      where: { tenantId, ownerId },
      include: { media: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async saveMedia(catalogItemId: string, media: { url: string; mediaType: string; isCover?: boolean }[]) {
    // Limpar mídia anterior se necessário ou apenas adicionar
    return this.prisma.$transaction(
      media.map((m) =>
        this.prisma.catalogItemMedia.create({
          data: {
            catalogItemId,
            ...m,
          },
        })
      )
    );
  }

  async publish(id: string) {
    return this.prisma.catalogItem.update({
      where: { id },
      data: { status: 'PUBLISHED' },
    });
  }
}
