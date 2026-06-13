import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';

import { ProductRepository } from '../repositories/product.repository';
import { VariantRepository } from '../repositories/variant.repository';

import { CreateVariantDto } from '../dto/create-variant.dto';
import { UpdateVariantDto } from '../dto/update-variant.dto';

@Injectable()
export class VariantsService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly variantRepository: VariantRepository,
  ) {}

  private validateObjectId(id: string, fieldName: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`${fieldName} không hợp lệ`);
    }
  }

  async create(
    productId: string,
    dto: CreateVariantDto,
    file?: Express.Multer.File,
  ) {
    this.validateObjectId(productId, 'productId');

    const product = await this.productRepository.existsById(productId);

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    const sku = dto.sku.trim().toUpperCase();

    const existedSku = await this.variantRepository.findBySku(sku);

    if (existedSku) {
      throw new BadRequestException('SKU đã tồn tại');
    }

    const image = file
      ? `/uploads/images/${file.filename}`
      : dto.image?.trim() || '';

    return this.variantRepository.create({
      productId: new Types.ObjectId(productId),
      size: dto.size.trim(),
      color: dto.color.trim(),
      sku,
      stock: Number(dto.stock ?? 0),
      price: Number(dto.price ?? 0),
      image,
      isActive: true,
      deletedAt: null,
    });
  }

  async findByProduct(productId: string) {
    this.validateObjectId(productId, 'productId');

    const product = await this.productRepository.existsById(productId);

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    return this.variantRepository.findByProductId(productId);
  }

  async findOne(productId: string, variantId: string) {
    this.validateObjectId(productId, 'productId');
    this.validateObjectId(variantId, 'variantId');

    const variant = await this.variantRepository.findByIdAndProductId(
      productId,
      variantId,
    );

    if (!variant) {
      throw new NotFoundException('Không tìm thấy biến thể sản phẩm');
    }

    return variant;
  }

  async update(productId: string, variantId: string, dto: UpdateVariantDto) {
    this.validateObjectId(productId, 'productId');
    this.validateObjectId(variantId, 'variantId');

    const variant = await this.variantRepository.findByIdAndProductId(
      productId,
      variantId,
    );

    if (!variant) {
      throw new NotFoundException('Không tìm thấy biến thể sản phẩm');
    }

    if (dto.sku) {
      const sku = dto.sku.trim().toUpperCase();

      const existedSku = await this.variantRepository.findBySkuExceptId(
        sku,
        variantId,
      );

      if (existedSku) {
        throw new BadRequestException('SKU đã tồn tại');
      }
    }

    const updateData: any = { ...dto };

    if (dto.size) updateData.size = dto.size.trim();
    if (dto.color) updateData.color = dto.color.trim();
    if (dto.sku) updateData.sku = dto.sku.trim().toUpperCase();

    if (dto.image !== undefined) {
      updateData.image = dto.image.trim();
    }

    return this.variantRepository.updateByIdAndProductId(
      productId,
      variantId,
      updateData,
    );
  }

  async remove(productId: string, variantId: string) {
    this.validateObjectId(productId, 'productId');
    this.validateObjectId(variantId, 'variantId');

    const variant = await this.variantRepository.softDeleteByIdAndProductId(
      productId,
      variantId,
    );

    if (!variant) {
      throw new NotFoundException('Không tìm thấy biến thể sản phẩm');
    }

    return {
      message: 'Xóa biến thể sản phẩm thành công',
    };
  }
}
