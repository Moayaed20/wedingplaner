import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { HallStatus } from '../../common/enums/hall-status.enum';

export type ServiceDocument = HydratedDocument<Service>;

@Schema({ timestamps: true, collection: 'services' })
export class Service {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop()
  description: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ enum: HallStatus, default: HallStatus.ACTIVE })
  status: HallStatus;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
