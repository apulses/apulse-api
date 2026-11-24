import { Pool, type PoolConfig } from 'pg';

export function createDatabasePool(): Pool {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is not configured');
  }

  const config: PoolConfig = { connectionString };
  return new Pool(config);
}
