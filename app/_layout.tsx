import '../global.css';

import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import * as Sentry from '@sentry/react-native';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

import { useIsMounted } from '@/hooks/use-is-mounted';
import { supabase } from '@/utils/supabase';
import { useUserStore } from '@/store/user';
import { NAV_THEME } from '@/lib/theme';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  sendDefaultPii: true,
  enableLogs: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.mobileReplayIntegration(),
    Sentry.feedbackIntegration(),
    Sentry.supabaseIntegration({ supabaseClient: supabase }),
  ],
});

export const unstable_settings = {
  initialRouteName: 'index',
};

export default Sentry.wrap(function Layout() {
  const colorScheme = useColorScheme() || 'light';
  const { isUserAuthenticated, setUser, setSession } = useUserStore();
  const isMounted = useIsMounted();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = isUserAuthenticated();
      if (isAuthenticated) {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) {
          return;
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError) {
          return;
        }

        setUser(user);
        setSession(session);
      }
    };

    if (isMounted()) {
      checkAuth();
    }
  }, [isMounted, isUserAuthenticated, setUser, setSession]);

  return (
    <ThemeProvider value={NAV_THEME[colorScheme]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack />
      <PortalHost />
    </ThemeProvider>
  );
});
