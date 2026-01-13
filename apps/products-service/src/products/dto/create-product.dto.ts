import { IsNotEmpty, IsString, IsNumber, Min, IsUUID, IsOptional, IsBoolean } from 'class-validator';

export class CreateProductDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsString() @IsNotEmpty()
  category: string;

  @IsString() @IsOptional()
  description?: string;

  @IsNumber() @Min(0)
  price: number;

  @IsNumber() @Min(0)
  stock: number;

  @IsBoolean() @IsOptional()
  isActive?: boolean;

  @IsUUID() @IsNotEmpty()
  standId: string;

  @IsString() @IsOptional()
  image?: string;
}