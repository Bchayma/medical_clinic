import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PharmacyDocument = Pharmacy & Document;

export enum PharmacyType {
  CENTRAL = 'central',
  PARTNER = 'partner',
}

@Schema({ timestamps: true })
export class Pharmacy {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: PharmacyType })
  type: PharmacyType;

  @Prop()
  address: string;

  @Prop()
  contact: string;
}

export const PharmacySchema = SchemaFactory.createForClass(Pharmacy);
