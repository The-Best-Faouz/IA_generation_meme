import mongoose, { Schema, Document } from 'mongoose';

export interface IMeme extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'text' | 'image' | 'prompt' | 'faceswap' | 'gif';
  inputText: string;
  audioTranscription?: string;
  caption: string;
  imageUrl: string;
  webpUrl: string;
  gifUrl?: string;
  cloudinaryPublicId: string;
  aiProvider: string;
  createdAt: Date;
}

const MemeSchema = new Schema<IMeme>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true, enum: ['text', 'image', 'prompt', 'faceswap', 'gif'] },
    inputText: { type: String, required: true },
    audioTranscription: { type: String, default: null },
    caption: { type: String, required: true },
    imageUrl: { type: String, required: true },
    webpUrl: { type: String, required: true },
    gifUrl: { type: String, default: null },
    cloudinaryPublicId: { type: String, required: true },
    aiProvider: { type: String, required: true },
  },
  { timestamps: true }
);

export const Meme = mongoose.model<IMeme>('Meme', MemeSchema);
