import { Model } from 'mongoose';
import { Booking } from './schemas/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { HallsService } from '../halls/halls.service';
import { CateringsService } from '../caterings/caterings.service';
import { DecorationsService } from '../decorations/decorations.service';
import { CarsService } from '../cars/cars.service';
import { MusicService } from '../music/music.service';
import { BookingStatus } from '../common/enums/booking-status.enum';
export declare class BookingsService {
    private bookingModel;
    private readonly hallsService;
    private readonly cateringsService;
    private readonly decorationsService;
    private readonly carsService;
    private readonly musicService;
    constructor(bookingModel: Model<Booking>, hallsService: HallsService, cateringsService: CateringsService, decorationsService: DecorationsService, carsService: CarsService, musicService: MusicService);
    private normalizeDate;
    findAll(): Promise<Booking[]>;
    findByCustomer(customerId: string): Promise<Booking[]>;
    findByHall(hallId: string, status?: BookingStatus): Promise<Booking[]>;
    findOne(id: string): Promise<Booking>;
    create(dto: CreateBookingDto, customerId: string): Promise<Booking>;
    confirm(id: string): Promise<Booking>;
    reject(id: string): Promise<Booking>;
    cancel(id: string): Promise<Booking>;
    adminUpdate(id: string, body: any): Promise<Booking>;
    adminDelete(id: string): Promise<{
        deleted: boolean;
    }>;
}
