import { Colors, Radius, Spacing, Shadows } from '@/constants/theme';
import { supabase } from '@/lib/services/supabase';
import { fetchAllOrdersWithDetails, updateOrderStatus, AdminOrderWithDetails } from '@/lib/api/adminApi';
import { Ionicons } from '@expo/vector-icons';
import { cleanAddress } from '@/lib/utils/addressUtils';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const STATUSES = {
  pending: { label: 'Новый', color: Colors.light.warning },
  processing: { label: 'Сборка', color: Colors.light.info },
  shipped: { label: 'В пути', color: Colors.light.secondary },
  delivered: { label: 'Доставлен', color: Colors.light.success },
  cancelled: { label: 'Отменен', color: Colors.light.error }
};

type OrderStatus = keyof typeof STATUSES;

export default function ManageOrdersScreen() {
  const [orders, setOrders] = useState<AdminOrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedOrders(prev => prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id]);
  };

  useEffect(() => {
    fetchOrders();

    // Subscribe to new orders to show real-time updates for admin
    const channel = supabase.channel('admin_orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
        fetchOrders(); // Refresh fully
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchAllOrdersWithDetails();
      setOrders(data);
    } catch {
      // Ошибка загрузки заказов
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      // Оптимистичное обновление
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      Alert.alert('Ошибка', errorMessage);
    }
  };

  const showStatusOptions = (orderId: string, _currentStatus: string) => {
    Alert.alert(
      'Изменить статус',
      'Выберите новый статус для заказа',
      [
        { text: 'Сборка', onPress: () => handleUpdateStatus(orderId, 'processing') },
        { text: 'В пути', onPress: () => handleUpdateStatus(orderId, 'shipped') },
        { text: 'Доставлен', onPress: () => handleUpdateStatus(orderId, 'delivered') },
        { text: 'Отмена', onPress: () => handleUpdateStatus(orderId, 'cancelled'), style: 'destructive' },
        { text: 'Назад', style: 'cancel' }
      ]
    );
  };

  const callCustomer = (phone: string | null) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('Ошибка', 'У клиента не указан номер телефона');
    }
  };

  const renderOrder = ({ item }: { item: AdminOrderWithDetails }) => {
    const statusInfo = STATUSES[item.status] || STATUSES.pending;
    const profile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
    const customerName = profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : 'Клиент';

    const date = new Date(item.created_at).toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.orderId}>Заказ #{item.id.split('-')[0]}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>
        </View>

        <View style={styles.customerInfo}>
          <TouchableOpacity style={styles.customerRow} onPress={() => callCustomer(profile?.phone)}>
            <Ionicons name="person-circle" size={24} color={Colors.light.textSecondary} />
            <View style={styles.customerInfoContainer}>
              <Text style={styles.customerName}>{customerName}</Text>
              <Text style={styles.customerPhone}>{profile?.phone || 'Телефон не указан'}</Text>
            </View>
            <Ionicons name="call" size={20} color={Colors.light.primary} />
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
          <Ionicons name={expandedOrders.includes(item.id) ? "chevron-up" : "chevron-down"} size={16} color={Colors.light.primary} />
        </TouchableOpacity>

        {expandedOrders.includes(item.id) && item.items && (
          <View style={styles.itemsContainer}>
            {item.items.map((orderItem) => (
              <View key={orderItem.id} style={styles.itemRow}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {orderItem.product?.name || 'Неизвестный товар'} <Text style={styles.itemQty}>x{orderItem.quantity}</Text>
                </Text>
                <Text style={styles.itemPrice}>{orderItem.price_at_time * orderItem.quantity} ₽</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: statusInfo.color }]}
          onPress={() => showStatusOptions(item.id, item.status)}
        >
          <Text style={styles.actionButtonText}>Изменить статус</Text>
        </TouchableOpacity>
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
  centerContainer: { justifyContent: 'center', alignItems: 'center' },
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
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.m },
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
  actionButton: { paddingVertical: 12, borderRadius: Radius.m, alignItems: 'center' },
  actionButtonText: { color: Colors.light.card, fontSize: 14, fontWeight: '700' },
  empty: { textAlign: 'center', marginTop: 100, color: Colors.light.textSecondary },
  expandButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.s, marginBottom: Spacing.s, backgroundColor: Colors.light.infoLight, borderRadius: Radius.m },
  expandButtonText: { color: Colors.light.primary, fontSize: 13, fontWeight: '600', marginRight: 4 },
  itemsContainer: { backgroundColor: Colors.light.background, borderRadius: Radius.m, padding: Spacing.m, marginBottom: Spacing.m },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'flex-start' },
  itemName: { flex: 1, fontSize: 13, color: Colors.light.text, paddingRight: Spacing.m },
  itemQty: { fontWeight: '700', color: Colors.light.textSecondary },
  itemPrice: { fontSize: 13, fontWeight: '700', color: Colors.light.text },
});
