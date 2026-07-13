import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { UserRole } from '../../common/enums/user-role.enum';
import { HallStatus } from '../../common/enums/hall-status.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Prop()
  phone: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Hall' }], default: [] })
  favorite_halls: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
