import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Cabinet, CabinetSchema } from './schemas/cabinet.schema';
import { CabinetsService } from './cabinets.service';
import { CabinetsController } from './cabinets.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Cabinet.name, schema: CabinetSchema }])],
  providers: [CabinetsService],
  controllers: [CabinetsController],
  exports: [CabinetsService, MongooseModule],
})
export class CabinetsModule {}
