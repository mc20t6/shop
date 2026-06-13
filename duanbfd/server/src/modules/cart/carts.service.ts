import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateCartDto } from './dto/create-cart.dto';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

import { CartRepository } from './repositories/cart.repository';
import { CartItemRepository } from './repositories/cart-item.repository';

import { VariantRepository } from '../products/repositories/variant.repository';

@Injectable()
export class CartsService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly cartItemRepository: CartItemRepository,
    private readonly variantRepository: VariantRepository,
  ) {}

  async createCart(createCartDto: CreateCartDto) {
    const userId = createCartDto.userId.trim();

    const existedCart = await this.cartRepository.findByUserId(userId);

    if (existedCart) {
      throw new BadRequestException('Người dùng này đã có giỏ hàng');
    }

    return this.cartRepository.create({
      userId,
    });
  }

  async getCartByUserId(userId: string) {
    const cart = await this.cartRepository.findOrCreateByUserId(userId);

    const cartId = cart._id.toString();

    const items = await this.cartItemRepository.findByCartId(cartId);

    return {
      cart,
      items,
    };
  }

  async addItemToCart(userId: string, addCartItemDto: AddCartItemDto) {
    const cart = await this.cartRepository.findOrCreateByUserId(userId);

    const cartId = cart._id.toString();
    const variantId = addCartItemDto.variantId.trim();
    const quantity = addCartItemDto.quantity ?? 1;

    if (quantity <= 0) {
      throw new BadRequestException('Số lượng sản phẩm phải lớn hơn 0');
    }

    // Kiểm tra variant có tồn tại trong DB không
    const variant = await this.variantRepository.findAvailableById(variantId);

    if (!variant) {
      throw new NotFoundException('Sản phẩm không tồn tại hoặc đã bị xóa');
    }

    // Kiểm tra sản phẩm đã có trong giỏ chưa
    const existedItem = await this.cartItemRepository.findByCartIdAndVariantId(
      cartId,
      variantId,
    );

    const currentQuantityInCart = existedItem?.quantity ?? 0;
    const totalQuantity = currentQuantityInCart + quantity;

    // Kiểm tra tồn kho
    if (variant.stock < totalQuantity) {
      throw new BadRequestException(
        `Sản phẩm chỉ còn ${variant.stock} sản phẩm trong kho`,
      );
    }

    // Nếu đã có trong giỏ thì cộng thêm số lượng
    if (existedItem) {
      await this.cartItemRepository.increaseQuantity(
        existedItem._id.toString(),
        quantity,
      );

      return this.getCartByUserId(userId);
    }

    // Nếu chưa có thì tạo mới cart item
    await this.cartItemRepository.create({
      cartId,
      variantId,
      quantity,
    });

    return this.getCartByUserId(userId);
  }

  async updateCartItem(itemId: string, updateCartItemDto: UpdateCartItemDto) {
    const item = await this.cartItemRepository.findById(itemId);

    if (!item) {
      throw new NotFoundException('Không tìm thấy sản phẩm trong giỏ hàng');
    }

    const quantity = updateCartItemDto.quantity;

    if (quantity <= 0) {
      throw new BadRequestException('Số lượng sản phẩm phải lớn hơn 0');
    }

    // Kiểm tra variant còn tồn tại không
    const variant = await this.variantRepository.findAvailableById(
      item.variantId,
    );

    if (!variant) {
      throw new NotFoundException('Sản phẩm không tồn tại hoặc đã bị xóa');
    }

    // Kiểm tra tồn kho khi cập nhật số lượng
    if (variant.stock < quantity) {
      throw new BadRequestException(
        `Sản phẩm chỉ còn ${variant.stock} sản phẩm trong kho`,
      );
    }

    const updatedItem = await this.cartItemRepository.updateQuantity(
      itemId,
      quantity,
    );

    return {
      message: 'Cập nhật số lượng thành công',
      item: updatedItem,
    };
  }

  async removeCartItem(itemId: string) {
    const deletedItem = await this.cartItemRepository.deleteById(itemId);

    if (!deletedItem) {
      throw new NotFoundException('Không tìm thấy sản phẩm trong giỏ hàng');
    }

    return {
      message: 'Xóa sản phẩm khỏi giỏ hàng thành công',
      item: deletedItem,
    };
  }

  async clearCart(userId: string) {
    const cart = await this.cartRepository.findByUserId(userId);

    if (!cart) {
      throw new NotFoundException('Không tìm thấy giỏ hàng');
    }

    await this.cartItemRepository.deleteByCartId(cart._id.toString());

    return {
      message: 'Xóa toàn bộ giỏ hàng thành công',
    };
  }
}
