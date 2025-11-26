import { fireEvent, waitFor, render } from '@testing-library/react-native';
import React from 'react';

import { SignInForm } from './sign-in-form';

// Mock i18n before importing the component
jest.mock('@/locales', () => ({
  __esModule: true,
  default: {
    t: (key: string) => {
      const messages: Record<string, string> = {
        'signIn.headerTitle': 'Sign in',
        'signIn.description': 'Sign in description',
        'signIn.emailLabel': 'Email',
        'signIn.emailPlaceholder': 'Enter your email',
        'signIn.passwordLabel': 'Password',
        'signIn.button': 'Sign in',
        'signIn.noAccountQuestion': "Don't have an account?",
        'signIn.signUpLink': 'Sign up',
        'signIn.or': 'or',
        'signIn.forgotPassword': 'Forgot password?',
        'signIn.validation.emailInvalid': 'Email is invalid',
        'signIn.validation.emailRequired': 'Email is required',
        'signIn.validation.passwordMin': 'Password must be at least 8 characters',
        'signIn.errorGeneric': 'Could not sign in',
        'signIn.success': 'Signed in successfully',
      };
      return messages[key] ?? key;
    },
  },
}));

// Mocks
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

const mockSignInWithPassword = jest.fn();
jest.mock('@/utils/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
    },
  },
}));

const mockSetUser = jest.fn();
const mockSetSession = jest.fn();
jest.mock('@/store/user', () => ({
  useUserStore: () => ({
    setUser: mockSetUser,
    setSession: mockSetSession,
  }),
}));

const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();
jest.mock('sonner-native', () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

jest.mock('@/components/social-connections', () => ({
  SocialConnections: () => null,
}));

describe('SignInForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders email field, password label and sign in button', () => {
    const { getByPlaceholderText, getByText, getByTestId } = render(<SignInForm />);

    expect(getByPlaceholderText('Enter your email')).toBeTruthy();
    expect(getByText('Password')).toBeTruthy();
    expect(getByTestId('submit-button')).toBeTruthy();
  });

  it('shows validation error when email is invalid', async () => {
    const { getByPlaceholderText, queryByText, getByTestId } = render(<SignInForm />);

    const emailInput = getByPlaceholderText('Enter your email');
    fireEvent.changeText(emailInput, 'invalid-email');

    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(queryByText('Email is invalid')).toBeTruthy();
    });
  });

  it('shows validation error when password is too short', async () => {
    const { getByPlaceholderText, getByTestId, queryByText } = render(<SignInForm />);

    const emailInput = getByPlaceholderText('Enter your email');
    const passwordInput = getByTestId('password-input');

    fireEvent.changeText(emailInput, 'user@example.com');
    fireEvent.changeText(passwordInput, 'short');

    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(queryByText('Password must be at least 8 characters')).toBeTruthy();
    });
  });

  it('calls supabase signInWithPassword, updates store and shows success toast on success', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: {
        user: { id: 'user-id' },
        session: { access_token: 'token' },
      },
      error: null,
    });

    const { getByPlaceholderText, getByTestId } = render(<SignInForm />);

    const emailInput = getByPlaceholderText('Enter your email');
    const passwordInput = getByTestId('password-input');

    fireEvent.changeText(emailInput, 'user@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      });
      expect(mockSetUser).toHaveBeenCalled();
      expect(mockSetSession).toHaveBeenCalled();
      expect(mockToastSuccess).toHaveBeenCalledWith('Signed in successfully');
    });
  });

  it('shows generic error toast when signInWithPassword returns error', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Invalid credentials' },
    });

    const { getByPlaceholderText, getByTestId } = render(<SignInForm />);

    const emailInput = getByPlaceholderText('Enter your email');
    const passwordInput = getByTestId('password-input');

    fireEvent.changeText(emailInput, 'user@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalled();
      expect(mockToastError).toHaveBeenCalledWith('Could not sign in');
      expect(mockSetUser).not.toHaveBeenCalled();
      expect(mockSetSession).not.toHaveBeenCalled();
    });
  });

  it('navigates to forgot password screen when pressing the link', () => {
    const { getByText } = render(<SignInForm />);

    const forgotPasswordButton = getByText('Forgot password?');
    fireEvent.press(forgotPasswordButton);

    expect(mockPush).toHaveBeenCalledWith('/(auth)/forgot-password');
  });
});
