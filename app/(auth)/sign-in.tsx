import { ScrollView, View } from 'react-native';
import { Stack } from 'expo-router';

import { SignInForm } from '@/components/sign-in-form';
import i18n from '@/locales';

export default function SignInScreen() {
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="sm:flex-1 items-center justify-center p-4 py-8 sm:py-4 sm:p-6"
      keyboardDismissMode="interactive">
      <View className="w-full max-w-sm">
        <Stack.Screen options={{ title: i18n.t('signIn.headerTitle') }} />
        <SignInForm />
      </View>
    </ScrollView>
  );
}
