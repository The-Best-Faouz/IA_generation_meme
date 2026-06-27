import { useState, useEffect, useCallback } from 'react';
import { ShareIntentService, SharedContent } from '../services/shareIntent.service';

export function useShareIntent() {
  const [sharedContent, setSharedContent] = useState<SharedContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkForShare = useCallback(async () => {
    setIsLoading(true);
    try {
      const content = await ShareIntentService.getSharedContent();
      if (content) {
        setSharedContent(content);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearShare = useCallback(async () => {
    await ShareIntentService.clearSharedContent();
    setSharedContent(null);
  }, []);

  useEffect(() => {
    checkForShare();
    const unsubscribe = ShareIntentService.addListener(() => {
      checkForShare();
    });
    return unsubscribe;
  }, [checkForShare]);

  return { sharedContent, isLoading, clearShare, checkForShare };
}
