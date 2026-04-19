import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
    subCategory?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    state?: string;
    opportunityType?: string;
    minRevenue?: number;
    maxRevenue?: number;
    minEbitda?: number;
    maxEbitda?: number;
    sort?: string;  // 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'revenue_desc' | 'ebitda_desc'
    page?: number;
    limit?: number;
  }) {
    const { 
      q, category, subCategory, minPrice, maxPrice, location, state, 
      opportunityType, minRevenue, maxRevenue, minEbitda, maxEbitda,
      sort, page = 1, limit = 12 
    } = filters;
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

    // Filtro por slug de categoria/subcategoria
    if (category) {
      where.category = { slug: category };
    }

    if (subCategory) {
      // Se subcategoria for enviada, reforça filtro por atributo ou lógica de hierarquia se disponível
      // Por enquanto, filtros baseados em slug de categoria tratam subcategorias como categorias irmãs ou filtros de texto
      where.OR = where.OR || [];
      where.OR.push({ subtitle: { contains: subCategory, mode: 'insensitive' } });
    }

    // Tipo de Oportunidade
    if (opportunityType) {
      where.operationStructure = { contains: opportunityType, mode: 'insensitive' };
    }

    // Faixa de preço (dealValue/price)
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }

    // Faixa de Receita
    if (minRevenue || maxRevenue) {
      where.annualRevenue = {};
      if (minRevenue) where.annualRevenue.gte = minRevenue;
      if (maxRevenue) where.annualRevenue.lte = maxRevenue;
    }

    // Faixa de EBITDA
    if (minEbitda || maxEbitda) {
      where.ebitda = {};
      if (minEbitda) where.ebitda.gte = minEbitda;
      if (maxEbitda) where.ebitda.lte = maxEbitda;
    }

    // Ordenação — featured sempre primeiro, depois user sort
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let userSort: any = { createdAt: 'desc' };
    if (sort === 'price_asc') userSort = { price: 'asc' };
    else if (sort === 'price_desc') userSort = { price: 'desc' };
    else if (sort === 'revenue_desc') userSort = { annualRevenue: 'desc' };
    else if (sort === 'ebitda_desc') userSort = { ebitda: 'desc' };
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
          logoUrl: true,
          state: true,
          city: true,
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
      include: { category: true }
    });

    if (!listing) return [];

    const priceNum = listing.price ? Number(listing.price) : 0;
    const priceLow = priceNum * 0.7; // Mais restrito: 30% variação
    const priceHigh = priceNum * 1.3;

    return this.prisma.listing.findMany({
      where: {
        status: 'ACTIVE',
        id: { not: listing.id },
        AND: [
          { categoryId: listing.categoryId },
          {
            OR: [
              { price: { gte: priceLow, lte: priceHigh } },
              { state: listing.state },
              { subtitle: { contains: listing.subtitle || '', mode: 'insensitive' } }
            ]
          }
        ]
      },
      select: {
        id: true,
        slug: true,
        title: true,
        price: true,
        state: true,
        city: true,
        annualRevenue: true,
        ebitda: true,
        category: { select: { name: true, slug: true } },
      },
      take,
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' }
      ],
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

  async findMyListings(tenantId: string, filters: { q?: string; category?: string; status?: string; page?: number; limit?: number } = {}) {
    const { q, category, status, page = 1, limit = 10 } = filters;
    const where: any = { 
      tenantId,
      status: status ? (status as any) : { not: 'DELETED' }
    };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.categoryId = category;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        include: {
          category: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
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

  async duplicate(id: string, tenantId: string) {
    const original = await this.prisma.listing.findFirst({
      where: { id, tenantId },
      include: {
        attrValues: true,
        features: true,
        media: true,
      }
    });

    if (!original) throw new NotFoundException('Anúncio original não encontrado.');

    const { id: _, slug: __, createdAt: ___, updatedAt: ____, ...data } = original;

    const newSlug = `${original.slug}-copy-${Date.now()}`;
    const newTitle = `${original.title} (Cópia)`;

    const duplicated = await this.prisma.listing.create({
      data: {
        ...data,
        title: newTitle,
        slug: newSlug,
        status: 'DRAFT',
        attrValues: {
          create: original.attrValues.map(av => ({
            attributeId: av.attributeId,
            valueStr: av.valueStr,
            valueNum: av.valueNum,
            valueBool: av.valueBool,
          }))
        },
        features: {
          create: original.features.map(f => ({
            name: f.name,
            iconClass: f.iconClass,
          }))
        },
        media: {
          create: original.media.map(m => ({
            url: m.url,
            mediaType: m.mediaType,
            isCover: m.isCover,
          }))
        }
      }
    });

    return duplicated;
  }

  async softDelete(id: string, tenantId: string) {
    const listing = await this.prisma.listing.findFirst({ where: { id, tenantId } });
    if (!listing) throw new NotFoundException('Anúncio não encontrado.');

    return this.prisma.listing.update({
      where: { id },
      data: { status: 'DELETED' }
    });
  }

  async toggleStatus(id: string, tenantId: string, status: string) {
    const listing = await this.prisma.listing.findFirst({ where: { id, tenantId } });
    if (!listing) throw new NotFoundException('Anúncio não encontrado.');

    const allowed = ['ACTIVE', 'INACTIVE', 'CLOSED', 'DRAFT'];
    if (!allowed.includes(status)) {
      throw new BadRequestException('Status não permitido para troca manual.');
    }

    return this.prisma.listing.update({
      where: { id },
      data: { status: status as any }
    });
  }

  /**
   * Detalhes públicos por slug.
   */
  async findOnePublic(slugOrId: string) {
    const isUuid = slugOrId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    
    const listing = await this.prisma.listing.findFirst({
      where: {
        OR: [
          { slug: slugOrId },
          ...(isUuid ? [{ id: slugOrId }] : [])
        ],
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

    if (!listing) throw new NotFoundException('Anúncio não encontrado.');

    // Rastreamento assíncrono
    this.analytics.trackEvent(listing.tenantId, 'VIEW', listing.id).catch(() => {});

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
           include: { 
             category: true, 
             tenant: { select: { name: true } },
             company: { select: { name: true, isVerified: true } }
           }
        }
      },
      orderBy: { createdAt: 'desc' }
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
    const { features, businessHours, media, attrValues, category, company, tenant, ...rest } = data;

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
        attrValues: attrValues ? {
          create: attrValues
        } : undefined,
      }
    });

    // 3. Dispatch Motor AI (Async)
    /*
    try {
      this.aiQueue.add('review-ad-job', {
        listingId: newListing.id,
        tenantId: newListing.tenantId
      }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 }
      }).catch(e => console.error('[Queue Error] Falha ao enfileirar:', e));
      console.log(`[Queue] Listing ${newListing.id} enviada para Triagem AI.`);
    } catch (e) {
      console.error('[Queue Error] Falha ao injetar no Redis:', e);
    }
    */

    return newListing;
  }

  async updatePrivately(id: string, tenantId: string, data: any) {
    // 1. Verifica existência e posse
    const existing = await this.prisma.listing.findFirst({
      where: { id, tenantId },
      include: { category: true }
    });

    if (!existing) {
      throw new NotFoundException('Anúncio não encontrado para edição');
    }

    // 2. Extração de relações para sync via "Delete & Create"
    const { features, businessHours, media, attrValues, category, company, tenant, ...rest } = data;

    // VALIDAÇÃO DE PADRÕES (Categorias Premium)
    const newStatus = rest.status || existing.status;
    const isFranchise = [
      '803c2459-36d3-48d6-9ab0-ee82612a444d', // Franquias e Licenciamento
      '0a824561-3252-47e9-92ca-c12aa047ec54',
      'c34d9b4e-8d9c-4f0c-b5e7-2643b55c5dc3',
      '77831699-f2de-4696-ac7f-5d7c48142738',
      'aaf04626-e6bb-426b-9b9d-a0219a0462d6'
    ].includes(rest.categoryId || existing.categoryId);

    const isStartup = [
      'e788eb9e-42fc-498d-9cd8-c3dcb4037bf9' // Startups e Tecnologia
    ].includes(rest.categoryId || existing.categoryId);

    const isAsset = [
      '7c9b3a2e-5f1d-48c2-a9e0-81f9b3c4d5e6', // Ativos e Estruturas (Principal)
      'a73557e0-24f2-45bc-ba28-65fe7fe122e7', // Maquinários e Equipamentos
      'ac016e1a-4831-4d3f-9907-ea9ca06f437a', // Equipamentos Industriais
      '6e008fb6-32f2-4c91-afe6-9084a70a740d'  // Frotas e Veículos
    ].includes(rest.categoryId || existing.categoryId);

    const isService = [
      'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', // Serviços e Consultoria (Principal)
      'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', // Consultoria Estratégica
      'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', // Consultoria Financeira
      'a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d', // Serviços Operacionais
      'b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e'  // Outsourcing e BPO
    ].includes(rest.categoryId || existing.categoryId);

    const isRealEstate = [
      'e8a9b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2' // Imóveis para Negócios
    ].includes(rest.categoryId || existing.categoryId);

    const isPremium = [
      'p7e8f9a0-b1c2-4d3e-8f9a-0b1c2d3e4f5a' // Oportunidades Premium
    ].includes(rest.categoryId || existing.categoryId);

    const isPartnership = [
      'b1c2d3e4-f5a6-4b7c-8d9e-0f1a2b3c4d5e' // Divulgação e Parcerias
    ].includes(rest.categoryId || existing.categoryId);

    if (newStatus === 'ACTIVE') {

      if (isFranchise) {
        const requiredCount = 14;
        const currentAttrs = attrValues || [];
        if (currentAttrs.length < requiredCount) {
          throw new BadRequestException(`Anúncios de Franquia exigem os ${requiredCount} indicadores financeiros completos antes de serem ativados.`);
        }
      }
      if (isStartup) {
        const requiredCount = 16;
        const currentAttrs = attrValues || [];
        if (currentAttrs.length < requiredCount) {
          throw new BadRequestException(`Anúncios de Startups exigem os ${requiredCount} indicadores técnicos e de mercado completos antes de serem ativados.`);
        }
      }
      if (isAsset) {
        // Validação de Valor (Price) - Ponto crítico solicitado pelo usuário
        const price = rest.price !== undefined ? rest.price : existing.price;
        if (!price || Number(price) <= 0) {
          throw new BadRequestException('Anúncios de Ativos exigem um Valor Estimado (Price) válido antes de serem ativados.');
        }

        const requiredCount = 8; // Mínimo de especificações técnicas
        const currentAttrs = attrValues || [];
        if (currentAttrs.length < requiredCount) {
          throw new BadRequestException(`Anúncios de Ativos exigem pelo menos ${requiredCount} especificações técnicas completas antes de serem ativados.`);
        }
      }
      if (isService) {
        // Validação de Valor/Fee
        const price = rest.price !== undefined ? rest.price : existing.price;
        if (!price || Number(price) <= 0) {
          throw new BadRequestException('Anúncios de Serviços exigem um Valor/Fee estimado antes de serem ativados.');
        }

        const requiredCount = 8; // Mínimo de indicadores de expertise e metodologia
        const currentAttrs = attrValues || [];
        if (currentAttrs.length < requiredCount) {
          throw new BadRequestException(`Anúncios de Serviços exigem pelo menos ${requiredCount} indicadores de expertise e metodologia antes de serem ativados.`);
        }
      }
      if (isRealEstate) {
        // Validação de Valor do Imóvel
        const price = rest.price !== undefined ? rest.price : existing.price;
        if (!price || Number(price) <= 0) {
          throw new BadRequestException('Anúncios de Imóveis exigem um Valor Estimado válido antes de serem ativados.');
        }

        const requiredCount = 10; // Mínimo de campos de localização e potencial
        const currentAttrs = attrValues || [];
        if (currentAttrs.length < requiredCount) {
          throw new BadRequestException(`Anúncios de Imóveis exigem pelo menos ${requiredCount} indicadores técnicos (Zoneamento, Área, etc.) preenchidos antes de serem ativados.`);
        }
      }
      if (isPremium) {
        // Validação de Valor Mínimo para Premium
        const price = rest.price !== undefined ? rest.price : existing.price;
        if (!price || Number(price) <= 0) {
          throw new BadRequestException('Oportunidades Premium exigem um Valor Estimado válido antes de serem ativados.');
        }

        const requiredCount = 10; // Mínimo de indicadores financeiros e estruturais
        const currentAttrs = attrValues || [];
        if (currentAttrs.length < requiredCount) {
          throw new BadRequestException(`Oportunidades Premium exigem pelo menos ${requiredCount} indicadores financeiros e operacionais preenchidos antes de serem ativados.`);
        }
      }

    }


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
      if (attrValues) {
        await tx.listingAttributeValue.deleteMany({ where: { listingId: id } });
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
          attrValues: attrValues ? {
            create: attrValues.map((av: any) => ({
              attributeId: av.attributeId,
              valueStr: av.valueStr,
              valueNum: av.valueNum,
            }))
          } : undefined,
        },
        include: {
          features: true,
          businessHours: true,
          media: true,
          attrValues: { include: { attribute: true } }
        }
      });

      return updated;
    }).then(async (updated) => {
      // Enfileira fora da transação para não bloquear o commit
      /*
      if (updated.status === 'PENDING_AI_REVIEW') {
        try {
        this.aiQueue.add('review-ad-job', {
          listingId: updated.id,
          tenantId: updated.tenantId,
        }, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } })
        .catch(e => console.error('[Queue Error] Falha ao re-enfileirar:', e));
          console.log(`[Queue] Listing ${updated.id} re-enviada para triagem AI.`);
        } catch (e) {
          console.error('[Queue Error] Falha ao re-enfileirar:', e);
        }
      }
      */
      return updated;
    });
  }
}

