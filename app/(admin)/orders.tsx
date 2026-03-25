import { Colors, Radius, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const STATUSES = {
  pending: { label: 'Новый', color: '#F59E0B' },
  processing: { label: 'Сборка', color: '#3B82F6' },
  shipped: { label: 'В пути', color: '#8B5CF6' },
  delivered: { label: 'Доставлен', color: '#10B981' },
  cancelled: { label: 'Отменен', color: '#EF4444' }
};

type OrderStatus = keyof typeof STATUSES;

interface OrderWithDetails {
  id: string;
  status: OrderStatus;
  total_amount: number;
  delivery_address: string;
  created_at: string;
  profiles: { first_name: string; last_name: string; phone: string } | { first_name: string; last_name: string; phone: string }[];
  items?: Array<{
    id: string;
    quantity: number;
    price_at_time: number;
    product?: { name: string };
  }>;
}

export default function ManageOrdersScreen() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
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
    // Join with profiles to get user info 
    const { data, error } = await supabase
      .from('orders')
      .select('*, profiles:user_id (first_name, last_name, phone), items:order_items(*, product:products(*))')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
    setLoading(false);
  };

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      Alert.alert('Ошибка', error.message);
    } else {
      // Optimistic update
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    }
  };

  const showStatusOptions = (orderId: string, currentStatus: string) => {
    Alert.alert(
      'Изменить статус',
      'Выберите новый статус для заказа',
      [
        { text: 'Сборка', onPress: () => updateStatus(orderId, 'processing') },
        { text: 'В пути', onPress: () => updateStatus(orderId, 'shipped') },
        { text: 'Доставлен', onPress: () => updateStatus(orderId, 'delivered') },
        { text: 'Отмена', onPress: () => updateStatus(orderId, 'cancelled'), style: 'destructive' },
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

  const renderOrder = ({ item }: { item: OrderWithDetails }) => {
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
            <View style={{ marginLeft: 8, flex: 1 }}>
              <Text style={styles.customerName}>{customerName}</Text>
              <Text style={styles.customerPhone}>{profile?.phone || 'Телефон не указан'}</Text>
            </View>
            <Ionicons name="call" size={20} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.addressBox}>
          <Ionicons name="location" size={16} color={Colors.light.textSecondary} />
          <Text style={styles.addressText} numberOfLines={2}>{item.delivery_address}</Text>
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
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
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
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  list: { padding: Spacing.m, paddingBottom: 60 },
  card: {
    backgroundColor: '#fff',
    borderRadius: Radius.l,
    padding: Spacing.m,
    marginBottom: Spacing.m,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.m },
  orderId: { fontSize: 16, fontWeight: '700', color: Colors.light.text },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.m },
  statusText: { fontSize: 12, fontWeight: '700' },
  customerInfo: { marginBottom: Spacing.s },
  customerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 10, borderRadius: Radius.m },
  customerName: { fontSize: 14, fontWeight: '600', color: Colors.light.text },
  customerPhone: { fontSize: 12, color: Colors.light.textSecondary, marginTop: 2 },
  addressBox: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.m },
  addressText: { fontSize: 13, color: Colors.light.textSecondary, marginLeft: 6, flex: 1, lineHeight: 18 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.m, borderTopWidth: 1, borderTopColor: Colors.light.borderLight, paddingTop: Spacing.s },
  price: { fontSize: 18, fontWeight: '800', color: Colors.light.text },
  date: { fontSize: 12, color: Colors.light.textLight },
  actionButton: { paddingVertical: 12, borderRadius: Radius.m, alignItems: 'center' },
  actionButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  empty: { textAlign: 'center', marginTop: 100, color: Colors.light.textSecondary },
  expandButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.s, marginBottom: Spacing.s, backgroundColor: '#EFF6FF', borderRadius: Radius.m },
  expandButtonText: { color: Colors.light.primary, fontSize: 13, fontWeight: '600', marginRight: 4 },
  itemsContainer: { backgroundColor: '#F9FAFB', borderRadius: Radius.m, padding: Spacing.m, marginBottom: Spacing.m },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'flex-start' },
  itemName: { flex: 1, fontSize: 13, color: Colors.light.text, paddingRight: Spacing.m },
  itemQty: { fontWeight: '700', color: Colors.light.textSecondary },
  itemPrice: { fontSize: 13, fontWeight: '700', color: Colors.light.text },
});
