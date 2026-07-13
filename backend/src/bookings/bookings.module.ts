import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from './schemas/booking.schema';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { HallsModule } from '../halls/halls.module';
import { CateringsModule } from '../caterings/caterings.module';
import { DecorationsModule } from '../decorations/decorations.module';
import { CarsModule } from '../cars/cars.module';
import { MusicModule } from '../music/music.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
    ]),
    forwardRef(() => HallsModule),
    CateringsModule,
    DecorationsModule,
    CarsModule,
    MusicModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
