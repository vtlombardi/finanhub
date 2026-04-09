import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAdDto, UpdateAdDto, AdPosition } from './dto/create-ads.dto';

@Injectable()
export class AdsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Retorna os anúncios ativos para uma posição específica no momento atual.
   * Usado pelo frontend para renderizar slots dinamicamente.
   */
  async findActive(position: AdPosition) {
    const now = new Date();
    return this.prisma.ad.findMany({
      where: {
        position,
        isActive: true,
        startsAt: { lte: now },
        OR: [{ endsAt: null }, { endsAt: { gte: now } }],
      },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        linkUrl: true,
        position: true,
      },
      orderBy: { startsAt: 'desc' },
    });
  }

  /**
   * Lista todos os anúncios (admin) com filtro opcional de posição.
   */
  async findAll(position?: AdPosition) {
    return this.prisma.ad.findMany({
      where: position ? { position } : undefined,
      select: {
        id: true,
        title: true,
        imageUrl: true,
        linkUrl: true,
        position: true,
        isActive: true,
        startsAt: true,
        endsAt: true,
        createdAt: true,
        tenant: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const ad = await this.prisma.ad.findUnique({
      where: { id },
      include: { tenant: { select: { id: true, name: true, slug: true } } },
    });
    if (!ad) throw new NotFoundException('Anúncio não encontrado.');
    return ad;
  }

  async create(dto: CreateAdDto) {
    return this.prisma.ad.create({
      data: {
        title: dto.title,
        imageUrl: dto.imageUrl,
        linkUrl: dto.linkUrl,
        position: dto.position,
        isActive: dto.isActive ?? true,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : new Date(),
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
        tenantId: dto.tenantId ?? null,
      },
      select: { id: true, title: true, position: true, isActive: true, startsAt: true, endsAt: true },
    });
  }

  async update(id: string, dto: UpdateAdDto) {
    await this.findById(id);
    return this.prisma.ad.update({
      where: { id },
      data: {
        ...dto,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
      },
      select: { id: true, title: true, position: true, isActive: true, startsAt: true, endsAt: true, updatedAt: true },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.ad.delete({ where: { id } });
    return { message: 'Anúncio removido com sucesso.' };
  }
}
