import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  Column,
} from 'typeorm';

import { Order } from '../../order/entities/order.entity';
import { Invoice } from './invoice.entity';

@Entity('order_invoice')
@Unique('UQ_order_invoice', ['orderId', 'invoiceId'])
export class OrderInvoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @ManyToOne(() => Order, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'invoice_id', type: 'uuid' })
  invoiceId: string;

  @ManyToOne(() => Invoice, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;
}
