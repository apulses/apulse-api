import { existsSync } from 'node:fs';
import { DataSource } from 'typeorm';
import { getDatabaseConnectionOptions } from '../core/config/database.config';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

const dataSource = new DataSource({
  ...getDatabaseConnectionOptions(),
  entities: [`${__dirname}/../modules/**/*.entity{.ts,.js}`],
  migrations: [`${__dirname}/migrations/*{.ts,.js}`],
  migrationsTableName: 'typeorm_migrations',
  migrationsRun: false,
  synchronize: false,
});

export default dataSource;
