import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/theme';

interface OrderSectionProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
}

/**
 * Универсальный блок информации о заказе (Адрес, Оплата).
 * Оформлен в чистом премиальном стиле.
 */
const OrderSection = ({ title, subtitle, icon }: OrderSectionProps) => {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={20} color={Colors.light.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionText}>{subtitle}</Text>
      </View>
    </View>
  );
};

export default React.memo(OrderSection);

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: Colors.light.card,
    borderRadius: Radius.xl,
    padding: Spacing.m,
    marginBottom: Spacing.l,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: Colors.light.text,
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.m,
  },
  textContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    color: Colors.light.textLight,
    fontWeight: '600',
    marginBottom: 2,
  },
  sectionText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '600',
    lineHeight: 20,
  },
});
