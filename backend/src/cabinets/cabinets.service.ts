import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cabinet, CabinetDocument } from './schemas/cabinet.schema';

@Injectable()
export class CabinetsService {
  constructor(@InjectModel(Cabinet.name) private cabinetModel: Model<CabinetDocument>) {}

  create(data: Partial<Cabinet>) {
    return new this.cabinetModel(data).save();
  }

  findAll() {
    return this.cabinetModel.find().populate('doctorId');
  }

  async findOne(id: string) {
    const cabinet = await this.cabinetModel.findById(id).populate('doctorId');
    if (!cabinet) throw new NotFoundException('Cabinet introuvable');
    return cabinet;
  }

  findByDoctor(doctorId: string) {
    return this.cabinetModel.findOne({ doctorId });
  }

  async update(id: string, data: Partial<Cabinet>) {
    const cabinet = await this.cabinetModel.findByIdAndUpdate(id, data, { new: true });
    if (!cabinet) throw new NotFoundException('Cabinet introuvable');
    return cabinet;
  }

  async remove(id: string) {
    const res = await this.cabinetModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Cabinet introuvable');
  }
}
