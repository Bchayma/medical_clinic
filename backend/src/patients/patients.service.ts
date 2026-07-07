import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Patient, PatientDocument } from './schemas/patient.schema';
import { UsersService } from '../users/users.service';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class PatientsService {
  constructor(
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
    private usersService: UsersService,
  ) {}

  // Création par le patient lui-même (inscription) ou par un médecin/admin
  async create(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    dateOfBirth?: Date;
    gender?: string;
    address?: string;
    doctorId?: string;
  }) {
    const user = await this.usersService.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      phone: data.phone,
      role: Role.PATIENT,
    });

    const patient = await new this.patientModel({
      userId: user.id,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      address: data.address,
      followedByDoctors: data.doctorId ? [data.doctorId] : [],
    }).save();

    await this.usersService.linkProfile(user.id, patient.id, 'Patient');
    return patient;
  }

  findAll() {
    return this.patientModel.find().populate('userId', '-password');
  }

  // Patients suivis par un médecin donné (utile pour le médecin externe : uniquement ses patients)
  findByDoctor(doctorId: string) {
    return this.patientModel
      .find({ followedByDoctors: doctorId })
      .populate('userId', '-password');
  }

  async findOne(id: string) {
    const patient = await this.patientModel.findById(id).populate('userId', '-password');
    if (!patient) throw new NotFoundException('Patient introuvable');
    return patient;
  }

  findByUserId(userId: string) {
    return this.patientModel.findOne({ userId }).populate('userId', '-password');
  }

  async update(id: string, data: any) {
    const { firstName, lastName, email, phone, isActive, ...patientData } = data;
    const patient = await this.patientModel.findByIdAndUpdate(id, patientData, { new: true });
    if (!patient) throw new NotFoundException('Patient introuvable');
    const userUpdate: any = {};
    if (firstName !== undefined) userUpdate.firstName = firstName;
    if (lastName !== undefined) userUpdate.lastName = lastName;
    if (email !== undefined) userUpdate.email = email;
    if (phone !== undefined) userUpdate.phone = phone;
    if (isActive !== undefined) userUpdate.isActive = isActive;
    if (Object.keys(userUpdate).length) await this.usersService.update(patient.userId.toString(), userUpdate);
    return patient.populate('userId');
  }

  async addMedicalNote(id: string, doctorId: string, note: string) {
    const patient = await this.patientModel.findById(id);
    if (!patient) throw new NotFoundException('Patient introuvable');
    patient.medicalNotes.push({ doctorId: doctorId as any, note, createdAt: new Date() });
    return patient.save();
  }

  async attachDoctor(id: string, doctorId: string) {
    const patient = await this.patientModel.findById(id);
    if (!patient) throw new NotFoundException('Patient introuvable');
    if (!patient.followedByDoctors.some((d) => d.toString() === doctorId)) {
      patient.followedByDoctors.push(doctorId as any);
      await patient.save();
    }
    return patient;
  }

  async remove(id: string) {
    const patient = await this.patientModel.findByIdAndDelete(id);
    if (!patient) throw new NotFoundException('Patient introuvable');
    await this.usersService.remove(patient.userId.toString()).catch(() => undefined);
  }
}
