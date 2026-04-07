import { Colors } from '@/constants/theme';
import { logger } from '@/lib/logger';
import { createOtpCode, verifyActiveOtp, markOtpAsUsed, authenticateWithPhone } from '@/lib/authApi';
import { generateOTP, normalizePhone, sendSMS } from '@/lib/sms';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

import { loginStyles as styles } from './_login.styles';
import { PhoneStep } from '@/components/auth/PhoneStep';
import { OtpStep } from '@/components/auth/OtpStep';

// Шаги авторизации
type AuthStep = 'phone' | 'otp';

export default function Login() {
  const router = useRouter();
  const [step, setStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Обратный отсчёт для повторной отправки
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // Шаг 1: Отправка SMS-кода
  const handleSendOTP = async () => {
    const normalized = normalizePhone(phone);
    if (normalized.length !== 11) {
      showAlert('Ошибка', 'Введите корректный номер телефона');
      return;
    }

    setLoading(true);
    try {
      const code = generateOTP();

      // Сохраняем код в базу
      await createOtpCode(normalized, code);

      // Отправляем SMS (только в продакшене)
      let result = { success: true, error: null as string | null };
      if (!__DEV__) {
        const smsResult = await sendSMS(normalized, `Вкусная Доставка: ваш код ${code}`);
        result = { success: smsResult.success, error: smsResult.error || null };
      } else {
        logger.log(`[DEV MODE] SMS bypass for ${normalized}. Your code is: ${code}`);
      }

      if (__DEV__) {
        showAlert('Код отправлен', `[DEV] Ваш код: ${code}`);
      } else if (!result.success) {
        showAlert('Ошибка', result.error || 'Не удалось отправить SMS. Попробуйте ещё раз.');
      } else {
        showAlert('Код отправлен', `SMS с кодом отправлено на ${phone}`);
      }

      setStep('otp');
      setCountdown(60);
      setOtp(['', '', '', '']);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Что-то пошло не так';
      showAlert('Ошибка', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Шаг 2: Проверка OTP и авторизация
  const verifyOTP = async (code: string) => {
    const normalized = normalizePhone(phone);
    setLoading(true);

    try {
      // Ищем актуальный код в базе
      const otpId = await verifyActiveOtp(normalized, code);

      if (!otpId) {
        showAlert('Неверный код', 'Код истёк или введён неверно. Попробуйте ещё раз.');
        setOtp(['', '', '', '']);
        setLoading(false);
        return;
      }

      // Помечаем код как использованный
      await markOtpAsUsed(otpId);

      // Авторизуем пользователя
      await authenticateWithPhone(normalized);

      // Успех! AuthProvider подхватит сессию автоматически
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Что-то пошло не так';
      showAlert('Ошибка', errorMessage);
      setLoading(false);
    }
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setStep('phone');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.light.primaryLight, Colors.light.white]}
        style={StyleSheet.absoluteFill}
      />
      <TouchableOpacity
        testID="login-back-button"
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={true}
          alwaysBounceVertical={true}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.innerContainer}>
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <Ionicons name="basket" size={48} color={Colors.light.white} />
                </View>
                <Text style={styles.appName}>DELIVA</Text>
                <Text style={styles.subtitle}>
                  Ваш личный маркет
                </Text>
              </View>

              <View style={styles.card}>
                {step === 'phone' ? (
                  <PhoneStep
                    phone={phone}
                    loading={loading}
                    onPhoneChange={setPhone}
                    onContinue={handleSendOTP}
                  />
                ) : (
                  <OtpStep
                    phone={phone}
                    loading={loading}
                    countdown={countdown}
                    otp={otp}
                    setOtp={setOtp}
                    onVerify={verifyOTP}
                    onResend={handleResend}
                    onChangeNumber={() => setStep('phone')}
                  />
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
