import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class UserEntity {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: String, required: true, enum: ['admin', 'user'] })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(UserEntity);
