import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsMongoId,
  IsEnum,
  Min,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { HallStatus } from '../../common/enums/hall-status.enum';

export class CreateHallDto {
  @ApiPropertyOptional({ example: '64bc1' })
  @IsOptional()
  @IsMongoId()
  owner_id?: string;

  @ApiProperty({ example: 'Royal Palace Hall' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '123 Royal Ave' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiPropertyOptional({ example: '10001' })
  @IsOptional()
  @IsString()
  postcode?: string;

  @ApiProperty({ example: 75 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price_per_person: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  min_capacity: number;

  @ApiProperty({ example: 500 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  max_capacity: number;

  @ApiPropertyOptional({ example: '555-1000' })
  @IsOptional()
  @IsString()
  contact?: string;

  @ApiPropertyOptional({ enum: HallStatus, example: HallStatus.ACTIVE })
  @IsOptional()
  @IsEnum(HallStatus)
  status?: HallStatus;

  @ApiPropertyOptional({ example: ['https://example.com/hall1.jpg'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
