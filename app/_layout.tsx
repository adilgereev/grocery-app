import 'react-native-get-random-values';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import AuthProvider, { useAuth } from '@/providers/AuthProvider';
import { useAppStore } from '@/store/appStore';
import { useAddressStore } from '@/store/addressStore';
import { registerForPushNotificationsAsync } from '@/lib/services/NotificationService';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';


export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { session, loading, needsProfileSetup, profileLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const { isReady, initialize } = useAppStore();
  const loadAddresses = useAddressStore(state => state.loadAddresses);

  useEffect(() => {
    initialize();
    loadAddresses();
    registerForPushNotificationsAsync();
  }, [initialize, loadAddresses]);

  useEffect(() => {
    // Ждем окончания загрузки сессии, профиля и проверки хранилища
    if (loading || !isReady || (session && profileLoading)) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inSetupProfile = segments[0] === 'setup-profile';

    if (session) {
      // Первый вход — нужно заполнить имя
      if (needsProfileSetup) {
        if (!inSetupProfile) {
          router.replace('/setup-profile' as any);
        }
      } else if (inAuthGroup || inSetupProfile) {
        // Авторизованный пользователь с заполненным профилем на экране авторизации/setup
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)/(index)' as any);
        }
      }
    }
  }, [session, loading, segments, isReady, router, needsProfileSetup, profileLoading]);

  if (loading || !isReady || (session && profileLoading)) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="setup-profile" />
        <Stack.Screen name="addresses" />
        <Stack.Screen name="manage-address" />
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
