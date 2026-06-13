import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { DashboardController } from './controllers/dashboard.controller';
import { DashboardService } from './services/dashboard.service';

import { User, UserSchema } from '../users/entities/user.entity';
import { Product, ProductSchema } from '../products/entities/product.entity';
import { Order, OrderSchema } from '../orders/entities/order.entity';
import { ReturnRequest, ReturnSchema } from '../returns/entities/return.entity';
import {
  OrderItem,
  OrderItemSchema,
} from '../orders/entities/order-item.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Product.name,
        schema: ProductSchema,
      },
      {
        name: Order.name,
        schema: OrderSchema,
      },
      {
        name: OrderItem.name,
        schema: OrderItemSchema,
      },
      {
        name: ReturnRequest.name,
        schema: ReturnSchema,
      },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
