import { EyeOffIcon, EyeIcon } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextInput, View } from 'react-native';
import { useRouter, Link } from 'expo-router';
import * as React from 'react';
import { z } from 'zod/v4';

import { CardDescription, CardContent, CardHeader, CardTitle, Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/utils/supabase';
import { useUserStore } from '@/store/user';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';

import { SocialConnections } from './social-connections';
import { Separator } from './ui/separator';

const schema = z
  .object({
    email: z.email('Invalid email address').min(1, 'Email is required'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    repeatPassword: z.string().min(6, 'Password must be at least 6 characters long'),
  })
  .refine((data) => data.password === data.repeatPassword, {
    path: ['repeatPassword'],
    message: 'Passwords do not match',
  });

type ISchema = z.infer<typeof schema>;

export function SignUpForm() {
  const router = useRouter();
  const { setUser, setSession } = useUserStore();
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ISchema>({ resolver: zodResolver(schema) });

  const passwordInputRef = React.useRef<TextInput>(null);
  const repeatPasswordInputRef = React.useRef<TextInput>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const onSubmit = async (data: ISchema) => {
    try {
      setSubmitError(null);

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setSubmitError(error.message);
        return;
      }

      if (authData.user && authData.session) {
        setUser(authData.user);
        setSession(authData.session);
        return router.push('/(dashboard)');
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  return (
    <View className="gap-6">
      <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">Create your account</CardTitle>
          <CardDescription className="text-center sm:text-left">
            Welcome! Please fill in the details to get started.
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
                    editable={!isSubmitting}
                  />
                )}
              />
              {errors.email && <Text variant="danger">{errors.email.message}</Text>}
            </View>
            <View className="gap-1.5">
              <View className="flex-row items-center">
                <Label htmlFor="password">Password</Label>
              </View>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View className="relative">
                    <Input
                      ref={passwordInputRef}
                      id="password"
                      secureTextEntry={!showPassword}
                      returnKeyType="next"
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      onSubmitEditing={() => repeatPasswordInputRef.current?.focus()}
                      editable={!isSubmitting}
                      className="pr-12"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onPress={() => setShowPassword(!showPassword)}
                      disabled={isSubmitting}
                      className="absolute right-1 top-0 h-full w-10">
                      <Icon
                        as={showPassword ? EyeOffIcon : EyeIcon}
                        className="text-muted-foreground"
                        size={20}
                      />
                    </Button>
                  </View>
                )}
              />
              {errors.password && <Text variant="danger">{errors.password.message}</Text>}
            </View>
            <View className="gap-1.5">
              <View className="flex-row items-center">
                <Label htmlFor="repeatPassword">Repeat Password</Label>
              </View>
              <Controller
                control={control}
                name="repeatPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View className="relative">
                    <Input
                      ref={repeatPasswordInputRef}
                      id="repeatPassword"
                      secureTextEntry={!showRepeatPassword}
                      returnKeyType="send"
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      onSubmitEditing={handleSubmit(onSubmit)}
                      editable={!isSubmitting}
                      className="pr-12"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onPress={() => setShowRepeatPassword(!showRepeatPassword)}
                      disabled={isSubmitting}
                      className="absolute right-1 top-0 h-full w-10">
                      <Icon
                        as={showRepeatPassword ? EyeOffIcon : EyeIcon}
                        className="text-muted-foreground"
                        size={20}
                      />
                    </Button>
                  </View>
                )}
              />
              {errors.repeatPassword && (
                <Text variant="danger">{errors.repeatPassword.message}</Text>
              )}
            </View>
            {submitError && <Text variant="danger">{submitError}</Text>}
            <Button className="w-full" onPress={handleSubmit(onSubmit)} isLoading={isSubmitting}>
              <Text>Continue</Text>
            </Button>
          </View>
          <Text className="text-center text-sm">
            Already have an account?{' '}
            <Link href="/(auth)/sign-in">
              <Text className="text-sm underline underline-offset-4">Sign in</Text>
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
