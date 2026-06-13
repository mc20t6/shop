import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongoDatabaseModule } from './database/mongodb/mongo-database.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { VouchersModule } from './modules/vouchers/vouchers.module';
import { CartsModule } from './modules/cart/carts.module';
import { OrderModule } from './modules/orders/order.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { ReturnsModule } from './modules/returns/returns.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    MongoDatabaseModule,
    UsersModule,
    AuthModule,
    ProductsModule,
    HealthModule,
    CategoriesModule,
    VouchersModule,
    CartsModule,
    OrderModule,
    TransactionsModule,
    ReturnsModule,
    ReviewsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
