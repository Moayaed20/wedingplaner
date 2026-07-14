import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Review, ReviewSchema } from './schemas/review.schema';
import { Booking, BookingSchema } from '../bookings/schemas/booking.schema';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { HallsModule } from '../halls/halls.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Review.name, schema: ReviewSchema },
      { name: Booking.name, schema: BookingSchema },
    ]),
    HallsModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
