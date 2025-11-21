import '../global.css';

import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { SplashScreen, useRouter, Stack } from 'expo-router';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import * as Sentry from '@sentry/react-native';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'nativewind';
import * as Linking from 'expo-linking';

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

  const { isUserAuthenticated, setUser, setSession } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);

  if (!isLoading) {
    SplashScreen.hideAsync();
  }

  if (url) {
    createSessionFromUrl(url);
  }

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);

      const isAuthenticated = isUserAuthenticated();
      if (isAuthenticated) {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) {
          setIsLoading(false);
          return;
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError) {
          setIsLoading(false);
          return;
        }

        setUser(user);
        setSession(session);
        setIsLoading(false);
        router.push('/(dashboard)');
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isUserAuthenticated, setUser, setSession, router]);

  return (
    <ThemeProvider value={NAV_THEME[colorScheme]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack />
      <PortalHost />
    </ThemeProvider>
  );
});
