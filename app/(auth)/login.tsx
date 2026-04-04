import { Colors, Radius, Spacing } from '@/constants/theme';
import { logger } from '@/lib/logger';
import { generateOTP, generatePasswordFromPhone, normalizePhone, phoneToEmail, sendSMS } from '@/lib/sms';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

// Шаги авторизации
type AuthStep = 'phone' | 'otp';

export default function Login() {
  const router = useRouter();
  const [step, setStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Рефы для автоперехода между OTP-полями
  const otpRefs = useRef<(TextInput | null)[]>([]);

  // Обратный отсчёт для повторной отправки
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c: number) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // Маска ввода телефона: +7 (900) 123-45-67
  const handlePhoneChange = (text: string) => {
    // Убираем всё кроме цифр
    let digits = text.replace(/\D/g, '');

    // Если начинается с 8, заменяем на 7
    if (digits.startsWith('8')) digits = '7' + digits.slice(1);
    // Убираем лишние цифры (максимум 11: 7 + 10 цифр)
    if (digits.length > 11) digits = digits.slice(0, 11);
    // Если ввели без 7, добавляем
    if (digits.length > 0 && !digits.startsWith('7')) digits = '7' + digits;

    // Форматируем
    let formatted = '';
    if (digits.length >= 1) formatted = '+7';
    if (digits.length >= 2) formatted += ` (${digits.slice(1, Math.min(4, digits.length))}`;
    if (digits.length >= 4) formatted += ')';
    if (digits.length >= 5) formatted += ` ${digits.slice(4, Math.min(7, digits.length))}`;
    if (digits.length >= 8) formatted += `-${digits.slice(7, Math.min(9, digits.length))}`;
    if (digits.length >= 10) formatted += `-${digits.slice(9, 11)}`;

    setPhone(formatted);
  };

  // Обработка ввода OTP-цифр (включая вставку полного кода из автоподсказки)
  const handleOtpChange = (value: string, index: number) => {
    // Если вставлен полный код (из автоподсказки клавиатуры / буфера обмена)
    const digits = value.replace(/\D/g, '');
    if (digits.length >= 4) {
      const newOtp = digits.slice(0, 4).split('');
      setOtp(newOtp);
      Keyboard.dismiss();
      verifyOTP(newOtp.join(''));
      return;
    }

    // Обычный ввод одной цифры
    const singleDigit = digits.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = singleDigit;
    setOtp(newOtp);

    // Автопереход на следующее поле
    if (singleDigit && index < 3) {
      setTimeout(() => otpRefs.current[index + 1]?.focus(), 10);
    }

    // Если все 4 цифры введены — автоотправка
    if (singleDigit && index === 3) {
      const fullCode = [...newOtp.slice(0, 3), singleDigit].join('');
      if (fullCode.length === 4) {
        Keyboard.dismiss();
        verifyOTP(fullCode);
      }
    }
  };

  // Обработка Backspace в OTP-полях
  const handleOtpKeyPress = (e: { nativeEvent: { key: string } }, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
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
      const { error: insertError } = await supabase.from('otp_codes').insert({
        phone: normalized,
        code,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      });

      if (insertError) throw insertError;

      // Отправляем SMS (только в продакшене, чтобы не тратить баланс при тестах)
      let result = { success: true, error: null as string | null };
      if (!__DEV__) {
        const smsResult = await sendSMS(normalized, `Вкусная Доставка: ваш код ${code}`);
        result = { success: smsResult.success, error: smsResult.error || null };
      } else {
        logger.log(`[DEV MODE] SMS bypass for ${normalized}. Your code is: ${code}`);
      }

      // [DEBUG] Показываем код в алерте для тестирования
      // TODO: Убрать перед релизом!
      showAlert('Код отправлен', `Ваш код (для теста): ${code}\n\nSMS статус: ${__DEV__ ? 'Bypassed (DEV)' : (result.success ? 'Отправлено' : result.error)}`);

      // Переходим на экран ввода кода независимо от результата SMS
      // (пользователь может получить SMS с задержкой)

      setStep('otp');
      setCountdown(60);
      setOtp(['', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 300);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Что-то пошло не так';
      showAlert('Ошибка', errorMessage);
    }
    setLoading(false);
  };

  // Шаг 2: Проверка OTP и авторизация
  const verifyOTP = async (code: string) => {
    const normalized = normalizePhone(phone);
    setLoading(true);

    try {
      // Ищем актуальный код в базе
      const { data: otpData, error: otpError } = await supabase
        .from('otp_codes')
        .select('*')
        .eq('phone', normalized)
        .eq('code', code)
        .eq('used', false)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (otpError || !otpData) {
        showAlert('Неверный код', 'Код истёк или введён неверно. Попробуйте ещё раз.');
        setOtp(['', '', '', '']);
        otpRefs.current[0]?.focus();
        setLoading(false);
        return;
      }

      // Помечаем код как использованный
      await supabase.from('otp_codes').update({ used: true }).eq('id', otpData.id);

      // Авторизуем пользователя в Supabase
      const email = phoneToEmail(normalized);
      const password = generatePasswordFromPhone(normalized);

      // Пробуем войти
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        // Пользователь не существует — регистрируем
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { phone: normalized } }
        });

        if (signUpError) {
          // Если аккаунт создан между нашими вызовами — повторный вход
          if (signUpError.message?.includes('already registered') || signUpError.message?.includes('already been registered')) {
            const { error: retryError } = await supabase.auth.signInWithPassword({ email, password });
            if (retryError) {
              showAlert('Ошибка', 'Не удалось войти. Попробуйте ещё раз.');
              setLoading(false);
              return;
            }
          } else {
            showAlert('Ошибка', signUpError.message);
            setLoading(false);
            return;
          }
        }
      }

      // Успех! AuthProvider подхватит сессию автоматически
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Что-то пошло не так';
      showAlert('Ошибка', errorMessage);
    }
    setLoading(false);
  };

  // Повторная отправка кода
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
                  <>
                    <Text style={styles.formTitle}>Вход</Text>
                    <Text style={styles.formHint}>
                      Введите номер телефона для SMS подтверждения
                    </Text>

                    <View style={styles.phoneInputContainer}>
                      <Ionicons name="call-outline" size={20} color={Colors.light.textLight} />
                      <TextInput
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
                      style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
                      onPress={handleSendOTP}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color={Colors.light.white} />
                      ) : (
                        <Text style={styles.primaryButtonText}>Продолжить</Text>
                      )}
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity onPress={() => setStep('phone')} style={styles.otpBackButton}>
                      <Ionicons name="arrow-back" size={20} color={Colors.light.text} />
                      <Text style={styles.backButtonText}>Сменить номер</Text>
                    </TouchableOpacity>

                    <Text style={styles.formTitle}>Введите код</Text>
                    <Text style={styles.formHint}>
                      Код отправлен на <Text style={styles.countryCode}>{phone}</Text>
                    </Text>

                    <View style={styles.otpContainer}>
                      {otp.map((digit: string, index: number) => (
                        <TextInput
                          key={index}
                          ref={ref => { otpRefs.current[index] = ref; }}
                          style={[styles.otpInput, digit ? styles.otpInputFilled : {}]}
                          value={digit}
                          onChangeText={(val) => handleOtpChange(val, index)}
                          onKeyPress={(e) => handleOtpKeyPress(e, index)}
                          keyboardType="number-pad"
                          maxLength={4}
                          selectTextOnFocus
                          textContentType="oneTimeCode"
                          autoComplete="one-time-code"
                        />
                      ))}
                    </View>

                    {loading && <ActivityIndicator color={Colors.light.primary} style={styles.otpLoader} />}

                    <TouchableOpacity
                      onPress={handleResend}
                      style={styles.resendButton}
                      disabled={countdown > 0}
                    >
                      <Text style={[styles.resendText, countdown > 0 ? styles.resendTextDisabled : styles.resendTextActive]}>
                        {countdown > 0 ? `Повтор через ${countdown}с` : 'Отправить код повторно'}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.white },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 10,
    padding: 10, // Удобная область нажатия без визуального круга
    zIndex: 100,
  },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
  innerContainer: { paddingBottom: 60 },

  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingTop: 60,
  },
  logoContainer: {
    width: 84, height: 84,
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.xxl, justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.m,
    shadowColor: Colors.light.text, shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 6 },
  },
  appName: {
    fontSize: 28, fontWeight: '700', color: Colors.light.text,
    letterSpacing: 0.5, marginBottom: 4,
  },
  subtitle: {
    fontSize: 14, color: Colors.light.textSecondary,
    textAlign: 'center', fontWeight: '500',
  },
  card: {
    backgroundColor: Colors.light.glassBackground, // Используем токены для эффекта стекла
    marginHorizontal: Spacing.m,
    borderRadius: Radius.xxl + 4,
    padding: Spacing.xl,
    shadowColor: Colors.light.text,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 0,
    borderWidth: 1.5,
    borderColor: Colors.light.glassBorder, // Используем токены для эффекта стекла
  },
  formTitle: {
    fontSize: 24, fontWeight: '700', color: Colors.light.text, marginBottom: 8,
  },
  formHint: {
    fontSize: 14, color: Colors.light.textSecondary, lineHeight: 20,
    marginBottom: Spacing.l,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: Radius.m,
    paddingHorizontal: Spacing.m,
    height: 56,
    marginBottom: Spacing.m,
  },
  phoneInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginLeft: Spacing.s,
  },
  countryCode: { color: Colors.light.text, fontWeight: '700' },

  primaryButton: {
    backgroundColor: Colors.light.primary, borderRadius: Radius.m,
    height: 54, justifyContent: 'center', alignItems: 'center',
    shadowColor: Colors.light.text, shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
  },
  primaryButtonDisabled: { backgroundColor: Colors.light.primaryLight },
  primaryButtonText: { color: Colors.light.white, fontSize: 16, fontWeight: '700' },

  otpBackButton: {
    flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.m,
  },
  backButtonText: { marginLeft: 8, color: Colors.light.textSecondary, fontWeight: '600' },
  otpContainer: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.s,
  },
  otpInput: {
    width: 60, height: 64,
    borderWidth: 2, borderColor: Colors.light.border, borderRadius: Radius.m,
    fontSize: 24, fontWeight: '700', color: Colors.light.text,
    textAlign: 'center', backgroundColor: Colors.light.borderLight,
  },
  otpInputFilled: { borderColor: Colors.light.primary, backgroundColor: Colors.light.primaryLight },
  resendButton: { marginTop: Spacing.l, alignItems: 'center' },
  resendText: { fontSize: 13, fontWeight: '600' },
  resendTextActive: { color: Colors.light.primary },
  resendTextDisabled: { color: Colors.light.textLight },
  otpLoader: { marginTop: Spacing.m },
});
