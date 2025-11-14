import { Text, View } from 'react-native';
import { Stack, Link } from 'expo-router';

import i18n from '@/locales';

export default function NotFoundScreen() {
  return (
    <View className="flex flex-1 bg-white">
      <Stack.Screen options={{ title: i18n.t('notFound.headerTitle') }} />
      <View className="flex flex-1 bg-white">
        <Text className="text-xl font-bold">{i18n.t('notFound.title')}</Text>
        <Link href="/(auth)" className="mt-4 pt-4">
          <Text className="text-base text-[#2e78b7]">
            {i18n.t('notFound.goBackToSignUpButton')}
          </Text>
        </Link>
      </View>
    </View>
  );
}
