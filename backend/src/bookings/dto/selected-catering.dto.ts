import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SelectedCateringDto {
  @ApiProperty({ example: '64cat1' })
  @IsMongoId()
  catering_id: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity: number;
}
