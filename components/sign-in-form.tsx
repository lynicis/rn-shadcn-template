import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type TextInput, View } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { toast } from 'sonner-native';
import * as React from 'react';
import { z } from 'zod/v4';

import { CardDescription, CardContent, CardHeader, CardTitle, Card } from '@/components/ui/card';
import { SocialConnections } from '@/components/social-connections';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/utils/supabase';
import { useUserStore } from '@/store/user';
import { Text } from '@/components/ui/text';
import i18n from '@/locales';

const schema = z.object({
  email: z
    .email(i18n.t('signIn.validation.emailInvalid'))
    .min(1, i18n.t('signIn.validation.emailRequired')),
  password: z.string().min(8, i18n.t('signIn.validation.passwordMin')),
});

type ISchema = z.infer<typeof schema>;

export function SignInForm() {
  const router = useRouter();
  const { setUser, setSession } = useUserStore();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ISchema>({ resolver: zodResolver(schema) });

  const passwordInputRef = React.useRef<TextInput>(null);

  async function onSubmit(data: ISchema) {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast.error(i18n.t('signIn.errorGeneric'));
      return;
    }

    if (authData.user && authData.session) {
      setUser(authData.user);
      setSession(authData.session);
      toast.success(i18n.t('signIn.success'));
      return setTimeout(() => router.push('/(dashboard)'), 600);
    }
  }

  return (
    <View className="gap-6">
      <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">
            {i18n.t('signIn.headerTitle')}
          </CardTitle>
          <CardDescription className="text-center sm:text-left">
            {i18n.t('signIn.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-6">
            <View className="gap-1.5">
              <Label htmlFor="email">{i18n.t('signIn.emailLabel')}</Label>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    id="email"
                    placeholder={i18n.t('signIn.emailPlaceholder')}
                    keyboardType="email-address"
                    autoComplete="email"
                    autoCapitalize="none"
                    onSubmitEditing={() => passwordInputRef.current?.focus()}
                    returnKeyType="next"
                    submitBehavior="submit"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                )}
              />
              {errors.email && <Text variant="danger">{errors.email.message}</Text>}
            </View>
            <View className="gap-1.5">
              <View className="flex-row items-center">
                <Label htmlFor="password">{i18n.t('signIn.passwordLabel')}</Label>
                <Button
                  variant="link"
                  size="sm"
                  className="ml-auto h-4 px-1 py-0 web:h-fit sm:h-4"
                  onPress={() => router.push('/(auth)/forgot-password')}>
                  <Text className="font-normal leading-4">{i18n.t('signIn.forgotPassword')}</Text>
                </Button>
              </View>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    testID="password-input"
                    ref={passwordInputRef}
                    id="password"
                    secureTextEntry
                    returnKeyType="send"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    onSubmitEditing={handleSubmit(onSubmit)}
                  />
                )}
              />
              {errors.password && <Text variant="danger">{errors.password.message}</Text>}
            </View>
            <Button
              testID="submit-button"
              className="w-full"
              onPress={handleSubmit(onSubmit)}
              isLoading={isSubmitting}>
              <Text>{i18n.t('signIn.button')}</Text>
            </Button>
          </View>
          <Text className="text-center text-sm">
            {i18n.t('signIn.noAccountQuestion')}{' '}
            <Link href="/(auth)">
              <Text className="text-sm underline underline-offset-4">
                {i18n.t('signIn.signUpLink')}
              </Text>
            </Link>
          </Text>
          <View className="flex-row items-center">
            <Separator className="flex-1" />
            <Text className="px-4 text-sm text-muted-foreground">{i18n.t('signIn.or')}</Text>
            <Separator className="flex-1" />
          </View>
          <SocialConnections />
        </CardContent>
      </Card>
    </View>
  );
}
