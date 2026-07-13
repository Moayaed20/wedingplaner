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
import { CateringsService } from './caterings.service';
import { CreateCateringDto } from './dto/create-catering.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('caterings')
@ApiBearerAuth()
@Controller({})
export class CateringsController {
  constructor(private readonly cateringsService: CateringsService) {}

  @Get('halls/:hallId/caterings')
  @ApiOperation({ summary: 'List caterings for a hall (public)' })
  async findByHall(@Param('hallId') hallId: string) {
    return this.cateringsService.findByHall(hallId);
  }

  @Post('halls/:hallId/caterings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create catering for hall (admin)' })
  async create(
    @Param('hallId') hallId: string,
    @Body() dto: CreateCateringDto,
  ) {
    return this.cateringsService.create(hallId, dto);
  }

  @Put('caterings/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update catering (admin)' })
  async update(@Param('id') id: string, @Body() dto: Partial<CreateCateringDto>) {
    return this.cateringsService.update(id, dto);
  }

  @Delete('caterings/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete catering (admin)' })
  async remove(@Param('id') id: string) {
    return this.cateringsService.remove(id);
  }
}
