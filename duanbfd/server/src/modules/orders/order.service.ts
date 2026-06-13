import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';

import { Order, OrderStatus, PaymentStatus } from './entities/order.entity';

import { OrderRepository } from './repositories/order.repository';
import { OrderItemRepository } from './repositories/order-item.repository';

import { Variant, VariantDocument } from '../products/entities/variant.entity';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly orderItemRepository: OrderItemRepository,

    @InjectModel(Variant.name)
    private readonly variantModel: Model<VariantDocument>,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    if (!createOrderDto.items || createOrderDto.items.length === 0) {
      throw new BadRequestException('Đơn hàng phải có ít nhất 1 sản phẩm');
    }

    const normalizedItems = this.normalizeItems(createOrderDto.items);
    const variantIds = normalizedItems.map((item) => item.variantId);

    const variants = await this.variantModel
      .find({
        _id: {
          $in: variantIds.map((id) => new Types.ObjectId(id)),
        },
        deletedAt: null,
      })
      .exec();

    if (variants.length !== variantIds.length) {
      throw new NotFoundException(
        'Một hoặc nhiều biến thể sản phẩm không tồn tại',
      );
    }

    const variantMap = new Map<string, VariantDocument>();

    variants.forEach((variant) => {
      variantMap.set((variant._id as Types.ObjectId).toString(), variant);
    });

    let subtotal = 0;

    const orderItemsData = normalizedItems.map((item) => {
      const variant = variantMap.get(item.variantId);

      if (!variant) {
        throw new NotFoundException('Biến thể sản phẩm không tồn tại');
      }

      const variantAny = variant as any;

      const stock = Number(variantAny.stock ?? 0);
      const unitPrice = Number(variantAny.salePrice ?? variantAny.price ?? 0);

      if (stock < item.quantity) {
        throw new BadRequestException(
          `Sản phẩm ${variantAny.sku ?? item.variantId} không đủ tồn kho`,
        );
      }

      if (!unitPrice || unitPrice <= 0) {
        throw new BadRequestException(
          `Sản phẩm ${variantAny.sku ?? item.variantId} chưa có giá hợp lệ`,
        );
      }

      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      return {
        variantId: item.variantId,
        productId: variantAny.productId?.toString(),
        size: variantAny.size,
        color: variantAny.color,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      };
    });

    const shippingFee = createOrderDto.shippingFee ?? 0;
    const discountAmount = 0;
    const totalAmount = subtotal + shippingFee - discountAmount;

    const decreasedStocks: { variantId: string; quantity: number }[] = [];
    let createdOrder: Order | null = null;

    try {
      for (const item of normalizedItems) {
        const updatedVariant = await this.variantModel
          .findOneAndUpdate(
            {
              _id: new Types.ObjectId(item.variantId),
              deletedAt: null,
              stock: { $gte: item.quantity },
            },
            {
              $inc: {
                stock: -item.quantity,
              },
            },
            { new: true },
          )
          .exec();

        if (!updatedVariant) {
          throw new BadRequestException(
            'Sản phẩm vừa hết hàng hoặc không đủ tồn kho',
          );
        }

        decreasedStocks.push({
          variantId: item.variantId,
          quantity: item.quantity,
        });
      }

      const orderCode = await this.generateOrderCode();

      createdOrder = await this.orderRepository.create({
        orderCode,
        userId: createOrderDto.userId,
        voucherId: createOrderDto.voucherId,
        status: OrderStatus.PENDING,
        paymentMethod: createOrderDto.paymentMethod,
        paymentStatus: PaymentStatus.PENDING,
        subtotal,
        shippingFee,
        discountAmount,
        totalAmount,
        shippingName: createOrderDto.shippingName.trim(),
        shippingPhone: createOrderDto.shippingPhone.trim(),
        shippingAddress: createOrderDto.shippingAddress.trim(),
        deletedAt: null,
      });

      const orderId = ((createdOrder as any)._id as Types.ObjectId).toString();

      await this.orderItemRepository.createMany(
        orderItemsData.map((item) => ({
          ...item,
          orderId,
        })),
      );

      return this.findById(orderId);
    } catch (error) {
      for (const item of decreasedStocks) {
        await this.variantModel
          .updateOne(
            {
              _id: new Types.ObjectId(item.variantId),
            },
            {
              $inc: {
                stock: item.quantity,
              },
            },
          )
          .exec();
      }

      if (createdOrder) {
        const orderId = (
          (createdOrder as any)._id as Types.ObjectId
        ).toString();
        await this.orderRepository.softDelete(orderId);
      }

      throw error;
    }
  }

  async findAll() {
    return this.orderRepository.findAll();
  }

  async findByUserId(userId: string) {
    return this.orderRepository.findByUserId(userId);
  }

  async findById(id: string) {
    this.validateObjectId(id, 'orderId');

    const order = await this.orderRepository.findById(id);

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    const items = await this.orderItemRepository.findByOrderId(id);

    return {
      ...(order as any).toObject(),
      items,
    };
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    this.validateObjectId(id, 'orderId');

    const order = await this.orderRepository.findById(id);

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    if (order.status === dto.status) {
      return this.findById(id);
    }

    this.validateStatusTransition(order.status, dto.status);

    if (dto.status === OrderStatus.CANCELLED) {
      await this.restoreStock(id);
    }

    const updatedOrder = await this.orderRepository.update(id, {
      status: dto.status,
      trackingCode: dto.trackingCode,
      shippingProvider: dto.shippingProvider,
    });

    if (!updatedOrder) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    return this.findById(id);
  }

  async updatePaymentStatus(id: string, dto: UpdatePaymentStatusDto) {
    this.validateObjectId(id, 'orderId');

    const order = await this.orderRepository.findById(id);

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    const updatedOrder = await this.orderRepository.update(id, {
      paymentStatus: dto.paymentStatus,
    });

    if (!updatedOrder) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    return this.findById(id);
  }

  async cancel(id: string) {
    this.validateObjectId(id, 'orderId');

    const order = await this.orderRepository.findById(id);

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    if (![OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.status)) {
      throw new BadRequestException(
        'Chỉ có thể hủy đơn khi đơn đang chờ xử lý hoặc đã xác nhận',
      );
    }

    await this.restoreStock(id);

    await this.orderRepository.update(id, {
      status: OrderStatus.CANCELLED,
    });

    return this.findById(id);
  }

  async softDelete(id: string) {
    this.validateObjectId(id, 'orderId');

    const order = await this.orderRepository.softDelete(id);

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    return {
      message: 'Xóa đơn hàng thành công',
    };
  }

  private normalizeItems(items: { variantId: string; quantity: number }[]) {
    const map = new Map<string, number>();

    for (const item of items) {
      map.set(item.variantId, (map.get(item.variantId) ?? 0) + item.quantity);
    }

    return Array.from(map.entries()).map(([variantId, quantity]) => ({
      variantId,
      quantity,
    }));
  }

  private async generateOrderCode() {
    for (let i = 0; i < 5; i++) {
      const random = Math.floor(100000 + Math.random() * 900000);
      const orderCode = `ORD-${Date.now()}-${random}`;

      const existedOrder =
        await this.orderRepository.findByOrderCode(orderCode);

      if (!existedOrder) {
        return orderCode;
      }
    }

    throw new BadRequestException('Không thể tạo mã đơn hàng');
  }

  private validateObjectId(id: string, fieldName: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`${fieldName} không hợp lệ`);
    }
  }

  private validateStatusTransition(
    currentStatus: OrderStatus,
    nextStatus: OrderStatus,
  ) {
    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PACKING, OrderStatus.CANCELLED],
      [OrderStatus.PACKING]: [OrderStatus.SHIPPING, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPING]: [
        OrderStatus.DELIVERED,
        OrderStatus.RETURN_REQUESTED,
      ],
      [OrderStatus.DELIVERED]: [
        OrderStatus.COMPLETED,
        OrderStatus.RETURN_REQUESTED,
      ],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.RETURN_REQUESTED]: [
        OrderStatus.CANCELLED,
        OrderStatus.COMPLETED,
      ],
    };

    if (!allowedTransitions[currentStatus].includes(nextStatus)) {
      throw new BadRequestException(
        `Không thể chuyển trạng thái từ ${currentStatus} sang ${nextStatus}`,
      );
    }
  }

  private async restoreStock(orderId: string) {
    const orderItems = await this.orderItemRepository.findByOrderId(orderId);

    for (const item of orderItems) {
      await this.variantModel
        .updateOne(
          {
            _id: new Types.ObjectId(item.variantId),
          },
          {
            $inc: {
              stock: item.quantity,
            },
          },
        )
        .exec();
    }
  }
}
