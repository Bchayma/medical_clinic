import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Doctor, DoctorDocument, DoctorType } from './schemas/doctor.schema';
import { UsersService } from '../users/users.service';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>,
    private usersService: UsersService,
  ) {}

  // Créé par l'admin : crée le compte User + le profil Doctor lié
  async create(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    type: DoctorType;
    speciality: string;
    licenseNumber?: string;
  }) {
    const role = data.type === DoctorType.INTERNAL ? Role.DOCTOR_INTERNAL : Role.DOCTOR_EXTERNAL;
    const user = await this.usersService.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      phone: data.phone,
      role,
    });

    const doctor = await new this.doctorModel({
      userId: user.id,
      type: data.type,
      speciality: data.speciality,
      licenseNumber: data.licenseNumber,
    }).save();

    await this.usersService.linkProfile(user.id, doctor.id, 'Doctor');
    return doctor;
  }

  findAll(type?: DoctorType) {
    const filter = type ? { type } : {};
    return this.doctorModel.find(filter).populate('userId', '-password').populate('cabinetId');
  }

  async findOne(id: string) {
    const doctor = await this.doctorModel
      .findById(id)
      .populate('userId', '-password')
      .populate('cabinetId');
    if (!doctor) throw new NotFoundException('Médecin introuvable');
    return doctor;
  }

  findByUserId(userId: string) {
    return this.doctorModel.findOne({ userId }).populate('cabinetId');
  }

  async assignCabinet(doctorId: string, cabinetId: string) {
    const doctor = await this.doctorModel.findById(doctorId);
    if (!doctor) throw new NotFoundException('Médecin introuvable');
    if (doctor.type !== DoctorType.INTERNAL) {
      throw new NotFoundException("Impossible d'associer un cabinet à un médecin externe");
    }
    doctor.cabinetId = cabinetId as any;
    return doctor.save();
  }

  async update(id: string, data: any) {
    const { firstName, lastName, email, phone, isActive, ...doctorData } = data;
    const doctor = await this.doctorModel.findByIdAndUpdate(id, doctorData, { new: true });
    if (!doctor) throw new NotFoundException('Médecin introuvable');
    const userUpdate: any = {};
    if (firstName !== undefined) userUpdate.firstName = firstName;
    if (lastName !== undefined) userUpdate.lastName = lastName;
    if (email !== undefined) userUpdate.email = email;
    if (phone !== undefined) userUpdate.phone = phone;
    if (isActive !== undefined) userUpdate.isActive = isActive;
    if (Object.keys(userUpdate).length) await this.usersService.update(doctor.userId.toString(), userUpdate);
    return doctor.populate('userId');
  }

  async updateAvailability(id: string, availability: any[]) {
    return this.update(id, { availability } as any);
  }

  async remove(id: string) {
    const doctor = await this.doctorModel.findByIdAndDelete(id);
    if (!doctor) throw new NotFoundException('Médecin introuvable');
    await this.usersService.remove(doctor.userId.toString()).catch(() => undefined);
  }
}
