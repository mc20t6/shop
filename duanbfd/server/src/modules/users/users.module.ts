import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';

import { User, UserSchema } from './entities/user.entity';
import { Address, AddressSchema } from './entities/address.entity';

import { UserRepository } from './repositories/user.repository';
import { AddressRepository } from './repositories/address.repository';

import { ProfileController } from './controllers/profile.controller';
import { AddressesController } from './controllers/addresses.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Address.name,
        schema: AddressSchema,
      },
    ]),
  ],
  controllers: [UsersController, ProfileController, AddressesController],
  providers: [UsersService, UserRepository, AddressRepository],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}
