import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Prescription, PrescriptionDocument } from './schemas/prescription.schema';
import { PharmacyStocksService } from '../pharmacy-stocks/pharmacy-stocks.service';

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectModel(Prescription.name) private prescriptionModel: Model<PrescriptionDocument>,
    private pharmacyStocksService: PharmacyStocksService,
  ) {}

  create(data: Partial<Prescription>) {
    return new this.prescriptionModel(data).save();
  }

  findAll() {
    return this.prescriptionModel.find().populate('patientId').populate('doctorId');
  }

  findByPatient(patientId: string) {
    return this.prescriptionModel.find({ patientId }).populate('doctorId').sort({ date: -1 });
  }

  findByDoctor(doctorId: string) {
    return this.prescriptionModel.find({ doctorId }).populate('patientId').sort({ date: -1 });
  }

  async findOne(id: string) {
    const prescription = await this.prescriptionModel
      .findById(id)
      .populate('patientId')
      .populate('doctorId');
    if (!prescription) throw new NotFoundException('Ordonnance introuvable');
    return prescription;
  }

  async findOneWithPharmacyAvailability(id: string) {
    const prescription = await this.prescriptionModel
      .findById(id)
      .populate('patientId')
      .populate('doctorId');

    if (!prescription) throw new NotFoundException('Ordonnance introuvable');

    const medications = await this.pharmacyStocksService.enrichPrescriptionMedications(
      prescription.medications,
    );

    return {
      ...prescription.toObject(),
      medications,
    };
  }

  async update(id: string, data: Partial<Prescription>) {
    const prescription = await this.prescriptionModel.findByIdAndUpdate(id, data, { new: true });
    if (!prescription) throw new NotFoundException('Ordonnance introuvable');
    return prescription;
  }

  async archive(id: string) {
    return this.update(id, { archived: true });
  }

  async remove(id: string) {
    const res = await this.prescriptionModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Ordonnance introuvable');
  }
}
