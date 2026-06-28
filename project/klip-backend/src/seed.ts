import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from './models/User.model';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/klip';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connecté à MongoDB');

  const hashedPassword = await bcrypt.hash('123456', 12);
  const existing = await User.findOne({ email: 'djomgouemiguel@gmail.com' });
  if (existing) {
    existing.password = hashedPassword;
    existing.country = 'CM';
    existing.language = 'fr';
    await existing.save();
    console.log('Mot de passe mis à jour: 123456');
  } else {
    await User.create({
      email: 'djomgouemiguel@gmail.com',
      password: hashedPassword,
      country: 'CM',
      language: 'fr',
    });
    console.log('Utilisateur créé: djomgouemiguel@gmail.com / 123456');
  }

  const count = await User.countDocuments();
  console.log(`Total utilisateurs: ${count}`);

  await mongoose.disconnect();
}

seed().catch(console.error);
