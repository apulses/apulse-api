import { existsSync } from 'node:fs';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createDatabasePool } from './core/config/database.config';

async function bootstrap() {
  if (existsSync('.env')) {
    process.loadEnvFile('.env');
  }

  const database = createDatabasePool();
  await database.query('SELECT 1');

  const app = await NestFactory.create(AppModule);
  const corsOrigins = process.env.CORS_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.setGlobalPrefix('api');
  app.enableCors({ origin: corsOrigins?.length ? corsOrigins : false });

  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}

bootstrap();
