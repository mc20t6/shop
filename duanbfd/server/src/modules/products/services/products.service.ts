import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';

import { ProductRepository } from '../repositories/product.repository';
import { VariantRepository } from '../repositories/variant.repository';

import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly variantRepository: VariantRepository,
  ) {}

  private validateObjectId(id: string, fieldName: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`${fieldName} không hợp lệ`);
    }
  }

  private slugify(text: string) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private async generateUniqueSlug(name: string) {
    const baseSlug = this.slugify(name);
    let slug = baseSlug;
    let count = 1;

    while (await this.productRepository.findBySlug(slug)) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    return slug;
  }

  async create(dto: CreateProductDto) {
    const name = dto.name.trim();

    const slug = dto.slug
      ? dto.slug.trim().toLowerCase()
      : await this.generateUniqueSlug(name);

    const existedProduct = await this.productRepository.findBySlug(slug);

    if (existedProduct) {
      throw new BadRequestException('Slug sản phẩm đã tồn tại');
    }

    return this.productRepository.create({
      categoryId: dto.categoryId ? new Types.ObjectId(dto.categoryId) : null,
      name,
      slug,
      description: dto.description?.trim() || '',
      material: dto.material?.trim() || '',
      careGuide: dto.careGuide?.trim() || '',
      images: dto.images || [],
      isActive: dto.isActive ?? true,
      deletedAt: null,
    });
  }

  async findAll() {
    return this.productRepository.findAll();
  }

  async findActive() {
    return this.productRepository.findActive();
  }

  async findOne(id: string) {
    this.validateObjectId(id, 'productId');

    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    this.validateObjectId(id, 'productId');

    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    if (dto.slug) {
      const slug = dto.slug.trim().toLowerCase();

      const existedSlug = await this.productRepository.findBySlugExceptId(
        slug,
        id,
      );

      if (existedSlug) {
        throw new BadRequestException('Slug sản phẩm đã tồn tại');
      }
    }

    const updateData: any = {
      ...dto,
    };

    if (dto.categoryId) {
      this.validateObjectId(dto.categoryId, 'categoryId');
      updateData.categoryId = new Types.ObjectId(dto.categoryId);
    }

    if (dto.name) {
      updateData.name = dto.name.trim();
    }

    if (dto.slug) {
      updateData.slug = dto.slug.trim().toLowerCase();
    }

    if (dto.description !== undefined) {
      updateData.description = dto.description.trim();
    }

    if (dto.material !== undefined) {
      updateData.material = dto.material.trim();
    }

    if (dto.careGuide !== undefined) {
      updateData.careGuide = dto.careGuide.trim();
    }

    return this.productRepository.updateById(id, updateData);
  }

  async remove(id: string) {
    this.validateObjectId(id, 'productId');

    const product = await this.productRepository.softDeleteById(id);

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    await this.variantRepository.softDeleteByProductId(id);

    return {
      message: 'Xóa sản phẩm thành công',
    };
  }
}
