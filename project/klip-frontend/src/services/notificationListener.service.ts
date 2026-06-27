import { NativeModules, DeviceEventEmitter, Platform } from 'react-native';

const { NotificationListenerModule } = NativeModules;

export interface CapturedNotification {
  packageName: string;
  title: string;
  text: string;
  subText: string;
  bigText: string;
  timestamp: string;
  key: string;
}

export const NotificationListenerService = {
  isAvailable: () => Platform.OS === 'android' && NotificationListenerModule != null,

  async isPermissionGranted(): Promise<boolean> {
    if (!this.isAvailable()) return false;
    try {
      return await NotificationListenerModule.isPermissionGranted();
    } catch {
      return false;
    }
  },

  requestPermission(): void {
    if (!this.isAvailable()) return;
    NotificationListenerModule.requestPermission();
  },

  startListening(): void {
    if (!this.isAvailable()) return;
    NotificationListenerModule.startListening();
  },

  stopListening(): void {
    if (!this.isAvailable()) return;
    NotificationListenerModule.stopListening();
  },

  async getCapturedNotifications(): Promise<CapturedNotification[]> {
    if (!this.isAvailable()) return [];
    try {
      return await NotificationListenerModule.getCapturedNotifications();
    } catch {
      return [];
    }
  },

  clearCapturedNotifications(): void {
    if (!this.isAvailable()) return;
    NotificationListenerModule.clearCapturedNotifications();
  },

  addListener(callback: (notification: CapturedNotification) => void) {
    const subscription = DeviceEventEmitter.addListener('onNotification', callback);
    return () => subscription.remove();
  },
};
