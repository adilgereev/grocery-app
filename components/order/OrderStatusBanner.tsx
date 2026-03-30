import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius } from '@/constants/theme';

interface OrderStatusBannerProps {
  status: string;
  config: {
    label: string;
    emoji: string;
    color: string;
    bg: string;
  };
  date: string;
}

/**
 * Баннер статуса заказа (Эмодзи + Текст + Дата)
 * Оформлен в стиле Emerald Minimalism
 */
const OrderStatusBanner = ({ status, config, date }: OrderStatusBannerProps) => {
  return (
    <View style={[styles.statusBanner, { backgroundColor: config.bg }]}>  
      <Text style={styles.statusEmoji}>{config.emoji}</Text>
      <Text style={[styles.statusLabel, { color: config.color }]}>{config.label}</Text>
      <Text style={styles.statusDate}>{date}</Text>
    </View>
  );
};

export default React.memo(OrderStatusBanner);

const styles = StyleSheet.create({
  statusBanner: {
    borderRadius: Radius.xl,
    padding: Spacing.l,
    alignItems: 'center',
    marginBottom: Spacing.m,
  },
  statusEmoji: {
    fontSize: 48,
    marginBottom: Spacing.s,
  },
  statusLabel: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  statusDate: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
});
