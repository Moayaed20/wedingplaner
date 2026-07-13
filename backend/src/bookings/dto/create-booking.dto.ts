import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsMongoId,
  IsDateString,
  IsNumber,
  Min,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SelectedCateringDto } from './selected-catering.dto';

export class CreateBookingDto {
  @ApiProperty({ example: '64bc1' })
  @IsMongoId()
  hall_id: string;

  @ApiProperty({ example: '2026-08-15' })
  @IsDateString()
  event_date: string;

  @ApiProperty({ example: 150 })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  guest_count: number;

  @ApiPropertyOptional({ type: [SelectedCateringDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectedCateringDto)
  selected_caterings?: SelectedCateringDto[];

  @ApiPropertyOptional({ example: '64deco1' })
  @IsOptional()
  @IsMongoId()
  selected_decoration_id?: string;

  @ApiPropertyOptional({ example: '64car1' })
  @IsOptional()
  @IsMongoId()
  selected_car_id?: string;

  @ApiPropertyOptional({ example: '64music1' })
  @IsOptional()
  @IsMongoId()
  selected_music_id?: string;
}
