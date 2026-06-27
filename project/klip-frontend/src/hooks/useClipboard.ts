import { useState, useEffect, useCallback } from 'react';
import { ClipboardService } from '../services/clipboard.service';

export function useClipboard() {
  const [lastCopiedText, setLastCopiedText] = useState<string | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const startMonitoring = useCallback(() => {
    ClipboardService.startMonitoring();
    setIsMonitoring(true);
  }, []);

  const stopMonitoring = useCallback(() => {
    ClipboardService.stopMonitoring();
    setIsMonitoring(false);
  }, []);

  useEffect(() => {
    const unsubscribe = ClipboardService.addListener((data) => {
      setLastCopiedText(data.text);
    });
    return () => {
      unsubscribe();
      ClipboardService.stopMonitoring();
    };
  }, []);

  return { lastCopiedText, isMonitoring, startMonitoring, stopMonitoring };
}
