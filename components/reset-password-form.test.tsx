import { fireEvent, waitFor, render } from '@testing-library/react-native';
import React from 'react';

import { ResetPasswordForm } from './reset-password-form';

// Mock i18n before importing the component
jest.mock('@/locales', () => ({
  __esModule: true,
  default: {
    t: (key: string) => {
      const messages: Record<string, string> = {
        'resetPassword.headerTitle': 'Reset password',
        'resetPassword.description': 'Reset your password description',
        'resetPassword.passwordLabel': 'Password',
        'resetPassword.button': 'Reset password',
        'resetPassword.errorGeneric': 'Could not reset password',
        'resetPassword.success': 'Password reset successfully',
        'signIn.validation.passwordMin': 'Password must be at least 8 characters',
      };
      return messages[key] ?? key;
    },
  },
}));

// Mocks
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockUpdateUser = jest.fn();
jest.mock('@/utils/supabase', () => ({
  supabase: {
    auth: {
      updateUser: (...args: unknown[]) => mockUpdateUser(...args),
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

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders password field and reset button', () => {
    const { getByTestId } = render(<ResetPasswordForm />);

    expect(getByTestId('password-input')).toBeTruthy();
    expect(getByTestId('submit-button')).toBeTruthy();
  });

  it('shows validation error when password is too short', async () => {
    const { getByTestId, queryByText } = render(<ResetPasswordForm />);

    const passwordInput = getByTestId('password-input');
    fireEvent.changeText(passwordInput, 'short');

    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(queryByText('Password must be at least 8 characters')).toBeTruthy();
    });
  });

  it('calls supabase updateUser and shows success toast on success', async () => {
    mockUpdateUser.mockResolvedValueOnce({
      data: {},
      error: null,
    });

    const { getByTestId } = render(<ResetPasswordForm />);

    const passwordInput = getByTestId('password-input');
    fireEvent.changeText(passwordInput, 'newpassword');

    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({
        password: 'newpassword',
      });
      expect(mockToastSuccess).toHaveBeenCalledWith('Password reset successfully');
    });
  });

  it('shows generic error toast when updateUser returns error', async () => {
    mockUpdateUser.mockResolvedValueOnce({
      data: {},
      error: { message: 'Something went wrong' },
    });

    const { getByTestId } = render(<ResetPasswordForm />);

    const passwordInput = getByTestId('password-input');
    fireEvent.changeText(passwordInput, 'newpassword');

    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalled();
      expect(mockToastError).toHaveBeenCalledWith('Could not reset password');
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
