import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding-first" />
      <Stack.Screen name="onboarding-second" />
      <Stack.Screen name="onboarding-final" />
      <Stack.Screen name="profile-setup" />
    </Stack>
  );
}