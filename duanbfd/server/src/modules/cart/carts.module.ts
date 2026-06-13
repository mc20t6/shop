import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Cart, CartSchema } from './entities/cart.entity';
import { CartItem, CartItemSchema } from './entities/cart-item.entity';

import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';

import { CartRepository } from './repositories/cart.repository';
import { CartItemRepository } from './repositories/cart-item.repository';

import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    ProductsModule,
    MongooseModule.forFeature([
      {
        name: Cart.name,
        schema: CartSchema,
      },
      {
        name: CartItem.name,
        schema: CartItemSchema,
      },
    ]),
  ],
  controllers: [CartsController],
  providers: [CartsService, CartRepository, CartItemRepository],
  exports: [CartsService, CartRepository, CartItemRepository],
})
export class CartsModule {}
