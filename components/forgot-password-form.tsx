import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Linking from 'expo-linking';
import { toast } from 'sonner-native';
import { View } from 'react-native';
import { z } from 'zod/v4';

import { CardDescription, CardContent, CardHeader, CardTitle, Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { supabase } from '@/utils/supabase';
import i18n from '@/locales';

const schema = z.object({
  email: z
    .email(i18n.t('forgotPassword.validation.emailInvalid'))
    .min(1, i18n.t('forgotPassword.validation.emailRequired')),
});

type ISchema = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<ISchema>({ resolver: zodResolver(schema) });

  async function onSubmit(data: ISchema) {
    try {
      const redirectTo = Linking.createURL('/reset-password');

      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo,
      });

      if (error) {
        toast.error(i18n.t('forgotPassword.errorGeneric'));
        return;
      }

      toast.success(i18n.t('forgotPassword.success'));
    } catch {
      toast.error(i18n.t('forgotPassword.errorGeneric'));
    }
  }

  return (
    <View className="gap-6">
      <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">
            {i18n.t('forgotPassword.headerTitle')}
          </CardTitle>
          <CardDescription className="text-center sm:text-left">
            {i18n.t('forgotPassword.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-6">
            <View className="gap-1.5">
              <Label htmlFor="email">{i18n.t('forgotPassword.emailLabel')}</Label>
              <Controller
                control={control}
                name="email"
                render={({ field: { onBlur, onChange, value } }) => (
                  <Input
                    id="email"
                    placeholder={i18n.t('forgotPassword.emailPlaceholder')}
                    keyboardType="email-address"
                    autoComplete="email"
                    autoCapitalize="none"
                    returnKeyType="send"
                    onSubmitEditing={handleSubmit(onSubmit)}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                  />
                )}
              />
              {errors.email && <Text variant="danger">{errors.email.message}</Text>}
            </View>
            <Button className="w-full" onPress={handleSubmit(onSubmit)} isLoading={isSubmitting}>
              <Text>{i18n.t('forgotPassword.button')}</Text>
            </Button>
          </View>
        </CardContent>
      </Card>
    </View>
  );
}
