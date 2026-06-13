import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ReturnRequest, ReturnSchema } from './entities/return.entity';
import { ReturnController } from './return.controller';
import { ReturnService } from './return.service';
import { ReturnRepository } from './repositories/return.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ReturnRequest.name,
        schema: ReturnSchema,
      },
    ]),
  ],
  controllers: [ReturnController],
  providers: [ReturnService, ReturnRepository],
  exports: [ReturnService, ReturnRepository],
})
export class ReturnsModule {}
