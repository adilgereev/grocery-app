import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, Shadows } from '@/constants/theme';

export default function OrderSuccessScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Показываем первые 8 символов UUID как номер заказа
  const orderNumber = id ? `#${id.slice(0, 8).toUpperCase()}` : '';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Иконка успеха */}
        <View style={styles.iconWrapper}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={56} color={Colors.light.white} />
          </View>
        </View>

        {/* Текст */}
        <Text style={styles.title}>Заказ оформлен!</Text>
        {orderNumber ? (
          <Text style={styles.orderNumber}>{orderNumber}</Text>
        ) : null}
        <Text style={styles.subtitle}>
          Передан на сборку. Ожидайте доставку — уведомим о статусе.
        </Text>
      </View>

      {/* Кнопки */}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.7}
          onPress={() => router.replace('/orders')}
          testID="order-success-orders-button"
        >
          <Text style={styles.secondaryButtonText}>Мои заказы</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.8}
          onPress={() => router.replace('/(tabs)/(index)')}
          testID="order-success-home-button"
        >
          <Text style={styles.primaryButtonText}>На главную</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  iconWrapper: {
    marginBottom: Spacing.xl,
  },
  iconCircle: {
    width: 104,
    height: 104,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.cta,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
  },
  title: {
    fontSize: FontSize.hero,
    fontWeight: '700',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: Spacing.s,
  },
  orderNumber: {
    fontSize: FontSize.l,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginBottom: Spacing.m,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: FontSize.m,
    color: Colors.light.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttons: {
    paddingHorizontal: Spacing.ml,
    paddingBottom: Spacing.l,
    gap: Spacing.sm,
  },
  secondaryButton: {
    height: 52,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    ...Shadows.sm,
  },
  secondaryButtonText: {
    fontSize: FontSize.m,
    fontWeight: '600',
    color: Colors.light.text,
  },
  primaryButton: {
    height: 56,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.cta,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  primaryButtonText: {
    fontSize: FontSize.m,
    fontWeight: '700',
    color: Colors.light.white,
  },
});
