import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CarsService } from './cars.service';
import { CreateCarDto } from './dto/create-car.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('cars')
@ApiBearerAuth()
@Controller({})
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Get('halls/:hallId/cars')
  @ApiOperation({ summary: 'List cars for a hall (public)' })
  async findByHall(@Param('hallId') hallId: string) {
    return this.carsService.findByHall(hallId);
  }

  @Post('halls/:hallId/cars')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create car for hall (admin)' })
  async create(@Param('hallId') hallId: string, @Body() dto: CreateCarDto) {
    return this.carsService.create(hallId, dto);
  }

  @Put('cars/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update car (admin)' })
  async update(@Param('id') id: string, @Body() dto: Partial<CreateCarDto>) {
    return this.carsService.update(id, dto);
  }

  @Delete('cars/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete car (admin)' })
  async remove(@Param('id') id: string) {
    return this.carsService.remove(id);
  }
}
