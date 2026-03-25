import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect, useState } from 'react';

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
  
  const { hasSeenOnboarding, isReady, checkOnboarding } = useAppStore();
  const loadAddresses = useAddressStore(state => state.loadAddresses);

  useEffect(() => {
    checkOnboarding();
    loadAddresses();
    registerForPushNotificationsAsync();
  }, []);

  useEffect(() => {
    // Ждем окончания загрузки сессии и окончания проверки хранилища
    if (loading || !isReady) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

    // 1. Если не пройдено обучение — всегда отправляем туда
    if (!hasSeenOnboarding && !inOnboarding) {
      router.replace('/onboarding');
    } 
    // 2. Если пользователь уже авторизован, но находится на экране логина или онбординга
    else if (session && (inAuthGroup || inOnboarding)) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/(index)' as any);
      }
    }
    // 3. Для всех остальных (гости и авторизованные на обычных вкладках) — не вмешиваемся! 
    // Это и есть "отложенная авторизация".
  }, [session, loading, segments, isReady, hasSeenOnboarding]);

  if (loading || !isReady) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
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
