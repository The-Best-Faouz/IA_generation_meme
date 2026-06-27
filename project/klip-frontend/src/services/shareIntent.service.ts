import { NativeModules, DeviceEventEmitter, Platform } from 'react-native';

const { ShareIntentModule } = NativeModules;

export interface SharedContent {
  type: 'text' | 'image' | 'video' | 'multiple';
  text?: string;
  imageUri?: string;
  videoUri?: string;
  uris?: string[];
}

export const ShareIntentService = {
  isAvailable: () => Platform.OS === 'android' && ShareIntentModule != null,

  async getSharedContent(): Promise<SharedContent | null> {
    if (!this.isAvailable()) return null;
    try {
      const result = await ShareIntentModule.getSharedContent();
      return result as SharedContent | null;
    } catch {
      return null;
    }
  },

  async clearSharedContent(): Promise<void> {
    if (!this.isAvailable()) return;
    try {
      await ShareIntentModule.clearSharedContent();
    } catch {}
  },

  addListener(callback: () => void) {
    const subscription = DeviceEventEmitter.addListener('onNewShareIntent', callback);
    return () => subscription.remove();
  },
};
