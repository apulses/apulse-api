import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function getDatabaseConfig(): TypeOrmModuleOptions {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error('DATABASE_URL is not configured');
  }

  return {
    type: 'postgres',
    url,
    autoLoadEntities: true,
    synchronize: process.env.NODE_ENV === 'development',
  };
}
