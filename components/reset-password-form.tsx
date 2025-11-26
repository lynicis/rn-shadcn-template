import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { toast } from 'sonner-native';
import * as React from 'react';
import { z } from 'zod/v4';

import { CardDescription, CardContent, CardHeader, CardTitle, Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { supabase } from '@/utils/supabase';
import i18n from '@/locales';

const schema = z.object({
  password: z.string().min(8, i18n.t('signIn.validation.passwordMin')),
});

type ISchema = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const passwordInputRef = React.useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<ISchema>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: ISchema) => {
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      return toast.error(i18n.t('resetPassword.errorGeneric'));
    }

    toast.success(i18n.t('resetPassword.success'));
    setTimeout(() => {
      router.dismissAll();
      router.push('/(auth)/sign-in');
    }, 600);
  };

  return (
    <View className="gap-6">
      <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">
            {i18n.t('resetPassword.headerTitle')}
          </CardTitle>
          <CardDescription className="text-center sm:text-left">
            {i18n.t('resetPassword.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-6">
            <View className="gap-1.5">
              <View className="flex-row items-center">
                <Label htmlFor="password">{i18n.t('resetPassword.passwordLabel')}</Label>
              </View>
              <Controller
                control={control}
                name="password"
                render={({ field: { onBlur, onChange, value } }) => (
                  <Input
                    testID="password-input"
                    ref={passwordInputRef}
                    id="password"
                    secureTextEntry
                    returnKeyType="send"
                    submitBehavior="submit"
                    onSubmitEditing={handleSubmit(onSubmit)}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    editable={!isSubmitting}
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
              <Text>{i18n.t('resetPassword.button')}</Text>
            </Button>
          </View>
        </CardContent>
      </Card>
    </View>
  );
}
