import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request, Query, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ListingsService } from './listings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateListingDto, UpdateListingDto } from './dto/listing.dto';

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
    @Query('location') location?: string,
    @Query('state') state?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.listingsService.findAllPublic({
      q,
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      location,
      state,
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
    return this.listingsService.getMyFavorites(req.user.userId);
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
    return this.listingsService.toggleFavorite(listingId, req.user.userId);
  }

  // ROTA PÚBLICA (Deals similares a um listing)
  @Get(':id/similar')
  async getSimilar(@Param('id') listingId: string) {
    return this.listingsService.getSimilarListings(listingId);
  }

  // ROTA PÚBLICA (Detalhes por ID)
  @Get(':id')
  async findOnePublicById(@Param('id') id: string) {
    return this.listingsService.findOnePublicById(id);
  }

  // ROTA PÚBLICA (Detalhes por slug)
  @Get('slug/:slug')
  async findOnePublic(@Param('slug') slug: string) {
    return this.listingsService.findOnePublic(slug);
  }

  // ROTA PRIVADA (Criação via Painel)
  @UseGuards(JwtAuthGuard)
  @Post('private')
  async createPrivately(@Request() req: any, @Body() data: CreateListingDto) {
    return this.listingsService.createPrivately({
      ...data,
      tenantId: req.user.tenantId,
    }, req.user);
  }

  // ROTA PRIVADA (Busca para Edição)
  @UseGuards(JwtAuthGuard)
  @Get('private/:id')
  async findOnePrivate(@Param('id') id: string, @Request() req: any) {
    return this.listingsService.findOnePrivate(id, req.user.tenantId);
  }

  // ROTA PRIVADA (Atualização via Painel)
  @UseGuards(JwtAuthGuard)
  @Patch('private/:id')
  async updatePrivately(
    @Param('id') id: string,
    @Request() req: any,
    @Body() data: UpdateListingDto,
  ) {
    return this.listingsService.updatePrivately(id, req.user.tenantId, data);
  }

  // Alias para compatibilidade ou criação genérica
  @UseGuards(JwtAuthGuard)
  @Post()
  async createLegacy(@Request() req: any, @Body() data: CreateListingDto) {
    return this.createPrivately(req, data);
  }

  // UPLOAD DE MÍDIA — retorna a URL pública do arquivo salvo
  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
      fileFilter: (_req, file, cb) => {
        const allowed = /\.(jpg|jpeg|png|gif|webp|pdf|doc|docx)$/i;
        if (!allowed.test(extname(file.originalname))) {
          return cb(new BadRequestException('Tipo de arquivo não permitido.'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadMedia(@UploadedFile() file: Express.Multer.File, @Request() req: any) {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado.');
    const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    return { url: `${baseUrl}/uploads/${file.filename}` };
  }
}

