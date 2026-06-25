import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  country: string;
  language: string;
  refreshToken: string;
  telegramBotToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true },
    country: { type: String, required: true },
    language: { type: String, required: true, default: 'fr' },
    refreshToken: { type: String, default: '' },
    telegramBotToken: { type: String, default: null },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
