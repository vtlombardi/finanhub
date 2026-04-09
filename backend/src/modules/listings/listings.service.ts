import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Queue } from 'bullmq';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class ListingsService {
  private aiQueue: Queue;

  constructor(
    private prisma: PrismaService,
    private analytics: AnalyticsService
  ) {
    // Configura a fila M&A Review com o Redis local ou via Env
    this.aiQueue = new Queue('ai-review', {
      connection: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        maxRetriesPerRequest: null,
      }
    });

    // Silencia erros de conexão se o Redis não estiver rodando localmente
    this.aiQueue.on('error', () => {});
  }

  /**
   * Busca pública avançada com filtros, paginação e ordenação.
   */
  async findAllPublic(filters: {
    q?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    state?: string;
    sort?: string;  // 'price_asc' | 'price_desc' | 'newest' | 'oldest'
    page?: number;
    limit?: number;
  }) {
    const { q, category, minPrice, maxPrice, location, state, sort, page = 1, limit = 12 } = filters;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { status: 'ACTIVE' };

    // Texto livre em título e descrição
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Filtro por Estado (UF) exato
    if (state) {
      where.state = { equals: state, mode: 'insensitive' };
    }

    // Filtro de Localização Genérica (city, state ou neighborhood)
    if (location) {
      const locationFilter = [
        { city: { contains: location, mode: 'insensitive' as const } },
        { state: { contains: location, mode: 'insensitive' as const } },
        { neighborhood: { contains: location, mode: 'insensitive' as const } },
      ];
      if (where.OR) {
        where.AND = [
          { OR: where.OR },
          { OR: locationFilter }
        ];
        delete where.OR;
      } else {
        where.OR = locationFilter;
      }
    }

    // Filtro por slug de categoria
    if (category) {
      where.category = { slug: category };
    }

    // Faixa de preço
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }

    // Ordenação — featured sempre primeiro, depois user sort
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let userSort: any = { createdAt: 'desc' };
    if (sort === 'price_asc') userSort = { price: 'asc' };
    else if (sort === 'price_desc') userSort = { price: 'desc' };
    else if (sort === 'oldest') userSort = { createdAt: 'asc' };

    const orderBy = [{ featuredPriority: 'desc' as const }, userSort];

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          price: true,
          status: true,
          createdAt: true,
          isFeatured: true,
          featuredUntil: true,
          tenant: { select: { name: true } },
          category: { select: { slug: true, name: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.listing.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Recomendações: Deals similares ao listing atual (mesma categoria, faixa de preço próxima).
   */
  async getSimilarListings(listingId: string, take = 4) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: { categoryId: true, price: true, id: true },
    });

    if (!listing) return [];

    const priceNum = listing.price ? Number(listing.price) : 0;
    const priceLow = priceNum * 0.5;
    const priceHigh = priceNum * 2.0;

    return this.prisma.listing.findMany({
      where: {
        status: 'ACTIVE',
        id: { not: listing.id },
        OR: [
          { categoryId: listing.categoryId },
          { price: { gte: priceLow, lte: priceHigh } },
        ],
      },
      select: {
        id: true,
        slug: true,
        title: true,
        price: true,
        category: { select: { name: true } },
      },
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Recomendações para o usuário logado, baseadas nos seus favoritos e leads.
   */
  async getRecommended(userId: string, take = 6) {
    // Descobre categorias dos favoritos e leads do investidor
    const [favorites, leads] = await Promise.all([
      this.prisma.favorite.findMany({
        where: { userId },
        select: { listing: { select: { categoryId: true } } },
      }),
      this.prisma.lead.findMany({
        where: { investorId: userId },
        select: { listing: { select: { categoryId: true } } },
      }),
    ]);

    const categoryIds = [
      ...new Set([
        ...favorites.map((f) => f.listing.categoryId),
        ...leads.map((l) => l.listing.categoryId),
      ]),
    ];

    // IDs de listings já favoritados para excluir
    const favListingIds = await this.prisma.favorite.findMany({
      where: { userId },
      select: { listingId: true },
    });
    const excludeIds = favListingIds.map((f) => f.listingId);

    if (categoryIds.length === 0) {
      // Fallback: retorna listings mais recentes
      return this.prisma.listing.findMany({
        where: { status: 'ACTIVE', id: { notIn: excludeIds } },
        select: {
          id: true, slug: true, title: true, price: true,
          category: { select: { name: true } },
          tenant: { select: { name: true } },
        },
        take,
        orderBy: { createdAt: 'desc' },
      });
    }

    return this.prisma.listing.findMany({
      where: {
        status: 'ACTIVE',
        id: { notIn: excludeIds },
        categoryId: { in: categoryIds },
      },
      select: {
        id: true, slug: true, title: true, price: true,
        category: { select: { name: true } },
        tenant: { select: { name: true } },
      },
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMyListings(tenantId: string) {
    // Retorna todos os estados do ativo para a empresa dona
    return this.prisma.listing.findMany({
      where: { tenantId },
      include: {
        category: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

    return listing;
  }

  async findOnePublicById(id: string) {
    const listing = await this.prisma.listing.findFirst({
      where: { 
        id, 
        status: 'ACTIVE' 
      },
      include: {
        tenant: { select: { name: true } },
        category: true,
        company: {
          select: {
            name: true,
            isVerified: true,
            createdAt: true,
          }
        },
        attrValues: { include: { attribute: true } },
        features: true,
        businessHours: true,
        media: true,
      }
    });

    if (!listing) {
      throw new NotFoundException('Listing indisponível ou inexistente');
    }

    // Registro de Analytics Assíncrono (Fire and Forget)
    this.analytics.trackEvent(listing.tenantId, 'VIEW', listing.id).catch(err => {
       console.error('Failed to track view:', err);
    });

    return listing;
  }

  async toggleFavorite(listingId: string, userId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: {
        listingId_userId: { listingId, userId }
      }
    });

    if (existing) {
      await this.prisma.favorite.delete({
        where: { id: existing.id }
      });
      return { favorited: false };
    }

    await this.prisma.favorite.create({
      data: { listingId, userId }
    });
    return { favorited: true };
  }

  async getMyFavorites(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: {
        listing: {
           include: { category: true, tenant: { select: { name: true } } }
        }
      }
    });
  }

  async findOnePrivate(id: string, tenantId: string) {
    const listing = await this.prisma.listing.findFirst({
      where: { id, tenantId },
      include: {
        category: true,
        features: true,
        businessHours: true,
        media: true,
      }
    });

    if (!listing) {
      throw new NotFoundException('Anúncio não encontrado ou acesso negado');
    }

    return listing;
  }

  async createPrivately(data: any, operatorInfo: any) {
    // 1. Extração de relações
    const { features, businessHours, media, ...rest } = data;

    // 2. Criação Síncrona (Default: PENDING_AI_REVIEW)
    const newListing = await this.prisma.listing.create({
      data: {
        ...rest,
        slug: rest.slug || rest.title.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, ''),
        status: 'PENDING_AI_REVIEW',
        features: features ? {
          create: features
        } : undefined,
        businessHours: businessHours ? {
          create: businessHours
        } : undefined,
        media: media ? {
          create: media
        } : undefined,
      }
    });

    // 3. Dispatch Motor AI (Async)
    try {
      await this.aiQueue.add('review-ad-job', {
        listingId: newListing.id,
        tenantId: newListing.tenantId
      }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 }
      });
      console.log(`[Queue] Listing ${newListing.id} enviada para Triagem AI.`);
    } catch (e) {
      console.error('[Queue Error] Falha ao injetar no Redis:', e);
    }

    return newListing;
  }

  async updatePrivately(id: string, tenantId: string, data: any) {
    // 1. Verifica existência e posse
    const existing = await this.prisma.listing.findFirst({
      where: { id, tenantId }
    });

    if (!existing) {
      throw new NotFoundException('Anúncio não encontrado para edição');
    }

    // 2. Extração de relações para sync via "Delete & Create"
    const { features, businessHours, media, ...rest } = data;

    // 3. Execução em Transação (Atomicidade)
    return this.prisma.$transaction(async (tx) => {
      // Limpa relações antigas se novas forem enviadas (Sync Total)
      if (features) {
        await tx.listingFeature.deleteMany({ where: { listingId: id } });
      }
      if (businessHours) {
        await tx.businessHour.deleteMany({ where: { listingId: id } });
      }
      if (media) {
        await tx.listingMedia.deleteMany({ where: { listingId: id } });
      }

      // Se estava FLAGGED e o usuário corrigiu, re-aciona revisão AI
      const wasEdited = Object.keys(rest).some(k => ['title', 'description', 'price'].includes(k));
      const shouldResubmit = existing.status === 'FLAGGED' && wasEdited;

      const updated = await tx.listing.update({
        where: { id },
        data: {
          ...rest,
          // Re-envia para triagem se conteúdo principal foi editado após reprovação
          ...(shouldResubmit ? { status: 'PENDING_AI_REVIEW' } : {}),
          features: features ? { create: features } : undefined,
          businessHours: businessHours ? { create: businessHours } : undefined,
          media: media ? { create: media } : undefined,
        },
        include: {
          features: true,
          businessHours: true,
          media: true
        }
      });

      return updated;
    }).then(async (updated) => {
      // Enfileira fora da transação para não bloquear o commit
      if (updated.status === 'PENDING_AI_REVIEW') {
        try {
          await this.aiQueue.add('review-ad-job', {
            listingId: updated.id,
            tenantId: updated.tenantId,
          }, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } });
          console.log(`[Queue] Listing ${updated.id} re-enviada para triagem AI.`);
        } catch (e) {
          console.error('[Queue Error] Falha ao re-enfileirar:', e);
        }
      }
      return updated;
    });
  }
}

