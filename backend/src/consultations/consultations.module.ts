import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Consultation, ConsultationSchema } from './schemas/consultation.schema';
import { ConsultationsService } from './consultations.service';
import { ConsultationsController } from './consultations.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Consultation.name, schema: ConsultationSchema }])],
  providers: [ConsultationsService],
  controllers: [ConsultationsController],
  exports: [ConsultationsService, MongooseModule],
})
export class ConsultationsModule {}
