import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = Number(process.env.PORT || 3000);
  
  app.enableCors(); // Opcional: especificar origens se necessário EX: { origin: 'http://localhost:3001' }

  await app.listen(port, '0.0.0.0');

  console.log('🚀 SERVER STARTED');
  console.log('PORT:', port);
}

bootstrap();