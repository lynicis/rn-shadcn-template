import {
  isSuccessResponse,
  isErrorWithCode,
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform, Image, View } from 'react-native';
import { useColorScheme } from 'nativewind';
import { useRouter } from 'expo-router';

import { Button } from '@/components/ui/button';
import { supabase } from '@/utils/supabase';
import { useUserStore } from '@/store/user';
import { expo } from '@/app.json';
import { cn } from '@/lib/utils';

const SOCIAL_CONNECTION_STRATEGIES = [
  {
    type: 'oauth_apple',
    source: { uri: 'https://img.clerk.com/static/apple.png?width=160' },
    useTint: true,
  },
  {
    type: 'oauth_google',
    source: { uri: 'https://img.clerk.com/static/google.png?width=160' },
    useTint: false,
  },
];

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
});

export function SocialConnections() {
  const { colorScheme } = useColorScheme();
  const router = useRouter();
  const { setUser, setSession } = useUserStore();

  const nativeSignInWithApple = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        const { error: signInWithAppleError } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });

        if (!signInWithAppleError) {
          if (credential.fullName) {
            const nameParts = [];
            if (credential.fullName.givenName) nameParts.push(credential.fullName.givenName);
            if (credential.fullName.middleName) nameParts.push(credential.fullName.middleName);
            if (credential.fullName.familyName) nameParts.push(credential.fullName.familyName);

            const fullName = nameParts.join(' ');
            await supabase.auth.updateUser({
              data: {
                full_name: fullName,
                given_name: credential.fullName.givenName,
                family_name: credential.fullName.familyName,
              },
            });
          }
        }
      }
    } catch {
      /* if (error.code !== 'ERR_REQUEST_CANCELED') {
      } */
    }
  };

  const webSignInWithApple = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${expo.scheme}://`,
        skipBrowserRedirect: true,
      },
    });
  };

  const onAppleButtonPress = async () => {
    const isNativeSignInAvailable = await AppleAuthentication.isAvailableAsync();
    if (isNativeSignInAvailable) {
      nativeSignInWithApple();
    } else {
      webSignInWithApple();
    }
  };

  const onGoogleButtonPress = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        const { data, error: signInWithGoogleError } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: response.data.idToken!,
        });

        if (signInWithGoogleError) {
          console.error('Supabase sign-in error:', signInWithGoogleError);
          return;
        }

        if (data?.user && data?.session) {
          setUser(data.user);
          setSession(data.session);
          router.push('/(dashboard)');
        }
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            // User cancelled the login flow
            console.log('Google sign-in cancelled');
            break;
          case statusCodes.IN_PROGRESS:
            // operation (eg. sign in) already in progress
            console.log('Google sign-in already in progress');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            // Android only, play services not available or outdated
            console.error('Play services not available');
            break;
          default:
            console.error('Google sign-in error:', error);
        }
      } else {
        console.error('Unexpected Google sign-in error:', error);
      }
    }
  };

  return (
    <View className="gap-2 sm:flex-row sm:gap-3">
      {SOCIAL_CONNECTION_STRATEGIES.map((strategy) => {
        return (
          <Button
            key={strategy.type}
            variant="outline"
            size="sm"
            className="sm:flex-1"
            onPress={strategy.type === 'oauth_google' ? onGoogleButtonPress : onAppleButtonPress}>
            <Image
              className={cn('size-4', strategy.useTint && Platform.select({ web: 'dark:invert' }))}
              tintColor={Platform.select({
                native: strategy.useTint ? (colorScheme === 'dark' ? 'white' : 'black') : undefined,
              })}
              source={strategy.source}
            />
          </Button>
        );
      })}
    </View>
  );
}
