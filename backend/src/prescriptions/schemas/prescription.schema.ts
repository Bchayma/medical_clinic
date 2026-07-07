import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PrescriptionDocument = Prescription & Document;

@Schema({ timestamps: true })
export class Prescription {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Doctor', required: true })
  doctorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Consultation' })
  consultationId: Types.ObjectId;

  @Prop({ required: true, default: Date.now })
  date: Date;

  @Prop({
    type: [{ name: String, dosage: String, frequency: String, duration: String }],
    default: [],
  })
  medications: { name: string; dosage: string; frequency: string; duration: string }[];

  @Prop()
  notes: string;

  @Prop({ default: false })
  archived: boolean;
}

export const PrescriptionSchema = SchemaFactory.createForClass(Prescription);
