import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';

export function AddressEmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="location-outline" size={40} color={Colors.light.primary} />
      </View>
      <Text style={styles.emptyTitle}>Нет адресов доставки</Text>
      <Text style={styles.emptySubtitle}>Добавьте адрес, чтобы получать заказы</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.m,
  },
  emptyTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.s,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FontSize.m,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
