import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

interface DatabaseConnectionOptions {
  type: 'postgres';
  url: string;
  ssl: boolean;
}

export function getDatabaseConnectionOptions(): DatabaseConnectionOptions {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error('DATABASE_URL is not configured');
  }

  return {
    type: 'postgres',
    url,
    ssl: new URL(url).hostname.endsWith('.neon.tech'),
  };
}

export function getDatabaseConfig(): TypeOrmModuleOptions {
  return {
    ...getDatabaseConnectionOptions(),
    autoLoadEntities: true,
    synchronize: process.env.NODE_ENV === 'development',
    migrations: [`${__dirname}/../../database/migrations/*{.ts,.js}`],
    migrationsTableName: 'typeorm_migrations',
    migrationsRun: false,
  };
}
