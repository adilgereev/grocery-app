import 'react-native-get-random-values';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import AuthProvider, { useAuth } from '@/providers/AuthProvider';
import { useAppStore } from '@/store/appStore';
import { useAddressStore } from '@/store/addressStore';
import { registerForPushNotificationsAsync } from '@/lib/services/NotificationService';
import { useOrderStatusListener } from '@/hooks/useOrderStatusListener';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { NetworkBanner } from '@/components/ui/NetworkBanner';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { session, loading, needsProfileSetup, profileLoading, profile } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const { isReady, initialize } = useAppStore();
  const loadAddresses = useAddressStore(state => state.loadAddresses);

  useOrderStatusListener();
  useNetworkStatus();

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
    const inPrivacyPolicy = segments[0] === 'privacy-policy';

    if (session) {
      // Первый вход — нужно заполнить имя
      if (needsProfileSetup) {
        if (!inSetupProfile && !inPrivacyPolicy) {
          router.replace('/setup-profile' as any);
        }
      } else if (inAuthGroup || inSetupProfile) {
        // Авторизованный пользователь с заполненным профилем на экране авторизации/setup
        if (profile?.is_admin) {
          router.replace('/(admin)' as any);
        } else {
          router.replace('/(tabs)/(index)' as any);
        }
      }
    }
  }, [session, loading, segments, isReady, router, needsProfileSetup, profileLoading, profile]);

  if (loading || !isReady || (session && profileLoading)) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={styles.container}>
        <NetworkBanner />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="setup-profile" />
          <Stack.Screen name="addresses" />
          <Stack.Screen name="manage-address" />
          <Stack.Screen name="checkout" />
          <Stack.Screen name="orders" />
          <Stack.Screen name="order-success" />
          <Stack.Screen name="privacy-policy" />
          <Stack.Screen name="public-offer" />
        </Stack>
      </View>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default function RootLayout() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <RootLayoutNav />
      </ErrorBoundary>
      <ToastContainer />
    </AuthProvider>
  );
}
