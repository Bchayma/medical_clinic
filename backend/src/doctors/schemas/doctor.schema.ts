import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DoctorDocument = Doctor & Document;

export enum DoctorType {
  INTERNAL = 'internal',
  EXTERNAL = 'external',
}

@Schema({ timestamps: true })
export class Doctor {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: DoctorType })
  type: DoctorType;

  @Prop({ required: true })
  speciality: string;

  @Prop()
  licenseNumber: string;

  // Uniquement pour les médecins internes
  @Prop({ type: Types.ObjectId, ref: 'Cabinet' })
  cabinetId: Types.ObjectId;

  // Disponibilités déclarées par le médecin
  @Prop({
    type: [{ day: String, startTime: String, endTime: String }],
    default: [],
  })
  availability: { day: string; startTime: string; endTime: string }[];
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);
