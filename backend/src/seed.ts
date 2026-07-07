/**
 * Script de seed : crée un compte administrateur initial.
 * Usage : npm run seed
 */
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { UserSchema } from './users/schemas/user.schema';
import { Role } from './common/enums/role.enum';

dotenv.config();

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/clinicdb';
  await mongoose.connect(uri);

  const UserModel = mongoose.model('User', UserSchema);

  const existing = await UserModel.findOne({ email: 'admin@clinic.com' });
  if (existing) {
    console.log('Un admin existe déjà : admin@clinic.com');
    await mongoose.disconnect();
    return;
  }

  const hashed = await bcrypt.hash('Admin123!', 10);
  await UserModel.create({
    firstName: 'Super',
    lastName: 'Admin',
    email: 'admin@clinic.com',
    password: hashed,
    role: Role.ADMIN,
    isActive: true,
  });

  console.log('Admin créé : admin@clinic.com / Admin123!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
