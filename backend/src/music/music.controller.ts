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
import { MusicService } from './music.service';
import { CreateMusicDto } from './dto/create-music.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('music')
@ApiBearerAuth()
@Controller({})
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  @Get('halls/:hallId/music')
  @Public()
  @ApiOperation({ summary: 'List music options for a hall (public)' })
  async findByHall(@Param('hallId') hallId: string) {
    return this.musicService.findByHall(hallId);
  }

  @Post('halls/:hallId/music')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create music option for hall (admin)' })
  async create(@Param('hallId') hallId: string, @Body() dto: CreateMusicDto) {
    return this.musicService.create(hallId, dto);
  }

  @Put('music/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update music option (admin)' })
  async update(@Param('id') id: string, @Body() dto: Partial<CreateMusicDto>) {
    return this.musicService.update(id, dto);
  }

  @Delete('music/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete music option (admin)' })
  async remove(@Param('id') id: string) {
    return this.musicService.remove(id);
  }
}
