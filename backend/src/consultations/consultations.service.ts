import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Consultation, ConsultationDocument } from './schemas/consultation.schema';

@Injectable()
export class ConsultationsService {
  constructor(
    @InjectModel(Consultation.name) private consultationModel: Model<ConsultationDocument>,
  ) {}

  create(data: Partial<Consultation>) {
    return new this.consultationModel(data).save();
  }

  findAll() {
    return this.consultationModel.find().populate('patientId').populate('doctorId');
  }

  findByPatient(patientId: string) {
    return this.consultationModel
      .find({ patientId })
      .populate('doctorId')
      .populate('prescriptions')
      .sort({ date: -1 });
  }

  findByDoctor(doctorId: string) {
    return this.consultationModel.find({ doctorId }).populate('patientId').sort({ date: -1 });
  }

  async findOne(id: string) {
    const consultation = await this.consultationModel
      .findById(id)
      .populate('patientId')
      .populate('doctorId')
      .populate('prescriptions');
    if (!consultation) throw new NotFoundException('Consultation introuvable');
    return consultation;
  }

  async update(id: string, data: Partial<Consultation>) {
    const consultation = await this.consultationModel.findByIdAndUpdate(id, data, { new: true });
    if (!consultation) throw new NotFoundException('Consultation introuvable');
    return consultation;
  }

  async addPrescription(id: string, prescriptionId: string) {
    const consultation = await this.consultationModel.findById(id);
    if (!consultation) throw new NotFoundException('Consultation introuvable');
    consultation.prescriptions.push(prescriptionId as any);
    return consultation.save();
  }

  async remove(id: string) {
    const res = await this.consultationModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Consultation introuvable');
  }
}
