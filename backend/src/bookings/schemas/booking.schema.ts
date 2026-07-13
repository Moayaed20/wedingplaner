import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BookingStatus } from '../../common/enums/booking-status.enum';

export type BookingDocument = HydratedDocument<Booking>;

@Schema({ timestamps: true, collection: 'bookings' })
export class Booking {
  [key: string]: any;

  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  customer_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Hall', required: true })
  hall_id: Types.ObjectId;

  @Prop({ required: true })
  event_date: Date;

  @Prop({ required: true, min: 1 })
  guest_count: number;

  @Prop({ enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Prop({ required: true, min: 0 })
  total_price: number;

  @Prop({
    type: [
      {
        catering_id: { type: Types.ObjectId, ref: 'Catering', required: true },
        name: String,
        price_per_person: Number,
        total: Number,
      },
    ],
    default: [],
  })
  selected_caterings: {
    catering_id: Types.ObjectId;
    name: string;
    price_per_person: number;
    total: number;
  }[];

  @Prop({ type: Types.ObjectId, ref: 'Decoration', default: null })
  selected_decoration_id: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Car', default: null })
  selected_car_id: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Music', default: null })
  selected_music_id: Types.ObjectId | null;

  @Prop({ default: null })
  qr_code: string | null;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
