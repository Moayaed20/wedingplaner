import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsArray,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { HallStatus } from '../../common/enums/hall-status.enum';

export class CreateCarDto {
  @IsString()
  @IsNotEmpty()
  car_name: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  capacity: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsEnum(HallStatus)
  status?: HallStatus;
}
