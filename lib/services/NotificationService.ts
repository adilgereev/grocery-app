import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { supabase } from '@/lib/services/supabase';
import { logger } from '@/lib/utils/logger';

// В Expo Go SDK 53 push-уведомления недоступны — нужен development build
const IS_EXPO_GO = Constants.appOwnership === 'expo';

// Настройка того, как уведомления будут отображаться, если приложение открыто
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const EXPO_PROJECT_ID = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;

export const NOTIFY_STATUSES = ['assembled', 'shipped', 'delivered', 'cancelled'] as const;

const STATUS_MESSAGES: Partial<Record<string, { title: string; body: string }>> = {
  assembled: { title: 'Заказ собран 📦',     body: 'Курьер уже едет забирать заказ' },
  shipped:   { title: 'Курьер в пути 🚴',    body: 'Ваш заказ уже едет к вам'       },
  delivered: { title: 'Заказ доставлен! 🎉', body: 'Приятного аппетита!'             },
  cancelled: { title: 'Заказ отменён ❌',     body: 'Свяжитесь с поддержкой'         },
};

export async function registerForPushNotificationsAsync(): Promise<void> {
  if (IS_EXPO_GO) return;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#10B981',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      return;
    }
  }
}

// Регистрирует Expo Push Token и сохраняет в profiles.push_token.
// Требует нативного билда (expo run:android / EAS Build) — не работает в Expo Go.
export async function registerExpoPushToken(userId: string): Promise<void> {
  if (IS_EXPO_GO) return;
  if (!Device.isDevice) return;
  if (!EXPO_PROJECT_ID) return;

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return;

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: EXPO_PROJECT_ID,
    });
    const { data: profile } = await supabase
      .from('profiles')
      .select('push_token')
      .eq('id', userId)
      .maybeSingle();
    if (profile?.push_token === tokenData.data) return;
    await supabase.from('profiles').update({ push_token: tokenData.data }).eq('id', userId);
    logger.log('Push token зарегистрирован:', tokenData.data);
  } catch (error) {
    logger.error('Ошибка регистрации push token:', error);
  }
}

// Немедленное локальное уведомление — fallback для Realtime когда приложение открыто.
export async function notifyOrderStatus(status: string): Promise<void> {
  const msg = STATUS_MESSAGES[status];
  if (!msg) return;
  await Notifications.scheduleNotificationAsync({
    content: { title: msg.title, body: msg.body, sound: true },
    trigger: null,
  });
}

