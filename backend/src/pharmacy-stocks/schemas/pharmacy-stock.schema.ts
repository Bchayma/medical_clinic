import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PharmacyStockDocument = PharmacyStock & Document;

@Schema({ timestamps: true })
export class PharmacyStock {
  @Prop({ type: Types.ObjectId, ref: 'Pharmacy', required: true })
  pharmacyId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Medication', required: true })
  medicineId!: Types.ObjectId;

  @Prop({ required: true, default: 0, min: 0 })
  quantity!: number;

  @Prop({ required: true, default: 0, min: 0 })
  minimumQuantity!: number;

  @Prop()
  expirationDate?: Date;

  @Prop()
  batchNumber?: string;
}

export const PharmacyStockSchema = SchemaFactory.createForClass(PharmacyStock);