import { Module } from '@nestjs/common';
import { CategoryModule } from '../modules/category/category.module';
import { VisitorModule } from '../modules/visitor/visitor.module';
import { AnalyticModule } from '../modules/analytic/analytic.module';
import { OfferModule } from 'src/modules/offer/offer.module';
import { RoleModule } from 'src/modules/role/role.module';
import { PermissionModule } from 'src/modules/permission/permission.module';

@Module({
  imports: [
    CategoryModule,
    VisitorModule,
    AnalyticModule,
    OfferModule,
    RoleModule,
    PermissionModule,
  ],
})
export class CoreModules {}
