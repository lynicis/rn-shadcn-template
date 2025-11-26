import { fireEvent, waitFor, render } from '@testing-library/react-native';
import React from 'react';

import { ForgotPasswordForm } from './forgot-password-form';

// Mock i18n before importing the component
jest.mock('@/locales', () => ({
  __esModule: true,
  default: {
    t: (key: string) => {
      const messages: Record<string, string> = {
        'forgotPassword.headerTitle': 'Forgot password',
        'forgotPassword.description': 'Forgot password description',
        'forgotPassword.emailLabel': 'Email',
        'forgotPassword.emailPlaceholder': 'Enter your email',
        'forgotPassword.button': 'Send reset link',
        'forgotPassword.validation.emailInvalid': 'Email is invalid',
        'forgotPassword.validation.emailRequired': 'Email is required',
        'forgotPassword.errorGeneric': 'Something went wrong',
        'forgotPassword.success': 'Reset email sent',
      };
      return messages[key] ?? key;
    },
  },
}));

const mockCreateURL = jest.fn((_path: string) => 'app://reset-password');
jest.mock('expo-linking', () => ({
  createURL: (path: string) => mockCreateURL(path),
}));

const mockResetPasswordForEmail = jest.fn();
jest.mock('@/utils/supabase', () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: (email: string, options?: object) =>
        mockResetPasswordForEmail(email, options),
    },
  },
}));

const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();
jest.mock('sonner-native', () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders email input and submit button', () => {
    const { getByPlaceholderText, getByText } = render(<ForgotPasswordForm />);

    expect(getByPlaceholderText('Enter your email')).toBeTruthy();
    expect(getByText('Send reset link')).toBeTruthy();
  });

  it('shows validation error when email is invalid', async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<ForgotPasswordForm />);

    const emailInput = getByPlaceholderText('Enter your email');
    fireEvent.changeText(emailInput, 'invalid-email');

    const submitButton = getByText('Send reset link');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(queryByText('Email is invalid')).toBeTruthy();
    });
  });

  it('calls supabase resetPasswordForEmail and shows success toast on success', async () => {
    mockResetPasswordForEmail.mockResolvedValueOnce({
      error: null,
    });

    const { getByPlaceholderText, getByText } = render(<ForgotPasswordForm />);

    const emailInput = getByPlaceholderText('Enter your email');
    fireEvent.changeText(emailInput, 'user@example.com');

    const submitButton = getByText('Send reset link');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockCreateURL).toHaveBeenCalledWith('/reset-password');
      expect(mockResetPasswordForEmail).toHaveBeenCalledWith('user@example.com', {
        redirectTo: 'app://reset-password',
      });
      expect(mockToastSuccess).toHaveBeenCalledWith('Reset email sent');
    });
  });

  it('shows generic error toast when resetPasswordForEmail returns error', async () => {
    mockResetPasswordForEmail.mockResolvedValueOnce({
      error: { message: 'Backend error' },
    });

    const { getByPlaceholderText, getByText } = render(<ForgotPasswordForm />);

    const emailInput = getByPlaceholderText('Enter your email');
    fireEvent.changeText(emailInput, 'user@example.com');

    const submitButton = getByText('Send reset link');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockResetPasswordForEmail).toHaveBeenCalled();
      expect(mockToastError).toHaveBeenCalledWith('Something went wrong');
    });
  });

  it('shows generic error toast when resetPasswordForEmail throws', async () => {
    mockResetPasswordForEmail.mockRejectedValueOnce(new Error('Network error'));

    const { getByPlaceholderText, getByText } = render(<ForgotPasswordForm />);

    const emailInput = getByPlaceholderText('Enter your email');
    fireEvent.changeText(emailInput, 'user@example.com');

    const submitButton = getByText('Send reset link');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockResetPasswordForEmail).toHaveBeenCalled();
      expect(mockToastError).toHaveBeenCalledWith('Something went wrong');
    });
  });
});
