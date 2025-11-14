import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { View } from 'react-native';
import * as z from 'zod/v4-mini';

import { CardDescription, CardContent, CardHeader, CardTitle, Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';

const schema = z.object({
  email: z.email('Invalid email address'),
});

type ISchema = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm({ resolver: zodResolver(schema) });

  function onSubmit(data: ISchema) {}

  return (
    <View className="gap-6">
      <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">Forgot password?</CardTitle>
          <CardDescription className="text-center sm:text-left">
            Enter your email to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-6">
            <View className="gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Controller
                control={control}
                name="email"
                render={({ field: { onBlur, onChange, value } }) => (
                  <Input
                    id="email"
                    placeholder="m@example.com"
                    keyboardType="email-address"
                    autoComplete="email"
                    autoCapitalize="none"
                    returnKeyType="send"
                    onSubmitEditing={handleSubmit(onSubmit)}
                    value={value}
                    onBlur={onBlur}
                    onChange={onChange}
                  />
                )}
              />
              {errors.email && <Text variant="danger">{errors.email.message}</Text>}
            </View>
            <Button className="w-full" onPress={handleSubmit(onSubmit)} isLoading={isSubmitting}>
              <Text>Reset your password</Text>
            </Button>
          </View>
        </CardContent>
      </Card>
    </View>
  );
}
