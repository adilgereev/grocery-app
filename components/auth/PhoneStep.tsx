import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { loginStyles as styles } from '@/app/(auth)/_login.styles';

interface PhoneStepProps {
  phone: string;
  loading: boolean;
  onPhoneChange: (text: string) => void;
  onContinue: () => void;
}

export const PhoneStep: React.FC<PhoneStepProps> = ({ phone, loading, onPhoneChange, onContinue }) => {
  // Маска ввода телефона: +7 (900) 123-45-67
  const handlePhoneChange = (text: string) => {
    let digits = text.replace(/\D/g, '');

    if (digits.startsWith('8')) digits = '7' + digits.slice(1);
    if (digits.length > 11) digits = digits.slice(0, 11);
    if (digits.length > 0 && !digits.startsWith('7')) digits = '7' + digits;

    let formatted = '';
    if (digits.length >= 1) formatted = '+7';
    if (digits.length >= 2) formatted += ` (${digits.slice(1, Math.min(4, digits.length))}`;
    if (digits.length >= 4) formatted += ')';
    if (digits.length >= 5) formatted += ` ${digits.slice(4, Math.min(7, digits.length))}`;
    if (digits.length >= 8) formatted += `-${digits.slice(7, Math.min(9, digits.length))}`;
    if (digits.length >= 10) formatted += `-${digits.slice(9, 11)}`;

    onPhoneChange(formatted);
  };

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
          maxLength={18}
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
