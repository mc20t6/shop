import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Voucher, VoucherSchema } from './entities/voucher.entity';
import { VouchersController } from './vouchers.controller';
import { VouchersService } from './vouchers.service';
import { VoucherRepository } from './repositories/voucher.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Voucher.name,
        schema: VoucherSchema,
      },
    ]),
  ],
  controllers: [VouchersController],
  providers: [VouchersService, VoucherRepository],
  exports: [VouchersService, VoucherRepository],
})
export class VouchersModule {}
