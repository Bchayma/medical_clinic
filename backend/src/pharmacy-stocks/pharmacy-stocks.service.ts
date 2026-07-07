import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Pharmacy, PharmacyDocument } from '../pharmacies/schemas/pharmacy.schema';
import { Medication, MedicationDocument } from '../medications/schemas/medication.schema';
import {
  PharmacyStock,
  PharmacyStockDocument,
} from './schemas/pharmacy-stock.schema';
import { CreatePharmacyStockDto } from './dto/create-pharmacy-stock.dto';
import { UpdatePharmacyStockDto } from './dto/update-pharmacy-stock.dto';


type PharmacyAvailability = {
  pharmacyId: string;
  name: string;
  type: string;
  address?: string;
  quantity: number;
  minimumQuantity: number;
};

@Injectable()
export class PharmacyStocksService {
  constructor(
    @InjectModel(PharmacyStock.name) private pharmacyStockModel: Model<PharmacyStockDocument>,
    @InjectModel(Pharmacy.name) private pharmacyModel: Model<PharmacyDocument>,
    @InjectModel(Medication.name) private medicationModel: Model<MedicationDocument>,
  ) {}

  private escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private buildMedicineSearchTerms(name: string) {
    const trimmed = name.trim();
    const baseName = trimmed
      .replace(/\s+\d+(?:[.,]\d+)?\s*(?:mg|g|mcg|µg|ml|ui|u|%)\b.*$/i, '')
      .replace(/\s+\d+.*$/i, '')
      .trim();

    return [...new Set([trimmed, baseName].filter((value) => value.length > 0))];
  }

  private async assertPharmacyExists(pharmacyId: string) {
    const pharmacy = await this.pharmacyModel.findById(pharmacyId);
    if (!pharmacy) throw new NotFoundException('Pharmacie introuvable');
    return pharmacy;
  }

  private async assertMedicationExists(medicineId: string) {
    const medication = await this.medicationModel.findById(medicineId);
    if (!medication) throw new NotFoundException('Médicament introuvable');
    return medication;
  }

  private buildAvailability(stocks: any[]): PharmacyAvailability[] {
    const grouped = new Map<string, PharmacyAvailability>();

    for (const stock of stocks) {
      const pharmacy = stock.pharmacyId;
      const pharmacyKey = pharmacy?._id?.toString?.() ?? pharmacy?.id?.toString?.() ?? String(pharmacy);
      const current = grouped.get(pharmacyKey);
      const quantity = Number(stock.quantity ?? 0);
      const minimumQuantity = Number(stock.minimumQuantity ?? 0);

      if (current) {
        current.quantity += quantity;
        current.minimumQuantity = Math.max(current.minimumQuantity, minimumQuantity);
        continue;
      }

      grouped.set(pharmacyKey, {
        pharmacyId: pharmacyKey,
        name: pharmacy?.name ?? 'Pharmacie',
        type: pharmacy?.type ?? 'unknown',
        address: pharmacy?.address,
        quantity,
        minimumQuantity,
      });
    }

    return [...grouped.values()];
  }

  async create(data: CreatePharmacyStockDto) {
    await this.assertPharmacyExists(data.pharmacyId);
    await this.assertMedicationExists(data.medicineId);

    const existing = await this.pharmacyStockModel.findOne({
      pharmacyId: data.pharmacyId,
      medicineId: data.medicineId,
    });

    const payload = {
      pharmacyId: data.pharmacyId,
      medicineId: data.medicineId,
      quantity: data.quantity,
      minimumQuantity: data.minimumQuantity,
      expirationDate: data.expirationDate,
      batchNumber: data.batchNumber,
    };

    if (existing) {
      existing.set(payload);
      return existing.save();
    }

    return new this.pharmacyStockModel(payload).save();
  }

  findAll() {
    return this.pharmacyStockModel.find().populate('pharmacyId').populate('medicineId');
  }

  findByPharmacy(pharmacyId: string) {
    return this.pharmacyStockModel
      .find({ pharmacyId })
      .populate('pharmacyId')
      .populate('medicineId')
      .sort({ updatedAt: -1 });
  }

  findAvailableByPharmacy(pharmacyId: string) {
    return this.findByPharmacy(pharmacyId).then((stocks) => stocks.filter((stock) => stock.quantity > 0));
  }

//   async searchByPharmacy(pharmacyId: string, name: string, onlyAvailable = false) {
//     const searchTerms = this.buildMedicineSearchTerms(name);
//     const matchedMedicines = await this.medicationModel
//       .find({
//         $or: searchTerms.map((term) => ({ name: { $regex: this.escapeRegExp(term), $options: 'i' } })),
//       })
//       .select('_id');

//     if (!matchedMedicines.length) {
//       return [];
//     }

//     // const filter: Record<string, unknown> = {
//     //   pharmacyId,
//     //   medicineId: { $in: matchedMedicines.map((medication) => medication._id) },
//     // };

//     const filter: Record<string, any> = {
//   pharmacyId: new Types.ObjectId(pharmacyId),
//   medicineId: {
//     $in: matchedMedicines.map((medication) => medication._id),
//   },
// };

//     if (onlyAvailable) {
//       filter.quantity = { $gt: 0 };
//     }

//     return this.pharmacyStockModel
//       .find(filter)
//       .populate('pharmacyId')
//       .populate('medicineId')
//       .sort({ quantity: -1, updatedAt: -1 });
//   }

async searchByPharmacy(pharmacyId: string, name: string, onlyAvailable = false) {
  console.log("PHARMACY ID :", pharmacyId);
  console.log("SEARCH NAME :", name);

  const searchTerms = this.buildMedicineSearchTerms(name);

  console.log("SEARCH TERMS :", searchTerms);

  // const matchedMedicines = await this.medicationModel
  //   .find({
  //     $or: searchTerms.map((term) => ({
  //       name: {
  //         $regex: this.escapeRegExp(term),
  //         $options: 'i'
  //       }
  //     })),
  //   })
  //   .select('_id');

const matchedMedicines = await this.medicationModel
  .find({
    name: {
      $regex: `^${this.escapeRegExp(name.trim())}$`,
      $options: 'i',
    },
  })
  .select('_id');

  console.log("MATCHED MEDICINES :", matchedMedicines);

  if (!matchedMedicines.length) {
    return [];
  }

  const filter: Record<string, any> = {
    pharmacyId: new Types.ObjectId(pharmacyId),
    medicineId: {
      $in: matchedMedicines.map((medication) => medication._id),
    },
  };

  console.log("FILTER :", filter);

  const result = await this.pharmacyStockModel
    .find(filter)
    .populate('pharmacyId')
    .populate('medicineId')
    .sort({ quantity: -1, updatedAt: -1 });

  console.log("RESULT :", result);

  return result;
}

  async findOne(id: string) {
    const stock = await this.pharmacyStockModel
      .findById(id)
      .populate('pharmacyId')
      .populate('medicineId');

    if (!stock) throw new NotFoundException('Stock introuvable');
    return stock;
  }

  async update(id: string, data: UpdatePharmacyStockDto) {
    const stock = await this.pharmacyStockModel.findById(id);
    if (!stock) throw new NotFoundException('Stock introuvable');

    if (data.pharmacyId) {
      await this.assertPharmacyExists(data.pharmacyId);
      stock.pharmacyId = new Types.ObjectId(data.pharmacyId);
    }

    if (data.medicineId) {
      await this.assertMedicationExists(data.medicineId);
      stock.medicineId = new Types.ObjectId(data.medicineId);
    }

    if (data.quantity !== undefined) stock.quantity = data.quantity;
    if (data.minimumQuantity !== undefined) stock.minimumQuantity = data.minimumQuantity;
    if (data.expirationDate !== undefined) stock.expirationDate = data.expirationDate ? new Date(data.expirationDate) : undefined;
    if (data.batchNumber !== undefined) stock.batchNumber = data.batchNumber;

    return stock.save();
  }

  async remove(id: string) {
    const res = await this.pharmacyStockModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Stock introuvable');
  }

  async findAvailablePharmaciesForMedicineName(medicineName: string) {
    if (!medicineName?.trim()) {
      return [];
    }

    // const searchTerms = this.buildMedicineSearchTerms(medicineName);
    // const matchedMedicines = await this.medicationModel
    //   .find({
    //     $or: searchTerms.map((term) => ({ name: { $regex: this.escapeRegExp(term), $options: 'i' } })),
    //   })
    //   .select('_id');

    // if (!matchedMedicines.length) {
    //   return [];
    // }
    const matchedMedicines = await this.medicationModel
  .find({
    name: {
      $regex: `^${this.escapeRegExp(medicineName.trim())}$`,
      $options: 'i',
    },
  })
  .select('_id');

    const stocks = await this.pharmacyStockModel
      .find({
        medicineId: { $in: matchedMedicines.map((medication) => medication._id) },
        quantity: { $gt: 0 },
      })
      .populate('pharmacyId')
      .populate('medicineId')
      .sort({ quantity: -1, updatedAt: -1 });

    return this.buildAvailability(stocks);
  }

  async enrichPrescriptionMedications(medications: { name: string; dosage: string; frequency: string; duration: string }[]) {
    const enrichedMedications: Array<
      {
        name: string;
        dosage: string;
        frequency: string;
        duration: string;
      } & {
        availablePharmacies: PharmacyAvailability[];
      }
    > = [];

    for (const medication of medications) {
      const availablePharmacies = await this.findAvailablePharmaciesForMedicineName(medication.name);
      enrichedMedications.push({
        ...medication,
        availablePharmacies,
      });
    }

    return enrichedMedications;
  }
  async findByMedicine(medicineId: string) {
  return this.pharmacyStockModel
    .find({
      medicineId,
      quantity: { $gt: 0 },
    })
    .populate('pharmacyId')
    .populate('medicineId')
    .sort({ quantity: -1 });
}
}