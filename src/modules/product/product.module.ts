import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductLike } from './entities/products_likes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductLike])],
})
export class ProductModule {}
