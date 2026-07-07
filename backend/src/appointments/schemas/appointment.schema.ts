import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AppointmentDocument = Appointment & Document;

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REFUSED = 'refused',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Schema({ timestamps: true })
export class Appointment {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patientId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Doctor', required: true })
  doctorId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Cabinet' })
  cabinetId!: Types.ObjectId;

  @Prop({ required: true })
  date!: Date;

  @Prop()
  reason!: string;

  @Prop({ enum: AppointmentStatus, default: AppointmentStatus.PENDING })
  status!: AppointmentStatus;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
