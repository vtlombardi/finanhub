import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('matching')
@UseGuards(AuthGuard('jwt'))
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  /**
   * Obtém as recomendações personalizadas para o investidor logado.
   */
  @Get('recommended')
  async getRecommended(@Request() req, @Query('limit') limit?: string) {
    return this.matchingService.getRecommendedListings(
      req.user.id, 
      limit ? parseInt(limit) : 10
    );
  }

  /**
   * Obtém os investidores mais aderentes para um anúncio (para o dono do anúncio).
   */
  @Get('listing/:id/matches')
  async getListingMatches(@Param('id') id: string, @Query('limit') limit?: string) {
    return this.matchingService.getTopMatchesForListing(
      id, 
      limit ? parseInt(limit) : 5
    );
  }

  /**
   * Calcula o score pontual entre o usuário logado e um anúncio específico.
   */
  @Get('listing/:id/score')
  async getSingleScore(@Request() req, @Param('id') id: string) {
    return this.matchingService.calculateMatchScore(req.user.id, id);
  }
}
