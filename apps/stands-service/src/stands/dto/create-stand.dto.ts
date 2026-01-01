import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateStandDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsString()
  @IsNotEmpty()
  location: string;
}
