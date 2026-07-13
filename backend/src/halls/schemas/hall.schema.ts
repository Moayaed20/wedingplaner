import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { HallStatus } from '../../common/enums/hall-status.enum';
import { CalendarStatus } from '../../common/enums/calendar-status.enum';

export type HallDocument = HydratedDocument<Hall>;

@Schema({ timestamps: true, collection: 'halls' })
export class Hall {
  [key: string]: any;
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  owner_id: Types.ObjectId | null;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  city: string;

  @Prop()
  postcode: string;

  @Prop({ required: true, min: 0 })
  price_per_person: number;

  @Prop({ required: true, min: 0 })
  min_capacity: number;

  @Prop({ required: true, min: 0 })
  max_capacity: number;

  @Prop({ default: 0, min: 0, max: 5 })
  rating: number;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [String], default: [] })
  images_360: string[];

  @Prop()
  contact: string;

  @Prop({ enum: HallStatus, default: HallStatus.ACTIVE })
  status: HallStatus;

  @Prop({
    type: [
      {
        date: { type: Date, required: true },
        status: {
          type: String,
          enum: CalendarStatus,
          required: true,
        },
      },
    ],
    default: [],
  })
  availability_calendar: { date: Date; status: CalendarStatus }[];
}

export const HallSchema = SchemaFactory.createForClass(Hall);
