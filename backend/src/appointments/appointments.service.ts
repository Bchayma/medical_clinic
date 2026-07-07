import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment, AppointmentDocument, AppointmentStatus } from './schemas/appointment.schema';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
  ) {}

  create(data: Partial<Appointment>) {
    return new this.appointmentModel(data).save();
  }

  findAll() {
    return this.appointmentModel.find().populate('patientId').populate('doctorId').populate('cabinetId');
  }

  findByDoctor(doctorId: string) {
    return this.appointmentModel.find({ doctorId }).populate('patientId').populate('cabinetId');
  }

  findByCabinet(cabinetId: string) {
    return this.appointmentModel.find({ cabinetId }).populate('patientId').populate('doctorId');
  }

  findByPatient(patientId: string) {
    return this.appointmentModel.find({ patientId }).populate('doctorId').populate('cabinetId');
  }

  async findOne(id: string) {
    const appt = await this.appointmentModel
      .findById(id)
      .populate('patientId')
      .populate('doctorId')
      .populate('cabinetId');
    if (!appt) throw new NotFoundException('Rendez-vous introuvable');
    return appt;
  }

  async updateStatus(id: string, status: AppointmentStatus) {
    const appt = await this.appointmentModel.findByIdAndUpdate(id, { status }, { new: true });
    if (!appt) throw new NotFoundException('Rendez-vous introuvable');
    return appt;
  }

  async update(id: string, data: Partial<Appointment>) {
    const appt = await this.appointmentModel.findByIdAndUpdate(id, data, { new: true });
    if (!appt) throw new NotFoundException('Rendez-vous introuvable');
    return appt;
  }

  async remove(id: string) {
    const res = await this.appointmentModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Rendez-vous introuvable');
  }
}
