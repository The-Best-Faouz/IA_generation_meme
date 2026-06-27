import { useState, useEffect, useCallback } from 'react';
import {
  NotificationListenerService,
  CapturedNotification,
} from '../services/notificationListener.service';

export type { CapturedNotification };

export function useNotificationListener() {
  const [notifications, setNotifications] = useState<CapturedNotification[]>([]);
  const [isGranted, setIsGranted] = useState(false);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    (async () => {
      const granted = await NotificationListenerService.isPermissionGranted();
      setIsGranted(granted);
    })();
  }, []);

  const requestPermission = useCallback(() => {
    NotificationListenerService.requestPermission();
  }, []);

  const startListening = useCallback(async () => {
    NotificationListenerService.startListening();
    setIsListening(true);
    const existing = await NotificationListenerService.getCapturedNotifications();
    setNotifications(existing);
  }, []);

  const stopListening = useCallback(() => {
    NotificationListenerService.stopListening();
    setIsListening(false);
  }, []);

  const clearNotifications = useCallback(() => {
    NotificationListenerService.clearCapturedNotifications();
    setNotifications([]);
  }, []);

  useEffect(() => {
    const unsubscribe = NotificationListenerService.addListener((notif) => {
      setNotifications(prev => [notif, ...prev].slice(0, 200));
    });
    return () => {
      unsubscribe();
      try { NotificationListenerService.stopListening(); } catch {}
    };
  }, []);

  return {
    notifications,
    isGranted,
    isListening,
    requestPermission,
    startListening,
    stopListening,
    clearNotifications,
  };
}
