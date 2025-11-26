import { fireEvent, waitFor, render } from '@testing-library/react-native';
import React from 'react';

import { SignUpForm } from './sign-up-form';

// Mock i18n before importing the component
jest.mock('@/locales', () => ({
  __esModule: true,
  default: {
    t: (key: string) => {
      const messages: Record<string, string> = {
        'signUp.headerTitle': 'Create account',
        'signUp.description': 'Sign up description',
        'signUp.emailLabel': 'Email',
        'signUp.emailPlaceholder': 'Enter your email',
        'signUp.passwordLabel': 'Password',
        'signUp.repeatPasswordLabel': 'Repeat password',
        'signUp.button': 'Sign up',
        'signUp.haveAccountQuestion': 'Already have an account?',
        'signUp.signInLink': 'Sign in',
        'signUp.or': 'or',
        'signUp.validation.emailInvalid': 'Email is invalid',
        'signUp.validation.emailRequired': 'Email is required',
        'signUp.validation.passwordMin': 'Password must be at least 6 characters',
        'signUp.validation.passwordsDontMatch': 'Passwords do not match',
        'signUp.errorGeneric': 'Something went wrong',
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

const mockSignUp = jest.fn();
jest.mock('@/utils/supabase', () => ({
  supabase: {
    auth: {
      signUp: (...args: unknown[]) => mockSignUp(...args),
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

jest.mock('./social-connections', () => ({
  SocialConnections: () => null,
}));

describe('SignUpForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all main fields and button', () => {
    const { getByPlaceholderText, getByText } = render(<SignUpForm />);

    expect(getByPlaceholderText('Enter your email')).toBeTruthy();
    expect(getByText('Password')).toBeTruthy();
    expect(getByText('Repeat password')).toBeTruthy();
    expect(getByText('Sign up')).toBeTruthy();
  });

  it('shows validation error when email is invalid', async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<SignUpForm />);

    const emailInput = getByPlaceholderText('Enter your email');
    fireEvent.changeText(emailInput, 'invalid-email');

    const submitButton = getByText('Sign up');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(queryByText('Email is invalid')).toBeTruthy();
    });
  });

  it('shows error when passwords do not match', async () => {
    const { getByPlaceholderText, getByText, queryByText, getByTestId } = render(<SignUpForm />);

    const emailInput = getByPlaceholderText('Enter your email');
    const passwordInput = getByTestId('password-input');
    const repeatPasswordInput = getByTestId('repeat-password-input');

    fireEvent.changeText(emailInput, 'user@example.com');
    fireEvent.changeText(passwordInput, 'password1');
    fireEvent.changeText(repeatPasswordInput, 'password2');

    const submitButton = getByText('Sign up');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(queryByText('Passwords do not match')).toBeTruthy();
    });
  });

  it('calls supabase signUp and navigates on successful submit', async () => {
    mockSignUp.mockResolvedValueOnce({
      data: {
        user: { id: 'user-id' },
        session: { access_token: 'token' },
      },
      error: null,
    });

    const { getByPlaceholderText, getByText, getByTestId } = render(<SignUpForm />);

    const emailInput = getByPlaceholderText('Enter your email');
    const passwordInput = getByTestId('password-input');
    const repeatPasswordInput = getByTestId('repeat-password-input');

    fireEvent.changeText(emailInput, 'user@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(repeatPasswordInput, 'password123');

    fireEvent.press(getByText('Sign up'));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      });
      expect(mockSetUser).toHaveBeenCalled();
      expect(mockSetSession).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/(dashboard)');
    });
  });

  it('shows backend error message when signUp returns error', async () => {
    mockSignUp.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Email already in use' },
    });

    const { getByPlaceholderText, getByText, findByText, getByTestId } = render(<SignUpForm />);

    const emailInput = getByPlaceholderText('Enter your email');
    const passwordInput = getByTestId('password-input');
    const repeatPasswordInput = getByTestId('repeat-password-input');

    fireEvent.changeText(emailInput, 'user@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(repeatPasswordInput, 'password123');

    fireEvent.press(getByText('Sign up'));

    expect(await findByText('Email already in use')).toBeTruthy();
  });

  it('shows generic error when signUp throws', async () => {
    mockSignUp.mockRejectedValueOnce(new Error('Network error'));

    const { getByPlaceholderText, getByText, findByText, getByTestId } = render(<SignUpForm />);

    const emailInput = getByPlaceholderText('Enter your email');
    const passwordInput = getByTestId('password-input');
    const repeatPasswordInput = getByTestId('repeat-password-input');

    fireEvent.changeText(emailInput, 'user@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(repeatPasswordInput, 'password123');

    fireEvent.press(getByText('Sign up'));

    expect(await findByText('Network error')).toBeTruthy();
  });
});
