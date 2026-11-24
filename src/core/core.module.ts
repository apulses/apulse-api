import { Module } from '@nestjs/common';
import { CategoryModule } from '../modules/category/category.module';
import { VisitorModule } from '../modules/visitor/visitor.module';
import { AnalyticModule } from '../modules/analytic/analytic.module';
import { OfferModule } from 'src/modules/offer/offer.module';
import { RoleModule } from 'src/modules/role/role.module';
import { PermissionModule } from 'src/modules/permission/permission.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { CartModule } from '../modules/cart/cart.module';
import { InvoiceModule } from '../modules/invoice/invoice.module';
import { NotificationModule } from '../modules/notification/notification.module';
import { OrderModule } from '../modules/order/order.module';
import { PaymentModule } from '../modules/payment/payment.module';
import { ProductModule } from '../modules/product/product.module';
import { TaskModule } from '../modules/task/task.module';
import { UserModule } from '../modules/user/user.module';

@Module({
  imports: [
    CategoryModule,
    VisitorModule,
    AnalyticModule,
    OfferModule,
    RoleModule,
    PermissionModule,
    AuthModule,
    CartModule,
    InvoiceModule,
    NotificationModule,
    OrderModule,
    PaymentModule,
    ProductModule,
    TaskModule,
    UserModule,
  ],
})
export class CoreModules {}
