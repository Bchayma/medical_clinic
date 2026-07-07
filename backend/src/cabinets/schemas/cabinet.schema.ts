import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CabinetDocument = Cabinet & Document;

@Schema({ timestamps: true })
export class Cabinet {
  @Prop({ required: true })
  name: string;

  @Prop()
  location: string;

  @Prop()
  floor: string;

  @Prop({ type: Types.ObjectId, ref: 'Doctor' })
  doctorId: Types.ObjectId;

  // Horaires de travail : liste de créneaux { day, startTime, endTime }
  @Prop({
    type: [{ day: String, startTime: String, endTime: String }],
    default: [],
  })
  schedule: { day: string; startTime: string; endTime: string }[];
}

export const CabinetSchema = SchemaFactory.createForClass(Cabinet);
