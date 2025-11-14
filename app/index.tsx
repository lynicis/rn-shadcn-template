import { ScrollView, View } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Mail } from 'lucide-react-native';

import { SocialConnections } from '@/components/social-connections';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import i18n from '@/locales';

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="flex-1 items-center justify-center p-4 py-8 sm:py-4 sm:p-6"
      keyboardDismissMode="interactive">
      <View className="w-full max-w-sm gap-4">
        <Stack.Screen options={{ title: i18n.t('onboarding.headerTitle') }} />
        <Text className="text-center text-2xl font-bold">{i18n.t('onboarding.title')}</Text>
        <Button onPress={() => router.push('/(auth)/sign-in')} className="w-full">
          <Icon as={Mail} size={16} color="white" />
          <Text>{i18n.t('onboarding.loginWithEmailButton')}</Text>
        </Button>
        <View className="w-full flex-row items-center">
          <View className="flex-1">
            <Separator />
          </View>
          <Text className="px-2 text-muted-foreground">{i18n.t('onboarding.seperator')}</Text>
          <View className="flex-1">
            <Separator />
          </View>
        </View>
        <View className="w-full">
          <SocialConnections />
        </View>
      </View>
    </ScrollView>
  );
}
