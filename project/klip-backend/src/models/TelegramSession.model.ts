import mongoose, { Schema, Document } from 'mongoose';

export interface ITelegramSession extends Document {
  userId: mongoose.Types.ObjectId;
  botToken: string;
  chatIds: string[];
  isActive: boolean;
  createdAt: Date;
}

const TelegramSessionSchema = new Schema<ITelegramSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    botToken: { type: String, required: true },
    chatIds: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const TelegramSession = mongoose.model<ITelegramSession>('TelegramSession', TelegramSessionSchema);
