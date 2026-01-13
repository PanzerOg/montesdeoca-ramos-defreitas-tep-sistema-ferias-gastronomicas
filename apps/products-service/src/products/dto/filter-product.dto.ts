import { IsOptional, IsString, IsNumber, Min, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterProductDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsUUID()
  standId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsString()
  search?: string;
}