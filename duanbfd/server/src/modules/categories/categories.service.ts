import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryRepository } from './repositories/category.repository';
import { ProductRepository } from '../products/repositories/product.repository';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  private validateObjectId(id: string, fieldName = 'id') {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`${fieldName} không hợp lệ`);
    }
  }

  private formatCategory(category: any, productCount = 0) {
    const item =
      typeof category.toObject === 'function' ? category.toObject() : category;

    return {
      ...item,
      id: item._id?.toString() || item.id?.toString(),
      productCount,
    };
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const name = createCategoryDto.name.trim();

    const existedCategory = await this.categoryRepository.findByName(name);

    if (existedCategory) {
      throw new BadRequestException('Tên danh mục đã tồn tại');
    }

    return this.categoryRepository.create({
      name,
      description: createCategoryDto.description?.trim() ?? '',
      image: createCategoryDto.image || '',
      isActive: createCategoryDto.isActive ?? true,
    });
  }

  async findAll() {
    const categories = await this.categoryRepository.findAll();

    return Promise.all(
      categories.map(async (category: any) => {
        const item =
          typeof category.toObject === 'function'
            ? category.toObject()
            : category;

        const categoryId = item._id?.toString() || item.id?.toString();

        const productCount =
          await this.productRepository.countByCategoryId(categoryId);

        return {
          ...item,
          id: categoryId,
          productCount,
        };
      }),
    );
  }

  async findOne(id: string) {
    this.validateObjectId(id);

    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    const productCount = await this.productRepository.countByCategoryId(id);

    return this.formatCategory(category, productCount);
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    this.validateObjectId(id);

    const currentCategory = await this.categoryRepository.findById(id);

    if (!currentCategory) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    if (updateCategoryDto.name) {
      const name = updateCategoryDto.name.trim();

      const existedCategory = await this.categoryRepository.findByName(name);

      if (
        existedCategory &&
        existedCategory.id.toString() !== currentCategory.id.toString()
      ) {
        throw new BadRequestException('Tên danh mục đã tồn tại');
      }

      updateCategoryDto.name = name;
    }

    const data = {
      ...updateCategoryDto,
      description: updateCategoryDto.description?.trim(),
      image: updateCategoryDto.image?.trim(),
    };

    return this.categoryRepository.update(id, data);
  }

  async remove(id: string) {
    this.validateObjectId(id);

    const category = await this.categoryRepository.softDelete(id);

    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    return {
      message: 'Xóa danh mục thành công',
      category,
    };
  }

  async getProductCount(id: string) {
    this.validateObjectId(id);

    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    const productCount = await this.productRepository.countByCategoryId(id);

    return {
      categoryId: id,
      productCount,
    };
  }
}
