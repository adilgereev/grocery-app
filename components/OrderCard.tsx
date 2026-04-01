import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { Order } from '@/types';
import { cleanAddress } from '@/lib/address';

interface OrderCardProps {
  order: Order;
  onPress: (orderId: string) => void;
}

// Конфигурация статусов
const STATUS_CONFIG: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  pending:    { label: 'Собираем',   emoji: '📦', color: Colors.light.info, bg: Colors.light.infoLight },
  processing: { label: 'Собираем',   emoji: '📦', color: Colors.light.info, bg: Colors.light.infoLight },
  shipped:    { label: 'В пути',     emoji: '🚗', color: Colors.light.info, bg: Colors.light.infoLight },
  delivered:  { label: 'Доставлен',  emoji: '✅', color: Colors.light.success, bg: Colors.light.successLight },
  cancelled:  { label: 'Отменён',    emoji: '❌', color: Colors.light.error, bg: Colors.light.errorLight },
};

const OrderCard: React.FC<OrderCardProps> = ({ order, onPress }) => {
  const status = order.status?.toLowerCase() || 'pending';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.7}
      onPress={() => onPress(order.id)}
      testID="order-card"
    >
      {/* Верхняя строка: эмодзи + статус + стрелка */}
      <View style={styles.topRow}>
        <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>  
          <Text style={styles.statusEmoji} testID="order-status-emoji">{config.emoji}</Text>
          <Text style={[styles.statusLabel, { color: config.color }]} testID="order-status-label">{config.label}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.light.textLight} />
      </View>

      {/* Адрес */}
      <View style={styles.addressRow}>
        <Ionicons name="location-outline" size={15} color={Colors.light.textSecondary} />
        <Text style={styles.addressText} numberOfLines={1}>
          {cleanAddress(order.delivery_address)}
        </Text>
      </View>

      {/* Нижняя строка: дата + сумма */}
      <View style={styles.bottomRow}>
        <Text style={styles.dateText}>
          {order.created_at ? formatDate(order.created_at) : ''}
        </Text>
        <Text style={styles.totalText} testID="order-total-price">
          {Number(order.total_amount).toFixed(0)} ₽
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.card, 
    borderRadius: Radius.xl, 
    padding: Spacing.m, 
    marginBottom: Spacing.m,
    shadowColor: Colors.light.text, 
    shadowOpacity: 0.03, 
    shadowOffset: { width: 0, height: 2 }, 
    shadowRadius: 6,
  },
  topRow: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: Spacing.s,
  },
  statusBadge: {
    flexDirection: 'row', 
    alignItems: 'center',
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: Radius.pill,
  },
  statusEmoji: { fontSize: 16, marginRight: 6 },
  statusLabel: { fontSize: 14, fontWeight: '700' },
  addressRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: Spacing.s 
  },
  addressText: { 
    fontSize: 14, 
    color: Colors.light.textSecondary, 
    marginLeft: 6, 
    flex: 1, 
    fontWeight: '500' 
  },
  bottomRow: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderTopWidth: 1, 
    borderTopColor: Colors.light.borderLight, 
    paddingTop: Spacing.s,
  },
  dateText: { 
    fontSize: 13, 
    color: Colors.light.textLight, 
    fontWeight: '500' 
  },
  totalText: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: Colors.light.text 
  },
});

export default OrderCard;
