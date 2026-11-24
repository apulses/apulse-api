import { Module } from '@nestjs/common';
import { OfferService } from './offer.service';
import { OfferController } from './offer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { OfferOrder } from './entities/offer_order.entity';
import { OfferProduct } from './entities/offer_product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Offer, OfferOrder, OfferProduct])],
  controllers: [OfferController],
  providers: [OfferService],
})
export class OfferModule {}
