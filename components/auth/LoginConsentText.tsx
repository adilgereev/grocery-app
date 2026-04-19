import React from 'react';
import { Text } from 'react-native';
import { useRouter } from 'expo-router';
import { loginStyles as styles } from '@/components/auth/login.styles';

export function LoginConsentText() {
  const router = useRouter();

  return (
    <Text style={styles.consentText}>
      Нажимая «Продолжить», вы даёте согласие на обработку персональных данных согласно{' '}
      <Text
        style={styles.consentLink}
        onPress={() => router.push('/privacy-policy' as any)}
        testID="login-terms-policy-link"
      >
        Политике конфиденциальности
      </Text>
      {' '}и принимаете условия{' '}
      <Text
        style={styles.consentLink}
        onPress={() => router.push('/public-offer' as any)}
        testID="login-terms-offer-link"
      >
        Публичной оферты
      </Text>
    </Text>
  );
}
