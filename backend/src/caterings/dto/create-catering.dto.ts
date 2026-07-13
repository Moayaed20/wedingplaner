import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { HallStatus } from '../../common/enums/hall-status.enum';

export class CreateCateringDto {
  @IsString()
  @IsNotEmpty()
  menu_name: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price_per_person: number;

  @IsString()
  @IsNotEmpty()
  menu_type: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(HallStatus)
  status?: HallStatus;
}
