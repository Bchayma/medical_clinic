import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MedicationDocument = Medication & Document;

@Schema({ timestamps: true })
export class Medication {
  // @Prop({ type: Types.ObjectId, ref: 'Pharmacy', required: true })
  // pharmacyId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop()
  category!: string;

  @Prop({ required: true })
  price!: number;

  @Prop()
  expirationDate!: Date;

  @Prop({ required: true, default: 0 })
  quantity!: number;

  @Prop({ default: false })
  outOfStock!: boolean;
}

export const MedicationSchema = SchemaFactory.createForClass(Medication);
