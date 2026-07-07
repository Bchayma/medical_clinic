import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Pharmacy, PharmacySchema } from '../pharmacies/schemas/pharmacy.schema';
import { Medication, MedicationSchema } from '../medications/schemas/medication.schema';
import { PharmacyStock, PharmacyStockSchema } from './schemas/pharmacy-stock.schema';
import { PharmacyStocksService } from './pharmacy-stocks.service';
import { PharmacyStocksController } from './pharmacy-stocks.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PharmacyStock.name, schema: PharmacyStockSchema },
      { name: Pharmacy.name, schema: PharmacySchema },
      { name: Medication.name, schema: MedicationSchema },
    ]),
  ],
  providers: [PharmacyStocksService],
  controllers: [PharmacyStocksController],
  exports: [PharmacyStocksService, MongooseModule],
})
export class PharmacyStocksModule {}