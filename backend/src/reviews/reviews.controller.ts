import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('reviews')
@ApiBearerAuth()
@Controller({})
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('halls/:hallId/reviews')
  @ApiOperation({ summary: 'List reviews for a hall (public)' })
  async findByHall(@Param('hallId') hallId: string) {
    return this.reviewsService.findByHall(hallId);
  }

  @Post('reviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Create a hall review (customer)' })
  async create(
    @Body() dto: CreateReviewDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.reviewsService.create(dto, userId);
  }

  @Delete('reviews/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Delete review (admin or owner)' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const review = await this.reviewsService.findOne(id);
    if (user.role === UserRole.CUSTOMER) {
      if ((review.user_id as any).toString() !== user.userId) {
        throw new ForbiddenException('You can only delete your own reviews');
      }
    }
    return this.reviewsService.remove(id);
  }
}
