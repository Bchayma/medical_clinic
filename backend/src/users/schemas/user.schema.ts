import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from '../../common/enums/role.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true, enum: Role })
  role: Role;

  @Prop()
  phone: string;

  @Prop({ default: true })
  isActive: boolean;

  // Référence vers le profil spécifique (Doctor, Patient, Pharmacy) selon le rôle
  @Prop({ type: Types.ObjectId, refPath: 'profileModel' })
  profileId: Types.ObjectId;

  @Prop()
  profileModel: string; // 'Doctor' | 'Patient' | 'Pharmacy'
}

export const UserSchema = SchemaFactory.createForClass(User);
