import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { HallStatus } from '../../common/enums/hall-status.enum';

export type MusicDocument = HydratedDocument<Music>;

@Schema({ timestamps: true, collection: 'hall_music' })
export class Music {
  @Prop({ type: Types.ObjectId, ref: 'Hall', required: true })
  hall_id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop()
  description: string;

  @Prop({ enum: HallStatus, default: HallStatus.ACTIVE })
  status: HallStatus;
}

export const MusicSchema = SchemaFactory.createForClass(Music);
