import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { color } from '../lib/theme';
import { GivingProvider } from '../lib/store';

export default function RootLayout() {
  useEffect(() => {
    if (
      Platform.OS === 'web' &&
      process.env.NODE_ENV === 'production' &&
      'serviceWorker' in navigator
    ) {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.error('PWA service worker registration failed', error);
      });
    }
  }, []);

  return (
    <SafeAreaProvider>
      <GivingProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: color.bg },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="initiative/[id]" options={{ presentation: 'card' }} />
          <Stack.Screen name="charity/[id]" options={{ presentation: 'card' }} />
          <Stack.Screen name="donate/[id]" options={{ presentation: 'modal' }} />
        </Stack>
      </GivingProvider>
    </SafeAreaProvider>
  );
}
