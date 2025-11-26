import { useEffect, useState } from 'react';

import {
  initializeSecureStoreFromEnv,
  getEnvFromSecureStore,
  storeEnvToSecureStore,
  type StorageKey,
} from '@/utils/secure-store';

interface SecureEnvValues {
  googleIosClientId: string | null;
  googleWebClientId: string | null;
  sentryDsn: string | null;
}

interface UseSecureEnvReturn {
  values: SecureEnvValues;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  updateValue: (key: StorageKey, value: string) => Promise<void>;
  initializeFromEnv: () => Promise<void>;
}

export const useSecureEnv = (): UseSecureEnvReturn => {
  const [values, setValues] = useState<SecureEnvValues>({
    googleIosClientId: null,
    googleWebClientId: null,
    sentryDsn: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadValues = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const envValues = await getEnvFromSecureStore();
      setValues(envValues);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load secure values');
      setError(error);
      console.error('Error loading secure env values:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadValues();
  }, []);

  const updateValue = async (key: StorageKey, value: string) => {
    try {
      setError(null);
      const envMap: Partial<SecureEnvValues> = {};

      switch (key) {
        case 'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID':
          envMap.googleIosClientId = value;
          break;
        case 'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID':
          envMap.googleWebClientId = value;
          break;
        case 'SENTRY_DSN':
          envMap.sentryDsn = value;
          break;
      }

      await storeEnvToSecureStore(envMap as any);
      await loadValues();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update secure value');
      setError(error);
      throw error;
    }
  };

  const initializeFromEnv = async () => {
    try {
      setError(null);
      await initializeSecureStoreFromEnv();
      await loadValues();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize from env');
      setError(error);
      throw error;
    }
  };

  return {
    values,
    isLoading,
    error,
    refresh: loadValues,
    updateValue,
    initializeFromEnv,
  };
};
