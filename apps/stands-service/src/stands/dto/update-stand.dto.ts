import { PartialType } from '@nestjs/mapped-types';
import { CreateStandDto } from './create-stand.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateStandDto extends PartialType(CreateStandDto) {
  @IsOptional()
  @IsString()
  status?: string; 
}