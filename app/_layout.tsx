import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import AuthProvider, { useAuth } from '@/providers/AuthProvider';
import { useAppStore } from '@/store/appStore';
import { useAddressStore } from '@/store/addressStore';
import { registerForPushNotificationsAsync } from '@/lib/NotificationService';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  
  const { isReady, initialize } = useAppStore();
  const loadAddresses = useAddressStore(state => state.loadAddresses);

  useEffect(() => {
    initialize();
    loadAddresses();
    registerForPushNotificationsAsync();
  }, []);

  useEffect(() => {
    // Ждем окончания загрузки сессии и окончания проверки хранилища
    if (loading || !isReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    // Если пользователь уже авторизован, но находится на экране логина
    if (session && inAuthGroup) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/(index)' as any);
      }
    }
  }, [session, loading, segments, isReady]);

  if (loading || !isReady) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="addresses" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <RootLayoutNav />
      </ErrorBoundary>
    </AuthProvider>
  );
}
