import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderRepository } from './repositories/order.repository';
import { OrderItemRepository } from './repositories/order-item.repository';
import { Order, OrderSchema } from './entities/order.entity';
import { OrderItem, OrderItemSchema } from './entities/order-item.entity';

// Sửa lại đường dẫn này đúng với project của bạn
import { Variant, VariantSchema } from '../products/entities/variant.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Order.name,
        schema: OrderSchema,
      },
      {
        name: OrderItem.name,
        schema: OrderItemSchema,
      },
      {
        name: Variant.name,
        schema: VariantSchema,
      },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository, OrderItemRepository],
  exports: [OrderService],
})
export class OrderModule {}
