import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking } from './schemas/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { HallsService } from '../halls/halls.service';
import { CateringsService } from '../caterings/caterings.service';
import { DecorationsService } from '../decorations/decorations.service';
import { CarsService } from '../cars/cars.service';
import { MusicService } from '../music/music.service';
import { BookingStatus } from '../common/enums/booking-status.enum';
import { CalendarStatus } from '../common/enums/calendar-status.enum';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    private readonly hallsService: HallsService,
    private readonly cateringsService: CateringsService,
    private readonly decorationsService: DecorationsService,
    private readonly carsService: CarsService,
    private readonly musicService: MusicService,
  ) {}

  private normalizeDate(d: string | Date): Date {
    const date = new Date(d);
    date.setUTCHours(0, 0, 0, 0);
    return date;
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingModel
      .find()
      .populate('customer_id', 'name email')
      .populate('hall_id', 'name city')
      .populate('selected_decoration_id', 'theme_name price')
      .populate('selected_car_id', 'car_name model price')
      .populate('selected_music_id', 'name type price')
      .exec();
  }

  async findByCustomer(customerId: string): Promise<Booking[]> {
    return this.bookingModel
      .find({ customer_id: new Types.ObjectId(customerId) })
      .populate('hall_id', 'name city')
      .populate('selected_decoration_id', 'theme_name price')
      .populate('selected_car_id', 'car_name model price')
      .populate('selected_music_id', 'name type price')
      .exec();
  }

  async findByHall(hallId: string, status?: BookingStatus): Promise<Booking[]> {
    const query: any = { hall_id: new Types.ObjectId(hallId) };
    if (status) query.status = status;
    return this.bookingModel
      .find(query)
      .populate('customer_id', 'name email')
      .populate('selected_decoration_id', 'theme_name price')
      .populate('selected_car_id', 'car_name model price')
      .populate('selected_music_id', 'name type price')
      .exec();
  }

  async findOne(id: string): Promise<Booking> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid booking id');
    }
    const booking = await this.bookingModel
      .findById(id)
      .populate('customer_id', 'name email')
      .populate('hall_id')
      .populate('selected_decoration_id', 'theme_name price')
      .populate('selected_car_id', 'car_name model price')
      .populate('selected_music_id', 'name type price')
      .exec();
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async create(dto: CreateBookingDto, customerId: string): Promise<Booking> {
    const hall = await this.hallsService.findOne(dto.hall_id);
    const eventDate = this.normalizeDate(dto.event_date);

    if (
      await this.hallsService.isDateBooked(dto.hall_id, eventDate, [
        CalendarStatus.BOOKED,
      ])
    ) {
      throw new BadRequestException('This date is already booked');
    }

    if (dto.guest_count < hall.min_capacity || dto.guest_count > hall.max_capacity) {
      throw new BadRequestException(
        `Guest count must be between ${hall.min_capacity} and ${hall.max_capacity}`,
      );
    }

    let total = hall.price_per_person * dto.guest_count;
    const selectedCaterings: Booking['selected_caterings'] = [];

    if (dto.selected_caterings?.length) {
      for (const item of dto.selected_caterings) {
        const catering = await this.cateringsService.findOne(item.catering_id);
        if ((catering.hall_id as any).toString() !== dto.hall_id) {
          throw new BadRequestException(
            'Catering does not belong to selected hall',
          );
        }
        const subtotal = catering.price_per_person * dto.guest_count * item.quantity;
        total += subtotal;
        selectedCaterings.push({
          catering_id: catering._id as Types.ObjectId,
          name: catering.menu_name,
          price_per_person: catering.price_per_person,
          total: subtotal,
        });
      }
    }

    const created = new this.bookingModel({
      customer_id: new Types.ObjectId(customerId),
      hall_id: new Types.ObjectId(dto.hall_id),
      event_date: eventDate,
      guest_count: dto.guest_count,
      status: BookingStatus.PENDING,
      total_price: total,
      selected_caterings: selectedCaterings,
      selected_decoration_id: dto.selected_decoration_id
        ? new Types.ObjectId(dto.selected_decoration_id)
        : null,
      selected_car_id: dto.selected_car_id
        ? new Types.ObjectId(dto.selected_car_id)
        : null,
      selected_music_id: dto.selected_music_id
        ? new Types.ObjectId(dto.selected_music_id)
        : null,
      qr_code: null,
    });

    if (dto.selected_decoration_id) {
      const decoration = await this.decorationsService.findOne(
        dto.selected_decoration_id,
      );
      if ((decoration.hall_id as any).toString() !== dto.hall_id) {
        throw new BadRequestException('Decoration does not belong to selected hall');
      }
      total += decoration.price;
    }

    if (dto.selected_car_id) {
      const car = await this.carsService.findOne(dto.selected_car_id);
      if ((car.hall_id as any).toString() !== dto.hall_id) {
        throw new BadRequestException('Car does not belong to selected hall');
      }
      total += car.price;
    }

    if (dto.selected_music_id) {
      const music = await this.musicService.findOne(dto.selected_music_id);
      if ((music.hall_id as any).toString() !== dto.hall_id) {
        throw new BadRequestException('Music does not belong to selected hall');
      }
      total += music.price;
    }

    created.total_price = total;
    const saved = await created.save();

    await this.hallsService.setCalendarStatus(
      dto.hall_id,
      eventDate,
      CalendarStatus.PENDING,
    );

    return this.findOne((saved._id as Types.ObjectId).toString());
  }

  async confirm(id: string): Promise<Booking> {
    const booking = await this.findOne(id);
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Only pending bookings can be confirmed');
    }

    const eventDate = this.normalizeDate(booking.event_date);
    if (
      await this.hallsService.isDateBooked(
        (booking.hall_id as any)._id.toString(),
        eventDate,
        [CalendarStatus.BOOKED],
      )
    ) {
      throw new BadRequestException('This date is already booked by another event');
    }

    booking.status = BookingStatus.CONFIRMED;
    await booking.save();

    await this.hallsService.setCalendarStatus(
      (booking.hall_id as any)._id.toString(),
      eventDate,
      CalendarStatus.BOOKED,
    );

    return this.findOne(id);
  }

  async reject(id: string): Promise<Booking> {
    const booking = await this.findOne(id);
    if (booking.status === BookingStatus.REJECTED) {
      throw new BadRequestException('Booking already rejected');
    }

    booking.status = BookingStatus.REJECTED;
    await booking.save();

    await this.hallsService.removeCalendarStatus(
      (booking.hall_id as any)._id.toString(),
      this.normalizeDate(booking.event_date),
    );

    return this.findOne(id);
  }

  async cancel(id: string): Promise<Booking> {
    const booking = await this.findOne(id);
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Only pending bookings can be cancelled');
    }

    booking.status = BookingStatus.CANCELLED;
    await booking.save();

    await this.hallsService.removeCalendarStatus(
      (booking.hall_id as any)._id.toString(),
      this.normalizeDate(booking.event_date),
    );

    return this.findOne(id);
  }

  async adminUpdate(id: string, body: any): Promise<Booking> {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid booking id');
    await this.bookingModel.findByIdAndUpdate(id, {
      ...(body.status && { status: body.status }),
      ...(body.event_date && { event_date: this.normalizeDate(body.event_date) }),
      ...(body.guest_count && { guest_count: body.guest_count }),
      ...(body.total_price !== undefined && { total_price: body.total_price }),
      ...(body.selected_decoration_id !== undefined && {
        selected_decoration_id: body.selected_decoration_id
          ? new Types.ObjectId(body.selected_decoration_id)
          : null,
      }),
      ...(body.selected_car_id !== undefined && {
        selected_car_id: body.selected_car_id
          ? new Types.ObjectId(body.selected_car_id)
          : null,
      }),
      ...(body.selected_music_id !== undefined && {
        selected_music_id: body.selected_music_id
          ? new Types.ObjectId(body.selected_music_id)
          : null,
      }),
    });
    return this.findOne(id);
  }

  async adminDelete(id: string): Promise<{ deleted: boolean }> {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid booking id');
    const booking = await this.bookingModel.findById(id);
    if (!booking) throw new NotFoundException('Booking not found');
    await this.hallsService.removeCalendarStatus(
      (booking.hall_id as any).toString(),
      this.normalizeDate(booking.event_date),
    );
    await this.bookingModel.findByIdAndDelete(id);
    return { deleted: true };
  }
}
