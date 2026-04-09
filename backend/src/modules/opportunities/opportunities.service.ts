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
      where.category = { name: { contains: category, mode: 'insensitive' } };
    }

    if (subcategory) {
      // Assuming subcategory is a field or part of attributes. 
      // For now, let's search in description or title if no specific field.
      // Or if it's a category name too.
      // Based on schema, subcategories aren't a separate model but we can filter by name.
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
      subcategory: l.category?.name || 'Negócio', // Mapped from category for now
      location: `${l.city || 'N/A'}, ${l.state || ''}`,
      price: l.price ? `R$ ${Number(l.price).toLocaleString('pt-BR')}` : 'Sob consulta',
      rating: 4.5 + Math.random() * 0.5, // Mocked rating for UI consistency
      date: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(l.createdAt),
      image: 'https://images.unsplash.com/photo-1551288560-199a5089e5cc?auto=format&fit=crop&q=80&w=800', // Default image
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