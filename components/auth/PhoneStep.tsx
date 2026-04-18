import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { loginStyles as styles } from '@/components/auth/login.styles';

interface PhoneStepProps {
  phone: string;
  loading: boolean;
  onPhoneChange: (text: string) => void;
  onContinue: () => void;
}

export const PhoneStep: React.FC<PhoneStepProps> = ({ phone, loading, onPhoneChange, onContinue }) => {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);

  // Храним только чистые цифры номера (без форматирования)
  const [digits, setDigits] = useState(() => phone.replace(/\D/g, ''));
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  // Синхронизируем с parent state (например, после отправки OTP и возврата)
  useEffect(() => {
    setDigits(phone.replace(/\D/g, ''));
  }, [phone]);

  // Нормализует и валидирует цифры (8→7, добавляет 7, ограничивает до 11)
  const normalizeDigits = useCallback((raw: string): string => {
    let normalized = raw.replace(/\D/g, '');

    if (normalized.startsWith('8')) {
      normalized = '7' + normalized.slice(1);
    }

    if (normalized.length > 11) {
      normalized = normalized.slice(0, 11);
    }

    if (normalized.length > 0 && !normalized.startsWith('7')) {
      normalized = '7' + normalized;
    }

    return normalized;
  }, []);

  // Форматирует чистые цифры в маску: +7 (900) 123-45-67
  const formatDigits = useCallback((cleanDigits: string): string => {
    if (cleanDigits.length === 0) return '';

    let formatted = '+7';

    if (cleanDigits.length >= 2) {
      formatted += ` (${cleanDigits.slice(1, Math.min(4, cleanDigits.length))}`;
    }

    if (cleanDigits.length >= 4) {
      formatted += ')';
    }

    if (cleanDigits.length >= 5) {
      formatted += ` ${cleanDigits.slice(4, Math.min(7, cleanDigits.length))}`;
    }

    if (cleanDigits.length >= 8) {
      formatted += `-${cleanDigits.slice(7, Math.min(9, cleanDigits.length))}`;
    }

    if (cleanDigits.length >= 10) {
      formatted += `-${cleanDigits.slice(9, 11)}`;
    }

    return formatted;
  }, []);

  const displayValue = formatDigits(digits);

  // Обработчик изменения текста
  const handlePhoneChange = useCallback(
    (text: string) => {
      const prevCount = digits.length;
      const rawCount = text.replace(/\D/g, '').length;

      let newDigits = digits;

      // Пользователь удалил форматный символ (скобка, пробел, дефис)
      // Признак: количество цифр одинаковое, но длина текста уменьшилась
      if (rawCount === prevCount && text.length < displayValue.length) {
        // Если cursor position известна, используем её для точного удаления
        // Иначе удаляем последнюю цифру
        if (selection.start > 0) {
          // Считаем цифры до позиции курсора в displayValue
          let digitsBefore = 0;
          for (let i = 0; i < Math.min(selection.start, displayValue.length); i++) {
            if (/\d/.test(displayValue[i])) {
              digitsBefore++;
            }
          }
          // Удаляем цифру перед курсором
          const deleteAt = Math.max(0, digitsBefore - 1);
          newDigits = digits.slice(0, deleteAt) + digits.slice(deleteAt + 1);
        } else {
          // Fallback: удаляем последнюю цифру
          newDigits = digits.slice(0, -1);
        }
      } else {
        // Обычное добавление или удаление цифры
        newDigits = normalizeDigits(text);
      }

      setDigits(newDigits);
      // Синхронизируем parent state сразу же (не ждём потери фокуса)
      const formatted = formatDigits(newDigits);
      onPhoneChange(formatted);
    },
    [digits, normalizeDigits, formatDigits, displayValue, selection.start, onPhoneChange]
  );

  const handleSelectionChange = (e: any) => {
    setSelection(e.nativeEvent.selection);
  };

  // Очистка поля при нажатии на крестик
  const handleClear = useCallback(() => {
    setDigits('');
    onPhoneChange('');
    inputRef.current?.focus();
  }, [onPhoneChange]);

  // При выходе из поля больше ничего не нужно делать
  // onPhoneChange уже вызывается при каждом изменении в handlePhoneChange
  const handleEndEditing = useCallback(() => {
    // Оставляем пустым - это правильно, так как state уже синхронизирован
  }, []);

  return (
    <>
      <Text style={styles.formTitle}>Вход</Text>
      <Text style={styles.formHint}>
        Введите номер телефона для SMS подтверждения
      </Text>

      <View style={styles.phoneInputContainer}>
        <Ionicons name="call-outline" size={20} color={Colors.light.textLight} />
        <TextInput
          ref={inputRef}
          testID="login-phone-input"
          style={styles.phoneInput}
          placeholder="+7 (900) 123-45-67"
          placeholderTextColor={Colors.light.textLight}
          value={displayValue}
          onChangeText={handlePhoneChange}
          onSelectionChange={handleSelectionChange}
          onEndEditing={handleEndEditing}
          keyboardType="phone-pad"
          autoFocus
        />
        {digits.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            testID="login-phone-clear"
          >
            <Ionicons name="close-circle" size={20} color={Colors.light.textLight} />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        testID="login-continue-button"
        style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
        onPress={onContinue}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.light.white} />
        ) : (
          <Text style={styles.primaryButtonText}>Продолжить</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.consentText}>
        Нажимая «Продолжить», вы даёте согласие на обработку персональных данных согласно{' '}
        <Text
          style={styles.consentLink}
          onPress={() => router.push('/privacy-policy' as any)}
          testID="login-terms-policy-link"
        >
          Политике конфиденциальности
        </Text>
      </Text>
    </>
  );
};
