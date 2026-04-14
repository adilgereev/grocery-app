import React, { useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { loginStyles as styles } from '@/components/auth/login.styles';

interface PhoneStepProps {
  phone: string;
  loading: boolean;
  onPhoneChange: (text: string) => void;
  onContinue: () => void;
}

export const PhoneStep: React.FC<PhoneStepProps> = ({ phone, loading, onPhoneChange, onContinue }) => {
  // Форматирует номер телефона: +7 (900) 123-45-67
  // Обрабатывает удаление корректно без «застревания» курсора перед скобками
  const handlePhoneChange = useCallback((text: string) => {
    // Извлекаем только цифры
    let digits = text.replace(/\D/g, '');

    // Нормализуем: 8 → 7 (для удобства ввода)
    if (digits.startsWith('8')) {
      digits = '7' + digits.slice(1);
    }

    // Ограничиваем максимум 11 цифр (российский номер)
    if (digits.length > 11) {
      digits = digits.slice(0, 11);
    }

    // Добавляем 7 в начало, если её нет
    if (digits.length > 0 && !digits.startsWith('7')) {
      digits = '7' + digits;
    }

    // Если пусто, возвращаем пусто
    if (digits.length === 0) {
      onPhoneChange('');
      return;
    }

    // Строим отформатированную строку постепенно
    let formatted = '+7';

    if (digits.length >= 2) {
      formatted += ` (${digits.slice(1, Math.min(4, digits.length))}`;
    }

    if (digits.length >= 4) {
      formatted += ')';
    }

    if (digits.length >= 5) {
      formatted += ` ${digits.slice(4, Math.min(7, digits.length))}`;
    }

    if (digits.length >= 8) {
      formatted += `-${digits.slice(7, Math.min(9, digits.length))}`;
    }

    if (digits.length >= 10) {
      formatted += `-${digits.slice(9, 11)}`;
    }

    onPhoneChange(formatted);
  }, [onPhoneChange]);

  return (
    <>
      <Text style={styles.formTitle}>Вход</Text>
      <Text style={styles.formHint}>
        Введите номер телефона для SMS подтверждения
      </Text>

      <View style={styles.phoneInputContainer}>
        <Ionicons name="call-outline" size={20} color={Colors.light.textLight} />
        <TextInput
          testID="login-phone-input"
          style={styles.phoneInput}
          placeholder="+7 (900) 123-45-67"
          placeholderTextColor={Colors.light.textLight}
          value={phone}
          onChangeText={handlePhoneChange}
          keyboardType="phone-pad"
          autoFocus
        />
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
    </>
  );
};
