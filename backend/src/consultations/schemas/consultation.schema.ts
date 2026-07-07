import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConsultationDocument = Consultation & Document;

@Schema({ timestamps: true })
export class Consultation {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Doctor', required: true })
  doctorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Appointment' })
  appointmentId: Types.ObjectId;

  @Prop({ required: true, default: Date.now })
  date: Date;

  @Prop()
  diagnosis: string;

  @Prop()
  observations: string;

  @Prop({ type: [Types.ObjectId], ref: 'Prescription', default: [] })
  prescriptions: Types.ObjectId[];
}

export const ConsultationSchema = SchemaFactory.createForClass(Consultation);
