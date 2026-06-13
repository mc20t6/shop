import { IsOptional } from 'class-validator';

export class DashboardQueryDto {
  @IsOptional()
  year?: string;
}
