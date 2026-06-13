import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { VariantsService } from '../services/variants.service';
import { CreateVariantDto } from '../dto/create-variant.dto';
import { UpdateVariantDto } from '../dto/update-variant.dto';

import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { imageUploadOptions } from '../../../common/upload/image-upload.util';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('products/:productId/variants')
//@UseGuards(JwtAuthGuard, RolesGuard)
//@Roles(UserRole.ADMIN, UserRole.STAFF)
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) { }

  // @Post()
  // create(@Param('productId') productId: string, @Body() dto: CreateVariantDto) {
  //   return this.variantsService.create(productId, dto);
  // }

  @Post()
  @UseInterceptors(FileInterceptor('image', imageUploadOptions('variants')))
  create(
    @Param('productId') productId: string,
    @Body() createVariantDto: CreateVariantDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      createVariantDto.image = `/uploads/variants/${file.filename}`;
    }

    return this.variantsService.create(productId, createVariantDto);
  }

  @Get()
  findByProduct(@Param('productId') productId: string) {
    return this.variantsService.findByProduct(productId);
  }

  @Get(':variantId')
  findOne(
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
  ) {
    return this.variantsService.findOne(productId, variantId);
  }

  @Patch(':variantId')
  update(
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
    @Body() dto: UpdateVariantDto,
  ) {
    return this.variantsService.update(productId, variantId, dto);
  }

  @Delete(':variantId')
  remove(
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
  ) {
    return this.variantsService.remove(productId, variantId);
  }
}
