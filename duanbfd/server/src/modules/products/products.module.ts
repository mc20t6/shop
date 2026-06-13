import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Product, ProductSchema } from './entities/product.entity';
import { Variant, VariantSchema } from './entities/variant.entity';

import { ProductsController } from './controllers/products.controller';
import { VariantsController } from './controllers/variants.controller';

import { ProductsService } from './services/products.service';
import { VariantsService } from './services/variants.service';

import { ProductRepository } from './repositories/product.repository';
import { VariantRepository } from './repositories/variant.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Product.name,
        schema: ProductSchema,
      },
      {
        name: Variant.name,
        schema: VariantSchema,
      },
    ]),
  ],
  controllers: [ProductsController, VariantsController],
  providers: [
    ProductsService,
    VariantsService,
    ProductRepository,
    VariantRepository,
  ],
  exports: [
    ProductsService,
    VariantsService,
    ProductRepository,
    VariantRepository,
  ],
})
export class ProductsModule {}
