import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { VoucherType } from '../entities/voucher.entity';

export class CreateVoucherDto {
  @IsString()
  code: string;

  @IsEnum(VoucherType)
  type: VoucherType;

  @IsNumber()
  @Min(1)
  value: number;

  @IsNumber()
  @Min(0)
  minOrderValue: number;

  @IsNumber()
  @Min(0)
  maxDiscount: number;

  @IsNumber()
  @Min(1)
  usageLimit: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
