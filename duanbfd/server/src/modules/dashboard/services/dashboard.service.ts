import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { DashboardQueryDto } from '../dto/dashboard-query.dto';

import { User, UserDocument } from '../../users/entities/user.entity';
import {
  Product,
  ProductDocument,
} from '../../products/entities/product.entity';
import {
  OrderItem,
  OrderItemDocument,
} from '../../orders/entities/order-item.entity';
import { Order, OrderDocument } from '../../orders/entities/order.entity';
import {
  ReturnRequest,
  ReturnDocument,
} from '../../returns/entities/return.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,

    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,

    @InjectModel(OrderItem.name)
    private readonly orderItemModel: Model<OrderItemDocument>,

    @InjectModel(ReturnRequest.name)
    private readonly returnModel: Model<ReturnDocument>,
  ) {}

  async getDashboard(query: DashboardQueryDto) {
    const currentYear = new Date().getFullYear();

    const year = Number(query.year) || currentYear;

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalReturns,
      revenueResult,
      revenueByMonth,
    ] = await Promise.all([
      this.userModel.countDocuments({
        deletedAt: null,
      }),

      this.productModel.countDocuments({
        deletedAt: null,
      }),

      this.orderModel.countDocuments({
        deletedAt: null,
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      }),

      this.returnModel.countDocuments({
        deletedAt: null,
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      }),

      this.getTotalRevenue(startDate, endDate),

      this.getRevenueByMonth(startDate, endDate),
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    return {
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        totalReturns,
      },

      revenueByMonth,
    };
  }

  private getTotalRevenue(startDate: Date, endDate: Date) {
    return this.orderModel.aggregate([
      {
        $match: {
          deletedAt: null,
          createdAt: {
            $gte: startDate,
            $lt: endDate,
          },

          // Nếu Order của bạn có status khác thì sửa chỗ này
          status: {
            $nin: ['CANCELLED', 'CANCELED'],
          },
        },
      },
      {
        $group: {
          _id: null,

          // Nếu Order của bạn dùng field khác, ví dụ finalAmount,
          // thì đổi '$totalAmount' thành '$finalAmount'
          totalRevenue: {
            $sum: '$totalAmount',
          },
        },
      },
    ]);
  }

  private getRevenueByMonth(startDate: Date, endDate: Date) {
    return this.orderModel.aggregate([
      {
        $match: {
          deletedAt: null,
          createdAt: {
            $gte: startDate,
            $lt: endDate,
          },
          status: {
            $nin: ['CANCELLED', 'CANCELED'],
          },
        },
      },
      {
        $group: {
          _id: {
            month: {
              $month: '$createdAt',
            },
          },
          revenue: {
            $sum: '$totalAmount',
          },
        },
      },
      {
        $project: {
          _id: 0,
          month: '$_id.month',
          revenue: 1,
        },
      },
      {
        $sort: {
          month: 1,
        },
      },
    ]);
  }
}
