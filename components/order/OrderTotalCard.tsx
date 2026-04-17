import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Shadows } from '@/constants/theme';

interface OrderTotalCardProps {
  totalAmount: number;
  itemCount: number;
  onRepeat: () => void;
}

export default function OrderTotalCard({ totalAmount, itemCount, onRepeat }: OrderTotalCardProps) {
  return (
    <View style={styles.totalCard}>
      <View style={styles.totalRow}>
        <Text style={styles.totalItems}>Товары ({itemCount})</Text>
        <Text style={styles.totalItemsPrice}>{Number(totalAmount).toFixed(0)} ₽</Text>
      </View>
      <View style={styles.totalRow}>
        <Text style={styles.totalItems}>Доставка</Text>
        <Text style={styles.totalFree}>Бесплатно</Text>
      </View>
      <View style={styles.totalDivider} />
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Итого</Text>
        <Text style={styles.totalPrice}>{Number(totalAmount).toFixed(0)} ₽</Text>
      </View>
      <TouchableOpacity style={styles.repeatButton} onPress={onRepeat}>
        <Ionicons name="bag-handle-outline" size={20} color={Colors.light.white} style={styles.repeatIcon} />
        <Text style={styles.repeatButtonText}>Повторить покупку</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  totalCard: {
    backgroundColor: Colors.light.card,
    borderRadius: Radius.xl,
    padding: Spacing.l,
    marginBottom: Spacing.m,
    ...Shadows.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.s,
  },
  totalItems: { fontSize: 14, color: Colors.light.textSecondary, fontWeight: '500' },
  totalItemsPrice: { fontSize: 14, color: Colors.light.text, fontWeight: '600' },
  totalFree: { fontSize: 14, color: Colors.light.primary, fontWeight: '600' },
  totalDivider: { height: 1, backgroundColor: Colors.light.borderLight, marginVertical: Spacing.s },
  totalLabel: { fontSize: 18, fontWeight: '700', color: Colors.light.text },
  totalPrice: { fontSize: 20, fontWeight: '700', color: Colors.light.primary },
  repeatButton: {
    backgroundColor: Colors.light.cta,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: Radius.pill,
    marginTop: Spacing.l,
  },
  repeatIcon: { marginRight: 8 },
  repeatButtonText: { color: Colors.light.white, fontSize: 16, fontWeight: '700' },
});
