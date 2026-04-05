import React, { useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { loginStyles as styles } from '@/app/(auth)/login.styles';

interface OtpStepProps {
  phone: string;
  loading: boolean;
  countdown: number;
  otp: string[];
  setOtp: (otp: string[]) => void;
  onVerify: (code: string) => void;
  onResend: () => void;
  onChangeNumber: () => void;
}

export const OtpStep: React.FC<OtpStepProps> = ({
  phone,
  loading,
  countdown,
  otp,
  setOtp,
  onVerify,
  onResend,
  onChangeNumber,
}) => {
  const otpRefs = useRef<(TextInput | null)[]>([]);

  // Обработка ввода OTP-цифр
  const handleOtpChange = (value: string, index: number) => {
    const digits = value.replace(/\D/g, '');
    
    if (digits.length >= 4) {
      const newOtp = digits.slice(0, 4).split('');
      setOtp(newOtp);
      Keyboard.dismiss();
      onVerify(newOtp.join(''));
      return;
    }

    const singleDigit = digits.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = singleDigit;
    setOtp(newOtp);

    if (singleDigit && index < 3) {
      setTimeout(() => otpRefs.current[index + 1]?.focus(), 10);
    }

    if (singleDigit && index === 3) {
      const fullCode = [...newOtp.slice(0, 3), singleDigit].join('');
      if (fullCode.length === 4) {
        Keyboard.dismiss();
        onVerify(fullCode);
      }
    }
  };

  const handleOtpKeyPress = (e: { nativeEvent: { key: string } }, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  useEffect(() => {
    setTimeout(() => otpRefs.current[0]?.focus(), 300);
  }, []);

  return (
    <>
      <TouchableOpacity testID="otp-change-number" onPress={onChangeNumber} style={styles.otpBackButton}>
        <Ionicons name="arrow-back" size={20} color={Colors.light.text} />
        <Text style={styles.backButtonText}>Сменить номер</Text>
      </TouchableOpacity>

      <Text style={styles.formTitle}>Введите код</Text>
      <Text style={styles.formHint}>
        Код отправлен на <Text style={styles.countryCode}>{phone}</Text>
      </Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            testID={`otp-input-${index}`}
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

      {loading && <ActivityIndicator testID="otp-loader" color={Colors.light.primary} style={styles.otpLoader} />}

      <TouchableOpacity
        testID="otp-resend-button"
        onPress={onResend}
        style={styles.resendButton}
        disabled={countdown > 0}
      >
        <Text style={[styles.resendText, countdown > 0 ? styles.resendTextDisabled : styles.resendTextActive]}>
          {countdown > 0 ? `Повтор через ${countdown}с` : 'Отправить код повторно'}
        </Text>
      </TouchableOpacity>
    </>
  );
};
