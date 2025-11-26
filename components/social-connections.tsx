import {
  isSuccessResponse,
  isErrorWithCode,
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import { SplashScreen, useRouter } from 'expo-router';
import { Platform, Image, View } from 'react-native';
import { useColorScheme } from 'nativewind';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner-native';

import { useSecureEnv } from '@/hooks/use-secure-env';
import { Button } from '@/components/ui/button';
import { supabase } from '@/utils/supabase';
import { useUserStore } from '@/store/user';
import { expo } from '@/app.json';
import { cn } from '@/lib/utils';
import i18n from '@/locales';

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

SplashScreen.preventAutoHideAsync();

export function SocialConnections() {
  const { values, isLoading } = useSecureEnv();
  const isGoogleConfigured = useRef(false);

  const { colorScheme } = useColorScheme();
  const router = useRouter();

  const { setUser, setSession } = useUserStore();

  useEffect(() => {
    if (
      !isLoading &&
      values.googleWebClientId &&
      values.googleIosClientId &&
      !isGoogleConfigured.current
    ) {
      GoogleSignin.configure({
        webClientId: values.googleWebClientId,
        iosClientId: values.googleIosClientId,
      });
      isGoogleConfigured.current = true;
    }
  }, [isLoading, values.googleWebClientId, values.googleIosClientId]);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  const nativeSignInWithApple = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        const { data, error: signInWithAppleError } = await supabase.auth.signInWithIdToken({
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

          setUser(data.user);
          setSession(data.session);
          toast.success(i18n.t('signIn.success'));
          setTimeout(() => router.push('/(dashboard)'), 600);
        }
      }
    } catch (error) {
      if ((error as { code?: string }).code !== 'ERR_REQUEST_CANCELED') {
        toast.error(i18n.t('signIn.errorGeneric'));
      }
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
      await nativeSignInWithApple();
    } else {
      await webSignInWithApple();
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
          return toast.error(i18n.t('signIn.errorGeneric'));
        }

        setUser(data.user);
        setSession(data.session);
        toast.success(i18n.t('signIn.success'));
        setTimeout(() => router.push('/(dashboard)'), 600);
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          toast.error(i18n.t('signIn.playServicesNotAvailable'));
        }
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
