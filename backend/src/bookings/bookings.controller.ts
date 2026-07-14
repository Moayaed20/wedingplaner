import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { BookingStatus } from '../common/enums/booking-status.enum';
import { HallsService } from '../halls/halls.service';

@ApiTags('bookings')
@ApiBearerAuth()
@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly hallsService: HallsService,
  ) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all bookings (admin)' })
  async findAll() {
    return this.bookingsService.findAll();
  }

  @Post()
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new booking (customer or admin)' })
  async create(@Body() dto: CreateBookingDto, @CurrentUser() user: any) {
    const customerId =
      user.role === UserRole.ADMIN && dto.customer_id
        ? dto.customer_id
        : user.userId;
    return this.bookingsService.create(dto, customerId);
  }

  @Get('mine')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'List current customer bookings' })
  async findMyBookings(@CurrentUser('userId') userId: string) {
    return this.bookingsService.findByCustomer(userId);
  }

  @Get('hall/:hallId')
  @Roles(UserRole.HALL_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'List bookings for a hall' })
  @ApiQuery({ name: 'status', enum: BookingStatus, required: false })
  async findByHall(
    @Param('hallId') hallId: string,
    @CurrentUser() user: any,
    @Query('status') status?: BookingStatus,
  ) {
    if (user.role === UserRole.HALL_OWNER) {
      const hall = await this.hallsService.findOne(hallId);
      const ownerId = (hall.owner_id as any)?._id
        ? (hall.owner_id as any)._id.toString()
        : (hall.owner_id as any)?.toString();
      if (ownerId !== user.userId) {
        throw new ForbiddenException('You can only view bookings for your own halls');
      }
    }
    return this.bookingsService.findByHall(hallId, status);
  }

  @Get(':id')
  @Roles(UserRole.CUSTOMER, UserRole.HALL_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get single booking by id' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const booking = await this.bookingsService.findOne(id);
    if (user.role === UserRole.CUSTOMER) {
      if ((booking.customer_id as any).toString() !== user.userId) {
        throw new ForbiddenException('Access denied');
      }
    } else if (user.role === UserRole.HALL_OWNER) {
      const hall = await this.hallsService.findOne(
        (booking.hall_id as any).toString(),
      );
      if ((hall.owner_id as any)?.toString() !== user.userId) {
        throw new ForbiddenException('Access denied');
      }
    }
    return booking;
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin update booking (status, date, guests, price, add-ons)' })
  async adminUpdate(@Param('id') id: string, @Body() body: any) {
    return this.bookingsService.adminUpdate(id, body);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin delete booking' })
  async adminDelete(@Param('id') id: string) {
    return this.bookingsService.adminDelete(id);
  }

  @Put(':id/confirm')
  @Roles(UserRole.HALL_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Confirm a pending booking' })
  async confirm(@Param('id') id: string, @CurrentUser() user: any) {
    const booking = await this.bookingsService.findOne(id);
    if (user.role === UserRole.HALL_OWNER) {
      const hall = await this.hallsService.findOne(
        (booking.hall_id as any)?._id
          ? (booking.hall_id as any)._id.toString()
          : (booking.hall_id as any).toString(),
      );
      const ownerId = (hall.owner_id as any)?._id
        ? (hall.owner_id as any)._id.toString()
        : (hall.owner_id as any)?.toString();
      if (ownerId !== user.userId) throw new ForbiddenException('Access denied');
    }
    return this.bookingsService.confirm(id);
  }

  @Put(':id/reject')
  @Roles(UserRole.HALL_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Reject a booking' })
  async reject(@Param('id') id: string, @CurrentUser() user: any) {
    const booking = await this.bookingsService.findOne(id);
    if (user.role === UserRole.HALL_OWNER) {
      const hall = await this.hallsService.findOne(
        (booking.hall_id as any)?._id
          ? (booking.hall_id as any)._id.toString()
          : (booking.hall_id as any).toString(),
      );
      const ownerId = (hall.owner_id as any)?._id
        ? (hall.owner_id as any)._id.toString()
        : (hall.owner_id as any)?.toString();
      if (ownerId !== user.userId) throw new ForbiddenException('Access denied');
    }
    return this.bookingsService.reject(id);
  }

  @Put(':id/cancel')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Cancel pending booking (customer)' })
  async cancel(@Param('id') id: string, @CurrentUser() user: any) {
    const booking = await this.bookingsService.findOne(id);
    if ((booking.customer_id as any).toString() !== user.userId) {
      throw new ForbiddenException('You can only cancel your own bookings');
    }
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Only pending bookings can be cancelled');
    }
    return this.bookingsService.cancel(id);
  }
}
