import { Alert } from 'react-native';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

/**
 * Алерт для нативных платформ.
 */
export function showAlert(title: string, message?: string, buttons?: AlertButton[]): void {
  Alert.alert(title, message, buttons);
}
