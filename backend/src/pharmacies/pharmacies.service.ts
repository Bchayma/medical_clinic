import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pharmacy, PharmacyDocument, PharmacyType } from './schemas/pharmacy.schema';
import { UsersService } from '../users/users.service';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class PharmaciesService {
  constructor(
    @InjectModel(Pharmacy.name) private pharmacyModel: Model<PharmacyDocument>,
    private usersService: UsersService,
  ) {}

  async create(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    name: string;
    type: PharmacyType;
    address?: string;
    contact?: string;
  }) {
    const role = data.type === PharmacyType.CENTRAL ? Role.PHARMACY_CENTRAL : Role.PHARMACY_PARTNER;
    const user = await this.usersService.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      phone: data.phone,
      role,
    });

    const pharmacy = await new this.pharmacyModel({
      userId: user.id,
      name: data.name,
      type: data.type,
      address: data.address,
      contact: data.contact,
    }).save();

    await this.usersService.linkProfile(user.id, pharmacy.id, 'Pharmacy');
    return pharmacy;
  }

  findAll(type?: PharmacyType) {
    const filter = type ? { type } : {};
    return this.pharmacyModel.find(filter);
  }

  async findOne(id: string) {
    const pharmacy = await this.pharmacyModel.findById(id);
    if (!pharmacy) throw new NotFoundException('Pharmacie introuvable');
    return pharmacy;
  }

  findByUserId(userId: string) {
    return this.pharmacyModel.findOne({ userId });
  }

  async update(id: string, data: any) {
    const { firstName, lastName, email, phone, isActive, ...pharmacyData } = data;
    const pharmacy = await this.pharmacyModel.findByIdAndUpdate(id, pharmacyData, { new: true });
    if (!pharmacy) throw new NotFoundException('Pharmacie introuvable');
    const userUpdate: any = {};
    if (firstName !== undefined) userUpdate.firstName = firstName;
    if (lastName !== undefined) userUpdate.lastName = lastName;
    if (email !== undefined) userUpdate.email = email;
    if (phone !== undefined) userUpdate.phone = phone;
    if (isActive !== undefined) userUpdate.isActive = isActive;
    if (Object.keys(userUpdate).length) await this.usersService.update(pharmacy.userId.toString(), userUpdate);
    return pharmacy;
  }

  async remove(id: string) {
    const pharmacy = await this.pharmacyModel.findByIdAndDelete(id);
    if (!pharmacy) throw new NotFoundException('Pharmacie introuvable');
    await this.usersService.remove(pharmacy.userId.toString()).catch(() => undefined);
  }
}
