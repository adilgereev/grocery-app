import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Shadows } from '@/constants/theme';

interface OrderDetailsHeaderProps {
  orderId: string;
  onBack: () => void;
}

export default function OrderDetailsHeader({ orderId, onBack }: OrderDetailsHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
      </TouchableOpacity>
      <Text style={styles.title}>Заказ №{orderId.substring(0, 8).toUpperCase()}</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.l,
    paddingTop: 60,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
    ...Shadows.sm,
    zIndex: 10,
  },
  headerSpacer: { width: 24 },
  backButton: { padding: Spacing.s, marginRight: Spacing.s },
  title: { fontSize: 18, fontWeight: '700', color: Colors.light.text },
});
