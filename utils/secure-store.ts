import * as SecureStore from 'expo-secure-store';

const STORAGE_KEYS = {
  GOOGLE_IOS_CLIENT_ID: 'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID',
  GOOGLE_WEB_CLIENT_ID: 'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID',
  SENTRY_DSN: 'SENTRY_DSN',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export const setSecureValue = async (key: StorageKey, value: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error(`Error storing ${key} in SecureStore:`, error);
    throw error;
  }
};

export const getSecureValue = async (key: StorageKey): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`Error retrieving ${key} from SecureStore:`, error);
    return null;
  }
};

export const deleteSecureValue = async (key: StorageKey): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error(`Error deleting ${key} from SecureStore:`, error);
    throw error;
  }
};

export const storeEnvToSecureStore = async (envVars: {
  googleIosClientId?: string;
  googleWebClientId?: string;
  sentryDsn?: string;
}): Promise<void> => {
  const promises: Promise<void>[] = [];

  if (envVars.googleIosClientId) {
    promises.push(setSecureValue(STORAGE_KEYS.GOOGLE_IOS_CLIENT_ID, envVars.googleIosClientId));
  }
  if (envVars.googleWebClientId) {
    promises.push(setSecureValue(STORAGE_KEYS.GOOGLE_WEB_CLIENT_ID, envVars.googleWebClientId));
  }
  if (envVars.sentryDsn) {
    promises.push(setSecureValue(STORAGE_KEYS.SENTRY_DSN, envVars.sentryDsn));
  }

  await Promise.all(promises);
};

export const getEnvFromSecureStore = async (): Promise<{
  googleIosClientId: string | null;
  googleWebClientId: string | null;
  sentryDsn: string | null;
}> => {
  const [googleIosClientId, googleWebClientId, sentryDsn] = await Promise.all([
    getSecureValue(STORAGE_KEYS.GOOGLE_IOS_CLIENT_ID),
    getSecureValue(STORAGE_KEYS.GOOGLE_WEB_CLIENT_ID),
    getSecureValue(STORAGE_KEYS.SENTRY_DSN),
  ]);

  return {
    googleIosClientId,
    googleWebClientId,
    sentryDsn,
  };
};

export const initializeSecureStoreFromEnv = async (): Promise<void> => {
  const envVars = {
    googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    sentryDsn: process.env.SENTRY_DSN,
  };

  const stored = await getEnvFromSecureStore();

  if (envVars.googleIosClientId && !stored.googleIosClientId) {
    await setSecureValue(STORAGE_KEYS.GOOGLE_IOS_CLIENT_ID, envVars.googleIosClientId);
  }
  if (envVars.googleWebClientId && !stored.googleWebClientId) {
    await setSecureValue(STORAGE_KEYS.GOOGLE_WEB_CLIENT_ID, envVars.googleWebClientId);
  }
  if (envVars.sentryDsn && !stored.sentryDsn) {
    await setSecureValue(STORAGE_KEYS.SENTRY_DSN, envVars.sentryDsn);
  }
};

export const clearSecureStore = async (): Promise<void> => {
  const promises = Object.values(STORAGE_KEYS).map((key) => deleteSecureValue(key));
  await Promise.all(promises);
};

export { STORAGE_KEYS };
