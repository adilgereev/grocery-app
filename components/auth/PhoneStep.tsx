import React, { useState, useEffect, useCallback } from 'react';
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
  // Локальное состояние для свободного редактирования без прыганья курсора
  const [localPhone, setLocalPhone] = useState(phone);

  // Синхронизируем с parent state (например, после отправки OTP и возврата)
  useEffect(() => {
    setLocalPhone(phone);
  }, [phone]);

  // Форматирует номер телефона: +7 (900) 123-45-67
  const formatPhone = useCallback((text: string): string => {
    let digits = text.replace(/\D/g, '');

    if (digits.startsWith('8')) {
      digits = '7' + digits.slice(1);
    }

    if (digits.length > 11) {
      digits = digits.slice(0, 11);
    }

    if (digits.length > 0 && !digits.startsWith('7')) {
      digits = '7' + digits;
    }

    if (digits.length === 0) {
      return '';
    }

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

    return formatted;
  }, []);

  // Во время ввода просто обновляем локальное состояние (БЕЗ форматирования)
  // Это позволяет курсору двигаться свободно
  const handlePhoneChange = useCallback((text: string) => {
    setLocalPhone(text);
  }, []);

  // При выходе из поля (потеря фокуса) форматируем и отправляем parent
  const handleEndEditing = useCallback(() => {
    const formatted = formatPhone(localPhone);
    setLocalPhone(formatted);
    onPhoneChange(formatted);
  }, [localPhone, formatPhone, onPhoneChange]);

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
          value={localPhone}
          onChangeText={handlePhoneChange}
          onEndEditing={handleEndEditing}
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
