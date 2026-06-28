import mongoose, { Schema, Document } from 'mongoose';

export interface IPromptCache extends Document {
  promptText: string;
  type: string;
  caption: string;
  provider: string;
  createdAt: Date;
}

const PromptCacheSchema: Schema = new Schema({
  promptText: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  caption: { type: String, required: true },
  provider: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 86400 } // Cache expires in 24 hours (86400 seconds)
});

export const PromptCache = mongoose.model<IPromptCache>('PromptCache', PromptCacheSchema);
