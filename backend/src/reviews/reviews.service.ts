import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review } from './schemas/review.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { HallsService } from '../halls/halls.service';
import { Booking } from '../bookings/schemas/booking.schema';
import { BookingStatus } from '../common/enums/booking-status.enum';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    private readonly hallsService: HallsService,
  ) {}

  async findByHall(hallId: string): Promise<Review[]> {
    if (!Types.ObjectId.isValid(hallId)) {
      throw new BadRequestException('Invalid hall id');
    }
    return this.reviewModel
      .find({ hall_id: new Types.ObjectId(hallId) })
      .populate('user_id', 'name')
      .exec();
  }

  async findOne(id: string): Promise<Review> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid review id');
    }
    const review = await this.reviewModel
      .findById(id)
      .populate('user_id', 'name email')
      .populate('hall_id', 'name')
      .exec();
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async create(dto: CreateReviewDto, userId: string): Promise<Review> {
    await this.hallsService.findOne(dto.hall_id);

    // Must have a confirmed booking for this hall
    const confirmedBooking = await this.bookingModel.findOne({
      customer_id: new Types.ObjectId(userId),
      hall_id: new Types.ObjectId(dto.hall_id),
      status: BookingStatus.CONFIRMED,
    });
    if (!confirmedBooking) {
      throw new BadRequestException('يجب أن يكون لديك حجز مؤكد لهذه الصالة قبل التقييم');
    }

    // One review per user per hall
    const existing = await this.reviewModel.findOne({
      user_id: new Types.ObjectId(userId),
      hall_id: new Types.ObjectId(dto.hall_id),
    });
    if (existing) {
      throw new BadRequestException('لقد قيّمت هذه الصالة مسبقاً');
    }

    const created = new this.reviewModel({
      user_id: new Types.ObjectId(userId),
      hall_id: new Types.ObjectId(dto.hall_id),
      rating: dto.rating,
      review_text: dto.review_text,
    });

    const saved = await created.save();
    await this.hallsService.updateRating(dto.hall_id);
    return this.findOne((saved._id as Types.ObjectId).toString());
  }

  async remove(id: string): Promise<{ deleted: boolean; hallId?: string }> {
    const review = await this.findOne(id);
    const hallId = (review.hall_id as any)._id.toString();
    const result = await this.reviewModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Review not found');
    await this.hallsService.updateRating(hallId);
    return { deleted: true, hallId };
  }
}
