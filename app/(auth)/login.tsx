import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Platform, ActivityIndicator, Alert, Keyboard } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { generateOTP, normalizePhone, sendSMS, generatePasswordFromPhone, phoneToEmail } from '@/lib/sms';

// Шаги авторизации
type AuthStep = 'phone' | 'otp';

export default function Login() {
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
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
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
      otpRefs.current[index + 1]?.focus();
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

      // Отправляем SMS
      const result = await sendSMS(normalized, `Вкусная Доставка: ваш код ${code}`);

      // [DEBUG] Показываем код в алерте для тестирования
      // TODO: Убрать перед релизом!
      showAlert('Код отправлен', `Ваш код (для теста): ${code}\n\nSMS статус: ${result.success ? 'Отправлено' : result.error}`);

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
          showAlert('Ошибка', signUpError.message);
          setLoading(false);
          return;
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
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
      keyboardShouldPersistTaps="handled"
      bounces={false}
      showsVerticalScrollIndicator={false}
      enableOnAndroid={true}
    >
      {/* Зеленая шапка с логотипом */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="basket" size={60} color="#fff" />
        </View>
        <Text style={styles.appName}>Вкусная Доставка</Text>
        <Text style={styles.subtitle}>
          Свежие продукты у ваших дверей{'\n'}всего за 15 минут
        </Text>
      </View>

      {/* Белая карточка с формой */}
      <View style={styles.formContainer}>
        {step === 'phone' ? (
          <>
            <Text style={styles.formTitle}>Войти по номеру</Text>
            <Text style={styles.formHint}>
              Введите номер телефона, и мы отправим SMS с кодом подтверждения
            </Text>

            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={20} color={Colors.light.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
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
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Получить код</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Кнопка назад */}
            <TouchableOpacity onPress={() => setStep('phone')} style={styles.otpBackButton}>
              <Ionicons name="arrow-back" size={22} color={Colors.light.text} />
            </TouchableOpacity>

            <Text style={styles.formTitle}>Введите код</Text>
            <Text style={styles.formHint}>
              SMS с кодом отправлен на{'\n'}
              <Text style={{ fontWeight: '700', color: Colors.light.text }}>{phone}</Text>
            </Text>

            {/* 4 поля OTP */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => { otpRefs.current[index] = ref; }}
                  style={[
                    styles.otpInput,
                    digit ? styles.otpInputFilled : {},
                  ]}
                  value={digit}
                  onChangeText={(val) => handleOtpChange(val, index)}
                  onKeyPress={(e) => handleOtpKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>

            {loading && (
              <ActivityIndicator color={Colors.light.primary} style={{ marginTop: Spacing.m }} />
            )}

            {/* Повторная отправка */}
            <TouchableOpacity
              onPress={handleResend}
              style={styles.resendButton}
              disabled={countdown > 0}
            >
              <Text style={[
                styles.resendText,
                countdown > 0 ? { color: Colors.light.textLight } : { color: Colors.light.primary }
              ]}>
                {countdown > 0
                  ? `Отправить повторно через ${countdown} сек`
                  : 'Отправить код повторно'
                }
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.primary,
  },
  // Шапка
  header: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingTop: Spacing.xxl, paddingBottom: Spacing.xxl, paddingHorizontal: 20,
  },
  logoContainer: {
    width: 100, height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 30, justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 32, fontWeight: '900', color: '#fff',
    letterSpacing: 0.5, marginBottom: Spacing.s,
  },
  subtitle: {
    fontSize: 16, color: Colors.light.primaryBorder,
    textAlign: 'center', lineHeight: 22, fontWeight: '500',
  },

  // Форма
  formContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 40, borderTopRightRadius: 40,
    paddingHorizontal: 28, paddingTop: Spacing.xxl,
    paddingBottom: Platform.OS === 'ios' ? 50 : 40,
    elevation: 20, shadowColor: '#000', shadowOpacity: 0.15,
    shadowRadius: 30, shadowOffset: { width: 0, height: -10 },
  },
  formTitle: {
    fontSize: 26, fontWeight: 'bold', color: Colors.light.text, marginBottom: Spacing.s,
  },
  formHint: {
    fontSize: 15, color: Colors.light.textSecondary, lineHeight: 22,
    marginBottom: Spacing.l,
  },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.light.borderLight, borderRadius: Radius.l,
    marginBottom: Spacing.m, paddingHorizontal: Spacing.m, height: 60,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 18, color: Colors.light.text, fontWeight: '600', letterSpacing: 0.5 },

  primaryButton: {
    backgroundColor: Colors.light.primary, borderRadius: Radius.l,
    height: 60, justifyContent: 'center', alignItems: 'center', marginTop: 12,
    elevation: 3, shadowColor: Colors.light.primary, shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
  },
  primaryButtonDisabled: {
    backgroundColor: '#34D399', elevation: 0, shadowOpacity: 0,
  },
  primaryButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  // OTP экран
  otpBackButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.light.borderLight,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.m,
  },
  otpContainer: {
    flexDirection: 'row', justifyContent: 'center', gap: 14, marginTop: Spacing.s,
  },
  otpInput: {
    width: 64, height: 72,
    borderWidth: 2, borderColor: Colors.light.border, borderRadius: Radius.l,
    fontSize: 28, fontWeight: '800', color: Colors.light.text,
    textAlign: 'center', backgroundColor: Colors.light.borderLight,
  },
  otpInputFilled: {
    borderColor: Colors.light.primary, backgroundColor: Colors.light.primaryLight,
  },
  resendButton: { marginTop: Spacing.xl, alignItems: 'center' },
  resendText: { fontSize: 15, fontWeight: '600' },
});
