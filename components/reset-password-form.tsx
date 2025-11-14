import { TextInput, View } from 'react-native';
import * as React from 'react';

import { CardDescription, CardContent, CardHeader, CardTitle, Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';

export function ResetPasswordForm() {
  const codeInputRef = React.useRef<TextInput>(null);

  function onSubmit() {
    // TODO: Submit form and navigate to protected screen if successful
  }

  return (
    <View className="gap-6">
      <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">Reset password</CardTitle>
          <CardDescription className="text-center sm:text-left">
            Enter the code sent to your email and set a new password
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-6">
            <View className="gap-1.5">
              <View className="flex-row items-center">
                <Label htmlFor="password">New password</Label>
              </View>
              <Input
                id="password"
                secureTextEntry
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => codeInputRef.current?.focus()}
              />
            </View>
            <View className="gap-1.5">
              <Label htmlFor="code">Verification code</Label>
              <Input
                id="code"
                autoCapitalize="none"
                returnKeyType="send"
                keyboardType="numeric"
                autoComplete="sms-otp"
                textContentType="oneTimeCode"
                onSubmitEditing={onSubmit}
              />
            </View>
            <Button className="w-full" onPress={onSubmit}>
              <Text>Reset Password</Text>
            </Button>
          </View>
        </CardContent>
      </Card>
    </View>
  );
}
