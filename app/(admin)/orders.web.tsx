import { Colors, Radius, Spacing, Shadows } from '@/constants/theme';
import { supabase } from '@/lib/services/supabase';
import { Ionicons } from '@expo/vector-icons';
import { cleanAddress } from '@/lib/utils/addressUtils';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View, Linking } from 'react-native';

const STATUSES = {
  pending: { label: 'Новый', color: Colors.light.warning },
  processing: { label: 'Сборка', color: Colors.light.info },
  shipped: { label: 'В пути', color: Colors.light.info },
  delivered: { label: 'Доставлен', color: Colors.light.success },
  cancelled: { label: 'Отменён', color: Colors.light.error }
};

type OrderStatus = keyof typeof STATUSES;

interface OrderWithDetails {
  id: string;
  status: OrderStatus;
  total_amount: number;
  delivery_address: string;
  created_at: string;
  profiles: { first_name: string | null; last_name: string | null; phone: string } | { first_name: string | null; last_name: string | null; phone: string }[];
  items?: {
    id: string;
    quantity: number;
    price_at_time: number;
    product?: { name: string };
  }[];
}

export default function ManageOrdersScreen() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  // ID заказа, для которого открыт выбор статуса
  const [statusPickerOrderId, setStatusPickerOrderId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedOrders(prev => prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id]);
  };

  useEffect(() => {
    fetchOrders();

    // Real-time подписка на изменения заказов
    const channel = supabase.channel('admin_orders_web')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders(true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, profiles:user_id (first_name, last_name, phone), items:order_items(*, product:products(*))')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (!error) {
      // Оптимистичное обновление
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    }
    setStatusPickerOrderId(null);
  };

  const renderOrder = ({ item }: { item: OrderWithDetails }) => {
    const statusInfo = STATUSES[item.status] || STATUSES.pending;
    const profile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
    const customerName = profile?.first_name
      ? `${profile.first_name} ${profile.last_name || ''}`
      : 'Клиент';

    const date = new Date(item.created_at).toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });

    const isStatusPickerOpen = statusPickerOrderId === item.id;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.orderId}>Заказ #{item.id.split('-')[0]}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>
        </View>

        <View style={styles.customerInfo}>
          <TouchableOpacity
            style={styles.customerRow}
            onPress={() => profile?.phone && Linking.openURL(`tel:${profile.phone}`)}
          >
            <Ionicons name="person-circle" size={24} color={Colors.light.textSecondary} />
            <View style={styles.customerInfoContainer}>
              <Text style={styles.customerName}>{customerName}</Text>
              <Text style={styles.customerPhone}>{profile?.phone || 'Телефон не указан'}</Text>
            </View>
            {profile?.phone && (
              <Ionicons name="call" size={20} color={Colors.light.primary} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.addressBox}>
          <Ionicons name="location" size={16} color={Colors.light.textSecondary} />
          <Text style={styles.addressText} numberOfLines={2}>{cleanAddress(item.delivery_address)}</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.price}>{item.total_amount} ₽</Text>
          <Text style={styles.date}>{date}</Text>
        </View>

        <TouchableOpacity style={styles.expandButton} onPress={() => toggleExpand(item.id)}>
          <Text style={styles.expandButtonText}>
            {expandedOrders.includes(item.id) ? 'Скрыть состав заказа' : `Показать товары (${item.items?.length || 0})`}
          </Text>
          <Ionicons
            name={expandedOrders.includes(item.id) ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={Colors.light.primary}
          />
        </TouchableOpacity>

        {expandedOrders.includes(item.id) && item.items && (
          <View style={styles.itemsContainer}>
            {item.items.map((orderItem) => (
              <View key={orderItem.id} style={styles.itemRow}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {orderItem.product?.name || 'Неизвестный товар'}{' '}
                  <Text style={styles.itemQty}>x{orderItem.quantity}</Text>
                </Text>
                <Text style={styles.itemPrice}>{orderItem.price_at_time * orderItem.quantity} ₽</Text>
              </View>
            ))}
          </View>
        )}

        {/* Изменение статуса — inline для Web */}
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: statusInfo.color }]}
          onPress={() => setStatusPickerOrderId(isStatusPickerOpen ? null : item.id)}
        >
          <Text style={styles.actionButtonText}>
            {isStatusPickerOpen ? 'Закрыть' : 'Изменить статус'}
          </Text>
        </TouchableOpacity>

        {isStatusPickerOpen && (
          <View style={styles.statusPicker}>
            {(Object.entries(STATUSES) as [OrderStatus, typeof STATUSES[OrderStatus]][]).map(([key, val]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.statusOption,
                  item.status === key && { backgroundColor: val.color + '20' }
                ]}
                onPress={() => updateStatus(item.id, key)}
              >
                <View style={[styles.statusDot, { backgroundColor: val.color }]} />
                <Text style={[styles.statusOptionText, { color: val.color }]}>{val.label}</Text>
                {item.status === key && (
                  <Ionicons name="checkmark" size={16} color={val.color} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>Нет заказов.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: Spacing.m, paddingBottom: 60 },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: Radius.l,
    padding: Spacing.m,
    marginBottom: Spacing.m,
    ...Shadows.md,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.m },
  orderId: { fontSize: 16, fontWeight: '700', color: Colors.light.text },
  statusBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.m },
  statusText: { fontSize: 12, fontWeight: '700' },
  customerInfo: { marginBottom: Spacing.s },
  customerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.light.background, padding: 10, borderRadius: Radius.m },
  customerName: { fontSize: 14, fontWeight: '600', color: Colors.light.text },
  customerInfoContainer: { marginLeft: Spacing.s, flex: 1 },
  customerPhone: { fontSize: 12, color: Colors.light.textSecondary, marginTop: 2 },
  addressBox: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.m },
  addressText: { fontSize: 13, color: Colors.light.textSecondary, marginLeft: 6, flex: 1, lineHeight: 18 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.m, borderTopWidth: 1, borderTopColor: Colors.light.borderLight, paddingTop: Spacing.s },
  price: { fontSize: 18, fontWeight: '800', color: Colors.light.text },
  date: { fontSize: 12, color: Colors.light.textLight },
  actionButton: { paddingVertical: Spacing.sm, borderRadius: Radius.m, alignItems: 'center' },
  actionButtonText: { color: Colors.light.white, fontSize: 14, fontWeight: '700' },
  empty: { textAlign: 'center', marginTop: 100, color: Colors.light.textSecondary },
  expandButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.s, marginBottom: Spacing.s, backgroundColor: Colors.light.primaryLight, borderRadius: Radius.m },
  expandButtonText: { color: Colors.light.primary, fontSize: 13, fontWeight: '600', marginRight: 4 },
  itemsContainer: { backgroundColor: Colors.light.background, borderRadius: Radius.m, padding: Spacing.m, marginBottom: Spacing.m },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'flex-start' },
  itemName: { flex: 1, fontSize: 13, color: Colors.light.text, paddingRight: Spacing.m },
  itemQty: { fontWeight: '700', color: Colors.light.textSecondary },
  itemPrice: { fontSize: 13, fontWeight: '700', color: Colors.light.text },
  // Inline status picker (только для Web)
  statusPicker: {
    marginTop: Spacing.s,
    backgroundColor: Colors.light.background,
    borderRadius: Radius.m,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: Radius.pill,
    marginRight: Spacing.s,
  },
  statusOptionText: { flex: 1, fontSize: 14, fontWeight: '600' },
});
