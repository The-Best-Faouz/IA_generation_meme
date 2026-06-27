import { NativeModules, DeviceEventEmitter, Platform } from 'react-native';

const { KLIPClipboardModule } = NativeModules;

export const ClipboardService = {
  isAvailable: () => Platform.OS === 'android' && KLIPClipboardModule != null,

  async getContent(): Promise<string | null> {
    if (!this.isAvailable()) return null;
    try {
      return await KLIPClipboardModule.getContent();
    } catch {
      return null;
    }
  },

  startMonitoring(): void {
    if (!this.isAvailable()) return;
    KLIPClipboardModule.startMonitoring();
  },

  stopMonitoring(): void {
    if (!this.isAvailable()) return;
    KLIPClipboardModule.stopMonitoring();
  },

  addListener(callback: (data: { text: string; timestamp: number }) => void) {
    const subscription = DeviceEventEmitter.addListener('onClipboardChange', callback);
    return () => subscription.remove();
  },
};
