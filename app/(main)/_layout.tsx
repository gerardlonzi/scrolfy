import React from 'react';
import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="limits" />
      <Stack.Screen name="profile-edit" />
      <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
      <Stack.Screen name="focus-session" options={{ presentation: 'fullScreenModal' }} />
    </Stack>
  );
}

