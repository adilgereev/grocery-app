import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, Radius, Shadows, Spacing } from '@/constants/theme';

interface CartPriceSummaryProps {
  subtotal: number;
  deliveryFee: number;
  totalPrice: number;
}

/**
 * Упрощённая карточка итоговой стоимости на экране корзины.
 * Показывает три строки: товары, доставка, итого — без деталей чекаута.
 */
export default function CartPriceSummary({ subtotal, deliveryFee, totalPrice }: CartPriceSummaryProps) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label}>Товары</Text>
        <Text style={styles.value}>{subtotal.toFixed(0)} ₽</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Доставка</Text>
        {deliveryFee > 0 ? (
          <Text style={styles.value}>{deliveryFee.toFixed(0)} ₽</Text>
        ) : (
          <Text style={styles.valueFree}>Бесплатно</Text>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.totalLabel}>Итого</Text>
        <Text style={styles.totalValue}>{totalPrice.toFixed(0)} ₽</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: Radius.xxl,
    padding: Spacing.ml,
    marginBottom: Spacing.m,
    ...Shadows.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: FontSize.l,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  value: {
    fontSize: FontSize.l,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  valueFree: {
    fontSize: FontSize.l,
    color: Colors.light.primary,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.borderLight,
    marginVertical: Spacing.sm,
    marginHorizontal: -Spacing.ml,
  },
  totalLabel: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 0,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
  },
});
