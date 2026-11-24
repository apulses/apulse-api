import { Module } from '@nestjs/common';
import { CategoryModule } from '../modules/category/category.module';
import { VisitorModule } from '../modules/visitor/visitor.module';
import { AnalyticModule } from '../modules/analytic/analytic.module';
import { OfferModule } from 'src/modules/offer/offer.module';

@Module({
  imports: [CategoryModule, VisitorModule, AnalyticModule, OfferModule],
})
export class CoreModules {}
