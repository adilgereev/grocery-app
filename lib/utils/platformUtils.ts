import { Alert, Platform } from 'react-native';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

/**
 * Кросс-платформенный алерт.
 * На native — Alert.alert(), на web — window.alert() с последующим
 * вызовом первого non-cancel колбэка (имитирует нажатие OK).
 */
export function showAlert(title: string, message?: string, buttons?: AlertButton[]): void {
  if (Platform.OS === 'web') {
    const text = [title, message].filter(Boolean).join('\n\n');
    window.alert(text);
    // Вызываем первый подтверждающий колбэк (не cancel)
    buttons?.find(b => b.style !== 'cancel')?.onPress?.();
  } else {
    Alert.alert(title, message, buttons);
  }
}
