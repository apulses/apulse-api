import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { OrderInvoice } from './entities/order-invoice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, OrderInvoice])],
})
export class InvoiceModule {}
