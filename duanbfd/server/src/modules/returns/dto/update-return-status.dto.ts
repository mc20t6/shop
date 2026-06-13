import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateReturnStatusDto {
  @IsString()
  @IsNotEmpty()
  status: string;

  @IsOptional()
  @IsString()
  staffNote?: string;
}
