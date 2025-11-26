import '../global.css';

import { SplashScreen, useSegments, useRouter, Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import * as Sentry from '@sentry/react-native';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'nativewind';
import * as Linking from 'expo-linking';
import { Toaster } from 'sonner-native';

import { supabase } from '@/utils/supabase';
import { useUserStore } from '@/store/user';
import { NAV_THEME } from '@/lib/theme';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  sendDefaultPii: true,
  enableLogs: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],
});

export const unstable_settings = {
  initialRouteName: 'index',
};

SplashScreen.preventAutoHideAsync();

const createSessionFromUrl = async (url: string) => {
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) throw new Error(errorCode);

  const { access_token, refresh_token } = params;
  if (!access_token) return;

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) throw error;

  return data.session;
};

export default Sentry.wrap(function Layout() {
  const colorScheme = useColorScheme().colorScheme || 'light';
  const url = Linking.useLinkingURL();
  const router = useRouter();
  const segments = useSegments();

  const { setUser, setSession, clearUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);

  if (!isLoading) {
    SplashScreen.hideAsync();
  }

  useEffect(() => {
    if (url) {
      createSessionFromUrl(url);
    }
  }, [url]);

  useEffect(() => {
    const isOnAuthScreen = segments[0] === '(auth)' || !segments[0];

    const checkAuth = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          setSession(null);
          setUser(null);
          return setIsLoading(false);
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          setSession(null);
          setUser(null);
          return setIsLoading(false);
        }

        setUser(user);
        setSession(session);
        setIsLoading(false);
        router.replace('/(dashboard)');
      } catch {
        setSession(null);
        setUser(null);
        setIsLoading(false);
      }
    };

    if (isOnAuthScreen) {
      checkAuth();
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);

      if (event === 'SIGNED_IN' && session) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        setUser(user);
        router.replace('/(dashboard)');
      } else if (event === 'SIGNED_OUT') {
        clearUser();
        router.replace('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setSession, clearUser, router, segments]);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView>
        <ThemeProvider value={NAV_THEME[colorScheme]}>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <Stack />
          <PortalHost />
          <Toaster />
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
});
