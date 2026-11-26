import {
  Injectable,
  Logger,
  Module,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { getDatabaseConfig } from './config/database.config';

@Injectable()
class DatabaseInitializationLogger implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseInitializationLogger.name);

  constructor(private readonly dataSource: DataSource) {}

  onApplicationBootstrap(): void {
    this.logger.log(
      `PostgreSQL connected; entities=${this.dataSource.entityMetadatas.length}; schema synchronization=${this.dataSource.options.synchronize === true ? 'enabled' : 'disabled'}; migrations=${this.dataSource.options.migrationsRun === true ? 'automatic' : 'manual'}`,
    );
  }
}

@Module({
  imports: [TypeOrmModule.forRoot(getDatabaseConfig())],
  providers: [DatabaseInitializationLogger],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
