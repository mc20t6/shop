import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';

import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { VerifyReviewDto } from './dto/verify-review.dto';
import { ReviewService } from './review.service';
import { imageUploadOptions } from '../../common/upload/image-upload.util';
import { FilesInterceptor } from '@nestjs/platform-express/multer/interceptors/files.interceptor';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // @Post()
  // create(@Body() createReviewDto: CreateReviewDto) {
  //   return this.reviewService.create(createReviewDto);
  // }

  @Post()
  @UseInterceptors(FilesInterceptor('images', 5, imageUploadOptions('reviews')))
  create(
    @Body() createReviewDto: CreateReviewDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    createReviewDto.images =
      files?.map((file) => `/uploads/reviews/${file.filename}`) || [];

    return this.reviewService.create(createReviewDto);
  }

  @Get()
  findAll() {
    return this.reviewService.findAll();
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.reviewService.findByUserId(userId);
  }

  @Get('product/:productId')
  findByProductId(@Param('productId') productId: string) {
    return this.reviewService.findByProductId(productId);
  }

  @Get('order/:orderId')
  findByOrderId(@Param('orderId') orderId: string) {
    return this.reviewService.findByOrderId(orderId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewService.update(id, updateReviewDto);
  }

  @Patch(':id/verify')
  verify(@Param('id') id: string, @Body() verifyReviewDto: VerifyReviewDto) {
    return this.reviewService.verify(id, verifyReviewDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewService.remove(id);
  }
}
