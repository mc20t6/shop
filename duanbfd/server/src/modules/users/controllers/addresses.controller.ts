import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';

import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { CreateAddressDto } from '../dto/create-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';

type RequestWithUser = Request & {
  user: {
    id?: string;
    userId?: string;
    sub?: string;
  };
};

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getMyAddresses(@Req() req: RequestWithUser) {
    const userId = req.user.id || req.user.userId || req.user.sub;
    if (!userId) {
      throw new BadRequestException('Không lấy được thông tin người dùng');
    }
    return this.usersService.getAddressesByUserId(userId);
  }

  @Post()
  createAddress(
    @Req() req: RequestWithUser,
    @Body() createAddressDto: CreateAddressDto,
  ) {
    const userId = req.user.id || req.user.userId || req.user.sub;
    if (!userId) {
      throw new BadRequestException('Không lấy được thông tin người dùng');
    }
    return this.usersService.createAddress(userId, createAddressDto);
  }

  @Get(':id')
  getAddress(@Req() req: RequestWithUser, @Param('id') id: string) {
    const userId = req.user.id || req.user.userId || req.user.sub;
    if (!userId) {
      throw new BadRequestException('Không lấy được thông tin người dùng');
    }
    return this.usersService.getAddressById(userId, id);
  }

  @Patch(':id')
  updateAddress(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    const userId = req.user.id || req.user.userId || req.user.sub;
    if (!userId) {
      throw new BadRequestException('Không lấy được thông tin người dùng');
    }
    return this.usersService.updateAddress(userId, id, updateAddressDto);
  }

  @Delete(':id')
  deleteAddress(@Req() req: RequestWithUser, @Param('id') id: string) {
    const userId = req.user.id || req.user.userId || req.user.sub;
    if (!userId) {
      throw new BadRequestException('Không lấy được thông tin người dùng');
    }
    return this.usersService.deleteAddress(userId, id);
  }
}
