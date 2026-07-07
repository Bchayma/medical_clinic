import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Medication, MedicationSchema } from './schemas/medication.schema';
import { MedicationsService } from './medications.service';
import { MedicationsController } from './medications.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Medication.name, schema: MedicationSchema }])],
  providers: [MedicationsService],
  controllers: [MedicationsController],
  exports: [MedicationsService, MongooseModule],
})
export class MedicationsModule {}
