import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModules } from './core/core.module';
import { DatabaseModule } from './core/database.module';

@Module({
  imports: [DatabaseModule, CoreModules],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
