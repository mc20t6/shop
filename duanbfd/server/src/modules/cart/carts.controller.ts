import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  createCart(@Body() createCartDto: CreateCartDto) {
    return this.cartsService.createCart(createCartDto);
  }

  @Get('user/:userId')
  getCartByUserId(@Param('userId') userId: string) {
    return this.cartsService.getCartByUserId(userId);
  }

  @Post('user/:userId/items')
  addItemToCart(
    @Param('userId') userId: string,
    @Body() addCartItemDto: AddCartItemDto,
  ) {
    return this.cartsService.addItemToCart(userId, addCartItemDto);
  }

  @Patch('items/:itemId')
  updateCartItem(
    @Param('itemId') itemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartsService.updateCartItem(itemId, updateCartItemDto);
  }

  @Delete('items/:itemId')
  removeCartItem(@Param('itemId') itemId: string) {
    return this.cartsService.removeCartItem(itemId);
  }

  @Delete('user/:userId/items')
  clearCart(@Param('userId') userId: string) {
    return this.cartsService.clearCart(userId);
  }
}
