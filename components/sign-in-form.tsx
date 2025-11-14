import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type TextInput, View } from 'react-native';
import { useRouter, Link } from 'expo-router';
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

const schema = z.object({
  email: z.email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
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
      return;
    }

    if (authData.user && authData.session) {
      setUser(authData.user);
      setSession(authData.session);
      return router.push('/(dashboard)');
    }
  }

  return (
    <View className="gap-6">
      <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">Sign in to your app</CardTitle>
          <CardDescription className="text-center sm:text-left">
            Welcome back! Please sign in to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-6">
            <View className="gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    id="email"
                    placeholder="m@example.com"
                    keyboardType="email-address"
                    autoComplete="email"
                    autoCapitalize="none"
                    onSubmitEditing={() => passwordInputRef.current?.focus()}
                    returnKeyType="next"
                    submitBehavior="submit"
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                )}
              />
              {errors.email && <Text variant="danger">{errors.email.message}</Text>}
            </View>
            <View className="gap-1.5">
              <View className="flex-row items-center">
                <Label htmlFor="password">Password</Label>
                <Button
                  variant="link"
                  size="sm"
                  className="ml-auto h-4 px-1 py-0 web:h-fit sm:h-4"
                  onPress={() => router.push('/(auth)/forgot-password')}>
                  <Text className="font-normal leading-4">Forgot your password?</Text>
                </Button>
              </View>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    ref={passwordInputRef}
                    id="password"
                    secureTextEntry
                    returnKeyType="send"
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                    onSubmitEditing={handleSubmit(onSubmit)}
                  />
                )}
              />
              {errors.password && <Text variant="danger">{errors.password.message}</Text>}
            </View>
            <Button className="w-full" onPress={handleSubmit(onSubmit)} isLoading={isSubmitting}>
              <Text>Continue</Text>
            </Button>
          </View>
          <Text className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/(auth)">
              <Text className="text-sm underline underline-offset-4">Sign up</Text>
            </Link>
          </Text>
          <View className="flex-row items-center">
            <Separator className="flex-1" />
            <Text className="px-4 text-sm text-muted-foreground">or</Text>
            <Separator className="flex-1" />
          </View>
          <SocialConnections />
        </CardContent>
      </Card>
    </View>
  );
}
