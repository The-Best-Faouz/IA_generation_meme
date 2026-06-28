import { NativeModules, Platform } from 'react-native';

const { StatusRemixerModule } = NativeModules;

export interface WhatsAppStatus {
  uri: string;
  fileName: string;
  timestamp: number;
  type: 'image' | 'video';
}

async function scanStatuses(): Promise<WhatsAppStatus[]> {
  try {
    if (Platform.OS === 'android' && StatusRemixerModule?.scanStatuses) {
      const result = await StatusRemixerModule.scanStatuses();
      return result ?? [];
    }
  } catch {}
  return [];
}

export const WhatsAppStatusService = {
  scanStatuses,
};
