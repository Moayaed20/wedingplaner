import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { HallStatus } from '../../common/enums/hall-status.enum';

export type CarDocument = HydratedDocument<Car>;

@Schema({ timestamps: true, collection: 'hall_cars' })
export class Car {
  @Prop({ type: Types.ObjectId, ref: 'Hall', required: true })
  hall_id: Types.ObjectId;

  @Prop({ required: true })
  car_name: string;

  @Prop({ required: true })
  model: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, min: 0 })
  capacity: number;

  @Prop()
  description: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ enum: HallStatus, default: HallStatus.ACTIVE })
  status: HallStatus;
}

export const CarSchema = SchemaFactory.createForClass(Car);
