import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { color } from '../lib/theme';
import { GivingProvider } from '../lib/store';

export default function RootLayout() {
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
