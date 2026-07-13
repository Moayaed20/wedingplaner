import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { HallStatus } from '../../common/enums/hall-status.enum';

export type CateringDocument = HydratedDocument<Catering>;

@Schema({ timestamps: true, collection: 'hall_caterings' })
export class Catering {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Hall', required: true })
  hall_id: Types.ObjectId;

  @Prop({ required: true })
  menu_name: string;

  @Prop({ required: true, min: 0 })
  price_per_person: number;

  @Prop({ required: true })
  menu_type: string;

  @Prop()
  description: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ enum: HallStatus, default: HallStatus.ACTIVE })
  status: HallStatus;
}

export const CateringSchema = SchemaFactory.createForClass(Catering);
