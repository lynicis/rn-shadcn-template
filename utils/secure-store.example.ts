/**
 * Example usage of SecureStore utilities
 *
 * This file demonstrates how to use the secure store utilities
 * to store and retrieve environment variables from .env.example
 */

import {
  initializeSecureStoreFromEnv,
  getEnvFromSecureStore,
  storeEnvToSecureStore,
  clearSecureStore,
  getSecureValue,
  setSecureValue,
  STORAGE_KEYS,
} from './secure-store';

// Example 1: Store environment variables from .env
export const exampleStoreEnv = async () => {
  await storeEnvToSecureStore({
    googleIosClientId: 'your-ios-client-id',
    googleWebClientId: 'your-web-client-id',
    sentryDsn: 'your-sentry-dsn',
  });
};

// Example 2: Retrieve all stored values
export const exampleGetEnv = async () => {
  const env = await getEnvFromSecureStore();
  console.log('Google iOS Client ID:', env.googleIosClientId);
  console.log('Google Web Client ID:', env.googleWebClientId);
  console.log('Sentry DSN:', env.sentryDsn);
};

// Example 3: Initialize from process.env (useful for migration)
export const exampleInitializeFromEnv = async () => {
  // This will copy values from process.env to SecureStore
  // if they don't already exist in SecureStore
  await initializeSecureStoreFromEnv();
};

// Example 4: Store a single value
export const exampleStoreSingle = async () => {
  await setSecureValue(STORAGE_KEYS.GOOGLE_IOS_CLIENT_ID, 'your-new-ios-client-id');
};

// Example 5: Get a single value
export const exampleGetSingle = async () => {
  const iosClientId = await getSecureValue(STORAGE_KEYS.GOOGLE_IOS_CLIENT_ID);
  console.log('Stored iOS Client ID:', iosClientId);
};

// Example 6: Clear all stored values
export const exampleClear = async () => {
  await clearSecureStore();
};

// Example 7: Using the React hook (in a component)
/*
import { useSecureEnv } from '@/hooks/use-secure-env';

function MyComponent() {
  const { values, isLoading, error, refresh, updateValue, initializeFromEnv } = useSecureEnv();

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View>
      <Text>Google iOS Client ID: {values.googleIosClientId || 'Not set'}</Text>
      <Text>Google Web Client ID: {values.googleWebClientId || 'Not set'}</Text>
      <Text>Sentry DSN: {values.sentryDsn || 'Not set'}</Text>
      <Button 
        title="Refresh" 
        onPress={refresh} 
      />
      <Button 
        title="Initialize from .env" 
        onPress={initializeFromEnv} 
      />
    </View>
  );
}
*/
