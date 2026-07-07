import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(data: Partial<User>): Promise<UserDocument> {
    const hashed = await bcrypt.hash(data.password as string, 10);
    const created = new this.userModel({ ...data, password: hashed });
    return created.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).select('+password');
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return user;
  }

  async findAll(role?: Role): Promise<UserDocument[]> {
    const filter = role ? { role } : {};
    return this.userModel.find(filter);
  }

  async update(id: string, data: Partial<User>): Promise<UserDocument> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const user = await this.userModel.findByIdAndUpdate(id, data, { new: true });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return user;
  }

  async setActive(id: string, isActive: boolean): Promise<UserDocument> {
    return this.update(id, { isActive });
  }

  async remove(id: string): Promise<void> {
    const res = await this.userModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Utilisateur introuvable');
  }

  async linkProfile(id: string, profileId: string, profileModel: string) {
    return this.userModel.findByIdAndUpdate(id, { profileId, profileModel }, { new: true });
  }

  async comparePasswords(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
