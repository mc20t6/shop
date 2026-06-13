import { IsBoolean, IsNotEmpty } from 'class-validator';

export class VerifyReviewDto {
  @IsBoolean()
  @IsNotEmpty()
  isVerified: boolean;
}
