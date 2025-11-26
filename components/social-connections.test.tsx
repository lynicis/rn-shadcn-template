import { fireEvent, waitFor, render } from '@testing-library/react-native';
import React from 'react';

import { SocialConnections } from './social-connections';

// Mocks
const mockHasPlayServices = jest.fn();
const mockGoogleSignIn = jest.fn();

const mockAppleSignInAsync = jest.fn();
const mockAppleIsAvailable = jest.fn();

const mockSignInWithIdToken = jest.fn();
const mockSignInWithOAuth = jest.fn();
const mockUpdateUser = jest.fn();

const mockSetUser = jest.fn();
const mockSetSession = jest.fn();

const mockPush = jest.fn();

const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: (...args: unknown[]) => mockHasPlayServices(...args),
    signIn: (...args: unknown[]) => mockGoogleSignIn(...args),
  },
  isSuccessResponse: (response: any) => !!response?.data?.idToken,
  isErrorWithCode: (error: any) => !!error?.code,
  statusCodes: {
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  },
}));

jest.mock('expo-apple-authentication', () => ({
  __esModule: true,
  signInAsync: (...args: unknown[]) => mockAppleSignInAsync(...args),
  isAvailableAsync: (...args: unknown[]) => mockAppleIsAvailable(...args),
  AppleAuthenticationScope: {
    FULL_NAME: 'FULL_NAME',
    EMAIL: 'EMAIL',
  },
}));

jest.mock('expo-router', () => ({
  SplashScreen: {
    preventAutoHideAsync: jest.fn(),
    hideAsync: jest.fn(),
  },
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('nativewind', () => ({
  cssInterop: jest.fn((component: unknown) => component),
  remapProps: jest.fn((component: unknown) => component),
  useColorScheme: () => ({ colorScheme: 'light' as const }),
}));

jest.mock('@/hooks/use-secure-env', () => ({
  useSecureEnv: () => ({
    values: {
      googleIosClientId: 'ios-client-id',
      googleWebClientId: 'web-client-id',
      sentryDsn: null,
    },
    isLoading: false,
    error: null,
    refresh: jest.fn(),
    updateValue: jest.fn(),
    initializeFromEnv: jest.fn(),
  }),
}));

jest.mock('@/utils/supabase', () => ({
  supabase: {
    auth: {
      signInWithIdToken: (...args: unknown[]) => mockSignInWithIdToken(...args),
      signInWithOAuth: (...args: unknown[]) => mockSignInWithOAuth(...args),
      updateUser: (...args: unknown[]) => mockUpdateUser(...args),
    },
  },
}));

jest.mock('@/store/user', () => ({
  useUserStore: () => ({
    setUser: mockSetUser,
    setSession: mockSetSession,
  }),
}));

jest.mock('sonner-native', () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

jest.mock('@/locales', () => ({
  __esModule: true,
  default: {
    t: (key: string) => {
      const messages: Record<string, string> = {
        'signIn.success': 'Signed in successfully',
        'signIn.errorGeneric': 'Something went wrong',
        'signIn.playServicesNotAvailable': 'Google Play Services not available',
      };
      return messages[key] ?? key;
    },
  },
}));

jest.mock('@/components/ui/button', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { TouchableOpacity } = require('react-native');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');

  return {
    Button: ({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) => (
      <TouchableOpacity testID="social-button" onPress={onPress}>
        {children}
      </TouchableOpacity>
    ),
  };
});

describe('SocialConnections', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders two social connection buttons', () => {
    const { getAllByTestId } = render(<SocialConnections />);

    expect(getAllByTestId('social-button')).toHaveLength(2);
  });

  it('signs in with Google and updates user on success', async () => {
    mockHasPlayServices.mockResolvedValueOnce(undefined);
    mockGoogleSignIn.mockResolvedValueOnce({
      data: { idToken: 'google-id-token' },
    });
    mockSignInWithIdToken.mockResolvedValueOnce({
      data: {
        user: { id: 'user-id' },
        session: { access_token: 'token' },
      },
      error: null,
    });

    const { getAllByTestId } = render(<SocialConnections />);
    const [, googleButton] = getAllByTestId('social-button');

    fireEvent.press(googleButton);

    await waitFor(() => {
      expect(mockHasPlayServices).toHaveBeenCalled();
      expect(mockGoogleSignIn).toHaveBeenCalled();
      expect(mockSignInWithIdToken).toHaveBeenCalledWith({
        provider: 'google',
        token: 'google-id-token',
      });
      expect(mockSetUser).toHaveBeenCalledWith({ id: 'user-id' });
      expect(mockSetSession).toHaveBeenCalledWith({ access_token: 'token' });
      expect(mockToastSuccess).toHaveBeenCalledWith('Signed in successfully');
    });
  });

  it('shows error toast when Google Play Services are not available', async () => {
    mockHasPlayServices.mockResolvedValueOnce(undefined);
    mockGoogleSignIn.mockRejectedValueOnce({
      code: 'PLAY_SERVICES_NOT_AVAILABLE',
    });

    const { getAllByTestId } = render(<SocialConnections />);
    const [, googleButton] = getAllByTestId('social-button');

    fireEvent.press(googleButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Google Play Services not available');
    });
  });

  it('uses native Apple sign-in when available and updates user on success', async () => {
    mockAppleIsAvailable.mockResolvedValueOnce(true);
    mockAppleSignInAsync.mockResolvedValueOnce({
      identityToken: 'apple-id-token',
      fullName: {
        givenName: 'John',
        familyName: 'Doe',
      },
    });
    mockSignInWithIdToken.mockResolvedValueOnce({
      data: {
        user: { id: 'user-id' },
        session: { access_token: 'token' },
      },
      error: null,
    });

    const { getAllByTestId } = render(<SocialConnections />);
    const [appleButton] = getAllByTestId('social-button');

    fireEvent.press(appleButton);

    await waitFor(() => {
      expect(mockAppleIsAvailable).toHaveBeenCalled();
      expect(mockAppleSignInAsync).toHaveBeenCalled();
      expect(mockSignInWithIdToken).toHaveBeenCalledWith({
        provider: 'apple',
        token: 'apple-id-token',
      });
      expect(mockSetUser).toHaveBeenCalledWith({ id: 'user-id' });
      expect(mockSetSession).toHaveBeenCalledWith({ access_token: 'token' });
      expect(mockToastSuccess).toHaveBeenCalledWith('Signed in successfully');
    });
  });

  it('falls back to web Apple OAuth when native sign-in is not available', async () => {
    mockAppleIsAvailable.mockResolvedValueOnce(false);

    const { getAllByTestId } = render(<SocialConnections />);
    const [appleButton] = getAllByTestId('social-button');

    fireEvent.press(appleButton);

    await waitFor(() => {
      expect(mockAppleIsAvailable).toHaveBeenCalled();
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'apple',
        options: {
          redirectTo: 'rnshadcn://',
          skipBrowserRedirect: true,
        },
      });
    });
  });
});
