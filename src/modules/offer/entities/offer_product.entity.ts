import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { Offer } from './offer.entity';

@Entity('offer_product')
export class OfferProduct {
  @PrimaryColumn({ name: 'offer_id', type: 'uuid' })
  offerId: string;

  @PrimaryColumn({ name: 'product_id', type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Offer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'offer_id' })
  offer: Offer;
}
