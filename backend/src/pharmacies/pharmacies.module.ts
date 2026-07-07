import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Pharmacy, PharmacySchema } from './schemas/pharmacy.schema';
import { PharmaciesService } from './pharmacies.service';
import { PharmaciesController } from './pharmacies.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Pharmacy.name, schema: PharmacySchema }]),
    UsersModule,
  ],
  providers: [PharmaciesService],
  controllers: [PharmaciesController],
  exports: [PharmaciesService, MongooseModule],
})
export class PharmaciesModule {}
