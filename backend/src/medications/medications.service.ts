import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Medication, MedicationDocument } from './schemas/medication.schema';

@Injectable()
export class MedicationsService {
  constructor(@InjectModel(Medication.name) private medicationModel: Model<MedicationDocument>) {}

  private escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private buildSearchTerms(name: string) {
    const trimmed = name.trim();
    const baseName = trimmed
      .replace(/\s+\d+(?:[.,]\d+)?\s*(?:mg|g|mcg|µg|ml|ui|u|%)\b.*$/i, '')
      .replace(/\s+\d+.*$/i, '')
      .trim();

    return [...new Set([trimmed, baseName].filter((value) => value.length > 0))];
  }

  create(data: Partial<Medication>) {
    return new this.medicationModel(data).save();
  }

  findByPharmacy(pharmacyId: string) {
    return this.medicationModel.find({ pharmacyId });
  }
  findAll() {
  return this.medicationModel.find().exec();
}

  // Recherche d'un médicament par nom : renvoie toutes les pharmacies (centrale + partenaires) le proposant
  search(name: string) {
    const searchTerms = this.buildSearchTerms(name);
    return this.medicationModel
      .find({
        $and: [
          {
            $or: searchTerms.map((term) => ({ name: { $regex: this.escapeRegExp(term), $options: 'i' } })),
          },
          { quantity: { $gt: 0 } },
        ],
      })
      // .populate('pharmacyId');
  }

  async findOne(id: string) {
    // const med = await this.medicationModel.findById(id).populate('pharmacyId');
    const med = await this.medicationModel.findById(id);
    if (!med) throw new NotFoundException('Médicament introuvable');
    return med;
  }

  async update(id: string, data: Partial<Medication>) {
    if (data.quantity !== undefined) {
      data.outOfStock = data.quantity <= 0;
    }
    const med = await this.medicationModel.findByIdAndUpdate(id, data, { new: true });
    if (!med) throw new NotFoundException('Médicament introuvable');
    return med;
  }

  async remove(id: string) {
    const res = await this.medicationModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Médicament introuvable');
  }
}
