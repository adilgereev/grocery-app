import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { PaymentMethod } from '@/types';

export const STATUS_CONFIG: Record<string, { label: string; shortLabel: string; icon: string; color: string; bg: string; emoji: string }> = {
  pending:    { label: 'Новый заказ',    shortLabel: 'Новый',    icon: 'time-outline',          color: Colors.light.warning, bg: Colors.light.warningLight, emoji: '🕐' },
  processing: { label: 'Собираем заказ', shortLabel: 'Собираем', icon: 'cube-outline',           color: Colors.light.info,    bg: Colors.light.infoLight,    emoji: '📦' },
  assembled:  { label: 'Заказ собран',   shortLabel: 'Собран',   icon: 'checkmark-circle-outline',color: Colors.light.success, bg: Colors.light.successLight, emoji: '✅' },
  shipped:    { label: 'Курьер в пути',  shortLabel: 'В пути',   icon: 'bicycle-outline',        color: Colors.light.info,    bg: Colors.light.infoLight,    emoji: '🚗' },
  delivered:  { label: 'Доставлен',      shortLabel: 'Доставлен',icon: 'checkmark-done-outline', color: Colors.light.success, bg: Colors.light.successLight, emoji: '✅' },
  cancelled:  { label: 'Отменён',        shortLabel: 'Отменён',  icon: 'close-circle-outline',   color: Colors.light.error,   bg: Colors.light.errorLight,   emoji: '❌' },
};

export const PAYMENT_CONFIG: Record<PaymentMethod, { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  cash: { label: 'Наличными курьеру', icon: 'cash-outline' },
  online: { label: 'Онлайн', icon: 'card' },
};

export const TRACKER_STEPS = ['processing', 'assembled', 'shipped', 'delivered'];
