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
      }
    });
  }

  /**
   * Busca pública avançada com filtros, paginação e ordenação.
   */
  async findAllPublic(filters: {
    q?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;  // 'price_asc' | 'price_desc' | 'newest' | 'oldest'
    page?: number;
    limit?: number;
  }) {
    const { q, category, minPrice, maxPrice, sort, page = 1, limit = 12 } = filters;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { status: 'ACTIVE' };

    // Texto livre em título e descrição
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
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

  async findOnePublic(slug: string) {
    const listing = await this.prisma.listing.findFirst({
      where: { 
        slug, 
        status: 'ACTIVE' 
      },
      include: {
        tenant: { select: { name: true } },
        category: true,
        attrValues: { include: { attribute: true } }
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

  async createPrivately(data: any, operatorInfo: any) {
    // 1. Gravação síncrona engessada PENDING_AI_REVIEW
    const newListing = await this.prisma.listing.create({
      data: {
        title: data.title,
        slug: data.slug || data.title.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, ''),
        description: data.description,
        price: data.price,
        tenantId: data.tenantId,
        companyId: data.companyId,
        categoryId: data.categoryId,
        status: 'PENDING_AI_REVIEW', 
      }
    });

    // 2. Dispatch Assíncrono pro Motor AI
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
}

