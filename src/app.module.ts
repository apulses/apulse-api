import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreModules } from './core/core.module';
import { getDatabaseConfig } from './core/config/database.config';

@Module({
  imports: [TypeOrmModule.forRoot(getDatabaseConfig()), CoreModules],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
