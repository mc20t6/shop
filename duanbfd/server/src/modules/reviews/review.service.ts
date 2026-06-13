import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { VerifyReviewDto } from './dto/verify-review.dto';
import { ReviewRepository } from './repositories/review.repository';

@Injectable()
export class ReviewService {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async create(createReviewDto: CreateReviewDto) {
    const existedReview = await this.reviewRepository.findExistingReview(
      createReviewDto.userId,
      createReviewDto.productId,
      createReviewDto.orderId,
    );

    if (existedReview) {
      throw new ConflictException(
        'Bạn đã đánh giá sản phẩm này trong đơn hàng này',
      );
    }

    return this.reviewRepository.create({
      ...createReviewDto,
      comment: createReviewDto.comment?.trim() || '',
      images: createReviewDto.images || [],
      isVerified: false,
    });
  }

  async findAll() {
    return this.reviewRepository.findAll();
  }

  async findOne(id: string) {
    const review = await this.reviewRepository.findById(id);

    if (!review) {
      throw new NotFoundException('Không tìm thấy đánh giá');
    }

    return review;
  }

  async findByUserId(userId: string) {
    return this.reviewRepository.findByUserId(userId);
  }

  async findByProductId(productId: string) {
    return this.reviewRepository.findByProductId(productId);
  }

  async findByOrderId(orderId: string) {
    return this.reviewRepository.findByOrderId(orderId);
  }

  async update(id: string, updateReviewDto: UpdateReviewDto) {
    const review = await this.findOne(id);

    if (
      updateReviewDto.userId ||
      updateReviewDto.productId ||
      updateReviewDto.orderId
    ) {
      const userId = updateReviewDto.userId || review.userId;
      const productId = updateReviewDto.productId || review.productId;
      const orderId = updateReviewDto.orderId || review.orderId;

      const existedReview = await this.reviewRepository.findExistingReview(
        userId,
        productId,
        orderId,
      );

      if (existedReview && existedReview._id.toString() !== id) {
        throw new ConflictException(
          'Bạn đã đánh giá sản phẩm này trong đơn hàng này',
        );
      }
    }

    const updatedReview = await this.reviewRepository.update(
      id,
      updateReviewDto,
    );

    if (!updatedReview) {
      throw new NotFoundException('Không tìm thấy đánh giá');
    }

    return updatedReview;
  }

  async verify(id: string, verifyReviewDto: VerifyReviewDto) {
    const updatedReview = await this.reviewRepository.update(id, {
      isVerified: verifyReviewDto.isVerified,
    });

    if (!updatedReview) {
      throw new NotFoundException('Không tìm thấy đánh giá');
    }

    return updatedReview;
  }

  async remove(id: string) {
    const deletedReview = await this.reviewRepository.softDelete(id);

    if (!deletedReview) {
      throw new NotFoundException('Không tìm thấy đánh giá');
    }

    return {
      message: 'Xóa đánh giá thành công',
    };
  }
}
