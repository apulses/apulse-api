import { Module } from '@nestjs/common';
import { AnalyticService } from './analytic.service';
import { AnalyticController } from './analytic.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsDailySummary } from './entities/analytics-daily-summary.entity';
import { AnalyticsEvent } from './entities/analytics-event.entity';
import { VisitorSession } from './entities/visitor-session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnalyticsDailySummary,
      AnalyticsEvent,
      VisitorSession,
    ]),
  ],
  controllers: [AnalyticController],
  providers: [AnalyticService],
})
export class AnalyticModule {}
