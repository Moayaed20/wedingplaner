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
import { DecorationsService } from './decorations.service';
import { CreateDecorationDto } from './dto/create-decoration.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('decorations')
@ApiBearerAuth()
@Controller({})
export class DecorationsController {
  constructor(private readonly decorationsService: DecorationsService) {}

  @Get('halls/:hallId/decorations')
  @ApiOperation({ summary: 'List decorations for a hall (public)' })
  async findByHall(@Param('hallId') hallId: string) {
    return this.decorationsService.findByHall(hallId);
  }

  @Post('halls/:hallId/decorations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create decoration for hall (admin)' })
  async create(
    @Param('hallId') hallId: string,
    @Body() dto: CreateDecorationDto,
  ) {
    return this.decorationsService.create(hallId, dto);
  }

  @Put('decorations/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update decoration (admin)' })
  async update(@Param('id') id: string, @Body() dto: Partial<CreateDecorationDto>) {
    return this.decorationsService.update(id, dto);
  }

  @Delete('decorations/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete decoration (admin)' })
  async remove(@Param('id') id: string) {
    return this.decorationsService.remove(id);
  }
}
