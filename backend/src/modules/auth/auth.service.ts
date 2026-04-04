import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CryptoService } from './crypto.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private cryptoService: CryptoService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: { email },
      include: { tenant: true },
    });

    if (user && (await this.cryptoService.comparePassword(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }

    return null;
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: {
        id: user.id,
        email: user.email,
        tenantId: user.tenantId,
        role: user.role,
      },
    };
  }

  async refreshToken(user: any) {
    return this.login(user);
  }

  async registerUser(data: any) {
    const existing = await this.prisma.user.findFirst({
      where: { email: data.email },
    });

    if (existing) {
      throw new UnauthorizedException('E-mail já registrado neste Tenant.');
    }

    const hash = await this.cryptoService.hashPassword(data.password);

    const tenantId = data.tenantId;

    return this.prisma.user.create({
      data: {
        email: data.email,
        fullName: data.fullName,
        passwordHash: hash,
        tenantId,
        role: 'USER',
      },
    });
  }
}
