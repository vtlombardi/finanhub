import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Endpoint de Listings implementa Modelo Híbrido:
 * - Rotas GET sem Guard: Acessíveis publicamente (Leitura limpa).
 * - Rotas POST/PUT com JwtAuthGuard: Operacionais internas.
 */
@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  // ROTA PÚBLICA (Vitrine com busca avançada e paginação)
  @Get()
  async findAllPublic(
    @Query('q') q?: string,
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.listingsService.findAllPublic({
      q,
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sort,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 12,
    });
  }

  // ROTA PRIVADA (Meus Anúncios)
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async findMyListings(@Request() req: any) {
    return this.listingsService.findMyListings(req.user.tenantId);
  }

  // ROTA PRIVADA (Meus Favoritos)
  @UseGuards(JwtAuthGuard)
  @Get('favorites')
  async getMyFavorites(@Request() req: any) {
    return this.listingsService.getMyFavorites(req.user.id);
  }

  // ROTA PRIVADA (Recomendações para o usuário)
  @UseGuards(JwtAuthGuard)
  @Get('recommended')
  async getRecommended(@Request() req: any) {
    return this.listingsService.getRecommended(req.user.userId);
  }

  // ROTA PRIVADA (Toggle Favorito)
  @UseGuards(JwtAuthGuard)
  @Post(':id/favorite')
  async toggleFavorite(@Param('id') listingId: string, @Request() req: any) {
    return this.listingsService.toggleFavorite(listingId, req.user.id);
  }

  // ROTA PÚBLICA (Deals similares a um listing)
  @Get(':id/similar')
  async getSimilar(@Param('id') listingId: string) {
    return this.listingsService.getSimilarListings(listingId);
  }

  // ROTA PÚBLICA (Detalhes por slug)
  @Get('slug/:slug')
  async findOnePublic(@Param('slug') slug: string) {
    return this.listingsService.findOnePublic(slug);
  }

  // ROTA PRIVADA (Criação de Oferta)
  @UseGuards(JwtAuthGuard)
  @Post()
  async createPrivately(@Request() req: any, @Body() data: any) {
    return this.listingsService.createPrivately({
      ...data,
      tenantId: req.user.tenantId,
    }, req.user);
  }
}

