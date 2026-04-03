import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['error', 'warn'],
    });
  }

  async onModuleInit() {
    // No ambiente Docker Real ele tentará se conectar
    // No mock ele aguarda passivamente.
    try {
      await this.$connect();
      console.log('✅ Base de dados Prisma connectada.');
    } catch (e) {
      console.warn('⚠️ Conexão ao DB indisponível temporariamente (Docker parado?):', e.message);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
