import { Model } from 'mongoose';
import { Review } from './schemas/review.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { HallsService } from '../halls/halls.service';
import { Booking } from '../bookings/schemas/booking.schema';
export declare class ReviewsService {
    private reviewModel;
    private bookingModel;
    private readonly hallsService;
    constructor(reviewModel: Model<Review>, bookingModel: Model<Booking>, hallsService: HallsService);
    findByHall(hallId: string): Promise<Review[]>;
    findOne(id: string): Promise<Review>;
    create(dto: CreateReviewDto, userId: string): Promise<Review>;
    remove(id: string): Promise<{
        deleted: boolean;
        hallId?: string;
    }>;
}
