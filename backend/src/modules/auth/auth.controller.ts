import { Controller, Post, Body, UnauthorizedException, Get, UseGuards, Request } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { LoginDto, RegisterDto, ResendVerificationDto, VerifyEmailDto, ForgotPasswordDto, ResetPasswordDto, AcceptInviteDto } from './dto/create-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ global: { ttl: 60000, limit: 5 } })
  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.authService.registerUser(body);
  }

  @Throttle({ global: { ttl: 60000, limit: 10 } })
  @Post('verify-email')
  async verify(@Body() body: VerifyEmailDto) {
    return this.authService.verifyEmail(body.email, body.code);
  }

  @Throttle({ global: { ttl: 60000, limit: 3 } })
  @Post('resend-verification')
  async resend(@Body() body: ResendVerificationDto) {
    return this.authService.resendVerification(body.email);
  }

  @Throttle({ global: { ttl: 60000, limit: 10 } })
  @Post('login')
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    return this.authService.login(user);
  }

  @Throttle({ global: { ttl: 60000, limit: 5 } })
  @Post('accept-invite')
  async acceptInvite(@Body() body: AcceptInviteDto) {
    return this.authService.acceptInvite(body.email, body.code, body.password);
  }

  @Throttle({ global: { ttl: 60000, limit: 3 } })
  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body.email);
  }

  @Throttle({ global: { ttl: 60000, limit: 5 } })
  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body.email, body.code, body.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refreshToken(@Request() req) {
    return this.authService.refreshToken(req.user);
  }
}
