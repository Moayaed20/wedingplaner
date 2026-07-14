import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus } from '../common/enums/booking-status.enum';
import { HallsService } from '../halls/halls.service';
export declare class BookingsController {
    private readonly bookingsService;
    private readonly hallsService;
    constructor(bookingsService: BookingsService, hallsService: HallsService);
    findAll(): Promise<import("./schemas/booking.schema").Booking[]>;
    create(dto: CreateBookingDto, user: any): Promise<import("./schemas/booking.schema").Booking>;
    findMyBookings(userId: string): Promise<import("./schemas/booking.schema").Booking[]>;
    findByHall(hallId: string, user: any, status?: BookingStatus): Promise<import("./schemas/booking.schema").Booking[]>;
    findOne(id: string, user: any): Promise<import("./schemas/booking.schema").Booking>;
    adminUpdate(id: string, body: any): Promise<import("./schemas/booking.schema").Booking>;
    adminDelete(id: string): Promise<{
        deleted: boolean;
    }>;
    confirm(id: string, user: any): Promise<import("./schemas/booking.schema").Booking>;
    reject(id: string, user: any): Promise<import("./schemas/booking.schema").Booking>;
    cancel(id: string, user: any): Promise<import("./schemas/booking.schema").Booking>;
}
