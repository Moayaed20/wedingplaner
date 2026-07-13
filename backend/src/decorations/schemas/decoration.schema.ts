import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { HallStatus } from '../../common/enums/hall-status.enum';

export type DecorationDocument = HydratedDocument<Decoration>;

@Schema({ timestamps: true, collection: 'hall_decorations' })
export class Decoration {
  @Prop({ type: Types.ObjectId, ref: 'Hall', required: true })
  hall_id: Types.ObjectId;

  @Prop({ required: true })
  theme_name: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop()
  description: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ enum: HallStatus, default: HallStatus.ACTIVE })
  status: HallStatus;
}

export const DecorationSchema = SchemaFactory.createForClass(Decoration);
