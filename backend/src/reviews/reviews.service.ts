import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review } from './schemas/review.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { HallsService } from '../halls/halls.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<Review>,
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
