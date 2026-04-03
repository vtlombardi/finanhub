import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CryptoService } from '../auth/crypto.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private cryptoService: CryptoService
  ) {}

  async findAllByTenant(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId },
      select: { id: true, email: true, fullName: true, role: true, createdAt: true }
    });
  }

  async createUser(data: any) {
    const existing = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId: data.tenantId, email: data.email } }
    });

    if (existing) {
      throw new ConflictException('Email já existe no escopo desta Tenant.');
    }

    const hashedPassword = await this.cryptoService.hashPassword(data.password);

    return this.prisma.user.create({
      data: {
        tenantId: data.tenantId,
        email: data.email,
        passwordHash: hashedPassword,
        fullName: data.fullName,
        role: data.role || 'USER',
      },
      select: { id: true, email: true, fullName: true, tenantId: true }
    });
  }
}
