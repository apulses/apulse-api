import { Module } from '@nestjs/common';
import { CategoryModule } from '../modules/category/category.module';
import { VisitorModule } from 'src/modules/visitor/visitor.module';

@Module({
  imports: [CategoryModule, VisitorModule],
})
export class CoreModules {}
