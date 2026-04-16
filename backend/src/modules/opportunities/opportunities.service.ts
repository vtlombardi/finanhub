import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class OpportunitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: any) {
    const {
      category,
      subcategory,
      state,
      city,
      minPrice,
      maxPrice,
      verified,
      search,
      sortBy = 'newest',
    } = filters;

    const where: any = {
      status: 'ACTIVE',
    };

    if (category) {
      const isUuid = category.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      if (isUuid) {
        where.categoryId = category;
      } else {
        where.category = { slug: category };
      }
    }

    if (subcategory) {
      const isUuid = subcategory.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      if (isUuid) {
        where.categoryId = subcategory;
      } else {
        where.category = {
          slug: subcategory
        };
      }
    }

    if (state) {
      where.state = state;
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (verified === 'true') {
      where.company = { isVerified: true };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Price filtering (using investmentValue or price)
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const orderBy: any = {};
    if (sortBy === 'price-high') {
      orderBy.price = 'desc';
    } else if (sortBy === 'price-low') {
      orderBy.price = 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const listings = await this.prisma.listing.findMany({
      where,
      orderBy,
      include: {
        category: true,
        company: true,
      },
    });

    // Map to frontend format
    const data = listings.map((l) => ({
      id: l.id,
      title: l.title,
      category: l.category?.name || 'Geral',
      subcategory: l.category?.name || 'Negócio',
      location: l.city && l.state ? `${l.city}, ${l.state}` : (l.state || l.city || 'Brasil'),
      price: l.price ? `R$ ${Number(l.price).toLocaleString('pt-BR')}` : 'Sob consulta',
      date: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(l.createdAt),
      image: l.logoUrl || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=800',
      verified: l.company?.isVerified || false,
      status: 'Ativo',
    }));

    return {
      message: 'Lista de oportunidades',
      total: data.length,
      data,
    };
  }
}