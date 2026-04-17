import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '@/constants/theme';

interface OrderDetailsErrorStateProps {
  error: string | null;
  onRetry: () => void;
}

export default function OrderDetailsErrorState({ error, onRetry }: OrderDetailsErrorStateProps) {
  return (
    <View style={styles.centerContainer}>
      <Ionicons name="alert-circle-outline" size={64} color={Colors.light.error} />
      <Text style={styles.errorText}>{error || 'Заказ не найден'}</Text>
      <TouchableOpacity style={styles.retryButtonCenter} onPress={onRetry}>
        <Ionicons name="refresh-outline" size={20} color={Colors.light.white} style={styles.retryIcon} />
        <Text style={styles.retryButtonText}>Повторить</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  errorText: { fontSize: 18, color: Colors.light.textSecondary, marginTop: Spacing.m, marginBottom: Spacing.ml, fontWeight: '500', textAlign: 'center' },
  retryButtonCenter: { backgroundColor: Colors.light.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.m, borderRadius: Radius.l },
  retryIcon: { marginRight: 8 },
  retryButtonText: { color: Colors.light.white, fontSize: 16, fontWeight: '600' },
});
