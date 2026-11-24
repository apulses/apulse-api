import { existsSync } from 'node:fs';

async function bootstrap() {
  if (existsSync('.env')) {
    process.loadEnvFile('.env');
  }

  const { NestFactory } = await import('@nestjs/core');
  const { AppModule } = await import('./app.module.js');
  const app = await NestFactory.create(AppModule);
  const corsOrigins = process.env.CORS_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: corsOrigins?.length ? corsOrigins : false,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}

bootstrap();
