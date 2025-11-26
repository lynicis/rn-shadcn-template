import { ScrollView, View } from 'react-native';
import { Stack } from 'expo-router';

import { ResetPasswordForm } from '@/components/reset-password-form';
import i18n from '@/locales';

export default function ResetPasswordScreen() {
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="sm:flex-1 items-center justify-center p-4 py-8 sm:py-4 sm:p-6 mt-safe"
      keyboardDismissMode="interactive">
      <View className="w-full max-w-sm">
        <Stack.Screen options={{ title: i18n.t('resetPassword.headerTitle') }} />
        <ResetPasswordForm />
      </View>
    </ScrollView>
  );
}
