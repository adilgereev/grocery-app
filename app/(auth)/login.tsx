import { Colors } from '@/constants/theme';
import { authenticateWithPhone, sendOtp, verifyOtp } from '@/lib/api/authApi';
import { authPhoneSchema, otpSchema } from '@/lib/utils/schemas';
import { normalizePhone } from '@/lib/services/sms';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OtpStep } from '@/components/auth/OtpStep';
import { PhoneStep } from '@/components/auth/PhoneStep';
import { loginStyles as styles } from '@/components/auth/login.styles';

// Шаги авторизации
type AuthStep = 'phone' | 'otp';

export default function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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

  // Шаг 1: Отправка SMS-кода через Edge Function
  const handleSendOTP = async () => {
    const normalized = normalizePhone(phone);
    
    const phoneValidation = authPhoneSchema.safeParse(normalized);
    if (!phoneValidation.success) {
      const errorMsg = phoneValidation.error.issues[0]?.message || 'Введите корректный номер телефона';
      Alert.alert('Ошибка', errorMsg);
      return;
    }

    setLoading(true);
    try {
      // Edge Function генерирует код, сохраняет в БД и отправляет SMS
      const result = await sendOtp(normalized);

      // DEV-режим: сервер вернул код в ответе (DEV_MODE=true на сервере)
      if (__DEV__ && result.code) {
        Alert.alert('Код отправлен', `[DEV] Ваш код: ${result.code}`);
      } else {
        Alert.alert('Код отправлен', `SMS с кодом отправлено на ${phone}`);
      }

      setStep('otp');
      setCountdown(60);
      setOtp(['', '', '', '']);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Что-то пошло не так';
      Alert.alert('Ошибка', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Шаг 2: Проверка OTP через Edge Function и авторизация
  const verifyOTP = async (code: string) => {
    const normalized = normalizePhone(phone);

    const otpValidation = otpSchema.safeParse(code);
    if (!otpValidation.success) {
      const errorMsg = otpValidation.error.issues[0]?.message || 'Введен некорректный код';
      Alert.alert('Ошибка ввода', errorMsg);
      return;
    }

    setLoading(true);

    try {
      // Верификация происходит на сервере — клиент не читает otp_codes напрямую
      const verified = await verifyOtp(normalized, code);

      if (!verified) {
        Alert.alert('Неверный код', 'Код истёк или введён неверно. Попробуйте ещё раз.');
        setOtp(['', '', '', '']);
        setLoading(false);
        return;
      }

      // Авторизуем пользователя после успешной верификации
      await authenticateWithPhone(normalized);

      // Успех! AuthProvider подхватит сессию автоматически
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Что-то пошло не так';
      Alert.alert('Ошибка', errorMessage);
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
            <View style={[styles.innerContainer, { paddingBottom: insets.bottom }]}>
              <View style={[styles.header, { paddingTop: insets.top }]}>
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
