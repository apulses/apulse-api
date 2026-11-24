import { Module } from '@nestjs/common';
import { CategoryModule } from 'src/modules/category/category.module';

@Module({
  imports: [CategoryModule],
})
export class CoreModules {}
