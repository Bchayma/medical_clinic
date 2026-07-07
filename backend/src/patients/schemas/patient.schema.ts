import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PatientDocument = Patient & Document;

@Schema({ timestamps: true })
export class Patient {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop()
  dateOfBirth: Date;

  @Prop()
  gender: string;

  @Prop()
  address: string;

  @Prop()
  bloodType: string;

  @Prop({ type: [String], default: [] })
  allergies: string[];

  @Prop({ type: [String], default: [] })
  chronicConditions: string[];

  // Notes médicales ajoutées par les médecins au fil du temps
  @Prop({
    type: [
      {
        doctorId: { type: Types.ObjectId, ref: 'Doctor' },
        note: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  medicalNotes: { doctorId: Types.ObjectId; note: string; createdAt: Date }[];

  // Médecin(s) qui suivent ce patient (utile pour restreindre l'accès des médecins externes)
  @Prop({ type: [Types.ObjectId], ref: 'Doctor', default: [] })
  followedByDoctors: Types.ObjectId[];
}

export const PatientSchema = SchemaFactory.createForClass(Patient);
